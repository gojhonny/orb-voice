import type {
  OrbVColorOverrides,
  OrbVColors,
  OrbVPresetName,
  OrbVReducedMotion,
  OrbVSize,
  OrbVState
} from '@core/appearance/appearance.types'
import { mergeOrbVColors } from '@core/appearance/merge-colors.compute'
import {
  DEFAULT_ORBV_REDUCED_MOTION,
  ORBV_COLOR_ATTRIBUTES,
  ORBV_COLOR_KEYS,
  ORBV_PRESETS
} from '@core/config.data'
import { normalizeOrbVPreset } from '@core/lib/normalize-preset.compute'
import { normalizeOrbVReducedMotion } from '@core/lib/normalize-reduced-motion.compute'
import { normalizeOrbVSize } from '@core/lib/normalize-size.compute'
import { normalizeOrbVSpeed } from '@core/lib/normalize-speed.compute'
import { normalizeOrbVState } from '@core/lib/normalize-state.compute'
import { ORBV_OBSERVED_ATTRIBUTES } from '@element/element.data'
import type { OrbVElement, OrbVElementConstructor } from '@element/element.types'
import { orbvShadowTreeFactory } from '@factories/shadow-tree.factory'
import type { OrbVConversationState } from '@ports/conversation.port'
import type { OrbVIntelligencePort } from '@ports/intelligence.port'
import type { OrbVVoiceEnginePort } from '@ports/voice-engine.port'
import { OrbVAnimationService } from '@services/animation.service'
import { OrbVConversationRunnerService } from '@services/conversation-runner.service'
import { OrbVTalkRunnerService } from '@services/talk-runner.service'
import {
  createDefaultOrbVVoiceModel,
  createOrbVConversation,
  createOrbVVoiceEngine
} from '@services/voice-model.service'
import { normalizeRealtimeSession } from '@talk/normalize-realtime-session.compute'
import { normalizeVoiceModel } from '@talk/normalize-voice-model.compute'
import { DEFAULT_TALK_FLOW } from '@talk/talk.data'
import type { OrbVTalkContext, OrbVTalkStep } from '@talk/talk.types'
import type { OrbVRealtimeSession, OrbVVoiceModel } from '@talk/voice-model.types'

const ELEMENT_CONSTRUCTORS = new WeakMap<object, OrbVElementConstructor>()

/**
 * Creates the OrbV custom-element class only when a DOM implementation exists.
 * Importing this module on a server never evaluates an HTMLElement subclass.
 */
export function orbvElementClassFactory(): OrbVElementConstructor | undefined {
  if (typeof globalThis.HTMLElement === 'undefined') {
    return undefined
  }

  const HTMLElementBase = globalThis.HTMLElement
  const existingConstructor = ELEMENT_CONSTRUCTORS.get(HTMLElementBase)
  if (existingConstructor) {
    return existingConstructor
  }

  class OrbVHTMLElement extends HTMLElementBase implements OrbVElement {
    static readonly observedAttributes = ORBV_OBSERVED_ATTRIBUTES

    readonly #animationService: OrbVAnimationService
    readonly #conversationRunner: OrbVConversationRunnerService
    readonly #talkRunner: OrbVTalkRunnerService
    readonly #visualRoot: HTMLElement
    #activationAbortController: AbortController | undefined
    #colorConflictCheckQueued = false
    #connected = false
    #customVoiceEngine: OrbVVoiceEnginePort | undefined
    #hasColorConflict = false
    #motionQuery: MediaQueryList | undefined
    #speaking = false
    #stateBeforeConversation: OrbVState | undefined
    #stateBeforeSpeech: OrbVState | undefined
    #talkFlow: readonly OrbVTalkStep[] = DEFAULT_TALK_FLOW
    #voiceModel: Readonly<OrbVVoiceModel> | undefined = createDefaultOrbVVoiceModel()
    #realtimeSession: OrbVRealtimeSession | undefined

    readonly #handleMotionPreferenceChange = (): void => {
      if (this.reducedMotion === 'system') {
        this.#renderMotion()
      }
    }

    constructor() {
      super()

      const shadowRoot = this.attachShadow({ mode: 'closed' })
      const shadowTree = orbvShadowTreeFactory(shadowRoot, this.ownerDocument)

      this.#visualRoot = shadowTree.root
      this.#animationService = new OrbVAnimationService(this.#visualRoot, shadowTree.layers)
      this.#talkRunner = new OrbVTalkRunnerService(
        this.#handleSpeakingChange.bind(this),
        this.#handleTalkError.bind(this)
      )
      this.#conversationRunner = new OrbVConversationRunnerService({
        onStateChange: this.#handleConversationState.bind(this),
        onTranscript: (transcript) => {
          this.dispatchEvent(new CustomEvent('orbv-transcript', { detail: transcript }))
        },
        onError: (error) => {
          this.dispatchEvent(
            new CustomEvent('orbv-talk-error', {
              detail: Object.freeze({ error })
            })
          )
        }
      })
      this.#talkRunner.voiceEngine = createOrbVVoiceEngine(this.#voiceModel)
    }

    get intelligence(): OrbVIntelligencePort | undefined {
      return this.#talkRunner.intelligence
    }

    set intelligence(value: OrbVIntelligencePort | undefined) {
      if (value !== undefined && typeof value.respond !== 'function') {
        throw new TypeError('OrbV intelligence must implement respond().')
      }

      this.#talkRunner.intelligence = value
    }

    get talkContext(): Readonly<OrbVTalkContext> {
      return this.#talkRunner.context
    }

    get talkFlow(): readonly OrbVTalkStep[] {
      return Object.freeze([...this.#talkFlow])
    }

    set talkFlow(value: readonly OrbVTalkStep[] | undefined) {
      const flow = value ?? DEFAULT_TALK_FLOW
      if (!Array.isArray(flow)) {
        throw new TypeError('OrbV talkFlow must be an array of talk steps.')
      }

      this.#talkFlow = [...flow]
    }

    get voiceEngine(): OrbVVoiceEnginePort | undefined {
      return this.#talkRunner.voiceEngine
    }

    set voiceEngine(value: OrbVVoiceEnginePort | undefined) {
      if (
        value !== undefined &&
        (typeof value.speak !== 'function' || typeof value.stop !== 'function')
      ) {
        throw new TypeError('OrbV voiceEngine must implement speak() and stop().')
      }

      this.stopTalking()
      this.stopConversation()
      this.#customVoiceEngine = value
      this.#talkRunner.voiceEngine = value ?? createOrbVVoiceEngine(this.#voiceModel)
    }

    get voiceModel(): Readonly<OrbVVoiceModel> | undefined {
      return this.#voiceModel
    }

    set voiceModel(value: OrbVVoiceModel | null | undefined) {
      const model = normalizeVoiceModel(value)
      const engine = this.#customVoiceEngine ?? createOrbVVoiceEngine(model)
      this.stopTalking()
      this.stopConversation()
      this.#voiceModel = model
      this.#talkRunner.voiceEngine = engine
    }

    get realtimeSession(): OrbVRealtimeSession | undefined {
      return this.#realtimeSession
    }

    set realtimeSession(value: OrbVRealtimeSession | undefined) {
      const session = normalizeRealtimeSession(value)
      this.stopConversation()
      this.#realtimeSession = session
    }

    get conversationState(): OrbVConversationState {
      return this.#conversationRunner.state
    }

    get elevated(): boolean {
      return this.hasAttribute('elevated')
    }

    set elevated(value: boolean) {
      this.toggleAttribute('elevated', Boolean(value))
    }

    get preset(): OrbVPresetName {
      return normalizeOrbVPreset(this.getAttribute('preset'))
    }

    set preset(value: OrbVPresetName | null | undefined) {
      if (value === null || value === undefined) {
        this.removeAttribute('preset')
        return
      }

      this.setAttribute('preset', normalizeOrbVPreset(value))
    }

    get paused(): boolean {
      return this.hasAttribute('paused')
    }

    set paused(value: boolean) {
      this.toggleAttribute('paused', Boolean(value))
    }

    get reducedMotion(): OrbVReducedMotion {
      return normalizeOrbVReducedMotion(this.getAttribute('reduced-motion'))
    }

    set reducedMotion(value: OrbVReducedMotion) {
      this.setAttribute('reduced-motion', normalizeOrbVReducedMotion(value))
    }

    get size(): string {
      return normalizeOrbVSize(this.getAttribute('size'))
    }

    set size(value: OrbVSize) {
      this.setAttribute('size', normalizeOrbVSize(value))
    }

    get speech(): string | undefined {
      return normalizeSpeech(this.getAttribute('speech'))
    }

    set speech(value: string | null | undefined) {
      const normalized = normalizeSpeech(value)
      if (normalized === undefined) {
        this.removeAttribute('speech')
        return
      }

      this.setAttribute('speech', normalized)
    }

    get speed(): number {
      return normalizeOrbVSpeed(this.getAttribute('speed'))
    }

    set speed(value: number) {
      this.setAttribute('speed', String(normalizeOrbVSpeed(value)))
    }

    get state(): OrbVState {
      return normalizeOrbVState(this.getAttribute('state'))
    }

    set state(value: OrbVState) {
      this.setAttribute('state', normalizeOrbVState(value))
    }

    connectedCallback(): void {
      if (this.#connected) {
        return
      }

      this.#connected = true
      this.#upgradeVoiceProperties()
      this.#connectMotionPreference()
      this.#synchronizePresentationAttributes()
      this.#renderMotion()
    }

    disconnectedCallback(): void {
      this.stopTalking()
      this.stopConversation()
      if (!this.#connected) {
        return
      }

      this.#connected = false
      this.#disconnectMotionPreference()
      this.#animationService.dispose()
    }

    attributeChangedCallback(name: string, oldValue: string | null, newValue: string | null): void {
      if (oldValue === newValue) {
        return
      }

      if (name === 'size') {
        this.#synchronizeSize(newValue)
        return
      }

      const colorKey = colorKeyForAttribute(name)
      if (colorKey) {
        if (!this.#normalizeColorAttribute(colorKey, newValue)) {
          return
        }
        this.#synchronizeColors()
        return
      }

      if (name === 'preset') {
        if (newValue !== null) {
          const normalized = normalizeOrbVPreset(newValue)
          if (newValue !== normalized) {
            this.setAttribute(name, normalized)
            return
          }
        }
        this.#synchronizeColors()
        return
      }

      if (name === 'elevated') {
        return
      }

      if (name === 'speech') {
        const normalized = normalizeSpeech(newValue)
        if (normalized === undefined) {
          if (newValue !== null) {
            this.removeAttribute(name)
          }
          return
        }
        if (newValue !== normalized) {
          this.setAttribute(name, normalized)
        }
        return
      }

      if (name === 'state' && newValue !== null) {
        const normalized = normalizeOrbVState(newValue)
        if (newValue !== normalized) {
          this.setAttribute(name, normalized)
          return
        }
      }

      if (name === 'speed' && newValue !== null) {
        const normalized = String(normalizeOrbVSpeed(newValue))
        if (newValue !== normalized) {
          this.setAttribute(name, normalized)
          return
        }
      }

      if (name === 'reduced-motion' && newValue !== null) {
        const normalized = normalizeOrbVReducedMotion(newValue)
        if (newValue !== normalized) {
          this.setAttribute(name, normalized)
          return
        }
      }

      if (!this.#connected) {
        return
      }

      if (name === 'paused') {
        if (newValue === null) {
          this.#animationService.play()
        } else {
          this.#animationService.pause()
        }
        return
      }

      this.#renderMotion()
    }

    play(): void {
      if (this.paused) {
        this.paused = false
      } else {
        this.#animationService.play()
      }
    }

    pause(): void {
      if (!this.paused) {
        this.paused = true
      } else {
        this.#animationService.pause()
      }
    }

    restart(): void {
      if (this.#connected) {
        this.#renderMotion()
      }
    }

    receive(input: string): Promise<void> {
      return this.#talkRunner.receive(input)
    }

    startTalking(): Promise<void> {
      this.stopConversation()
      this.#activationAbortController?.abort()
      this.#activationAbortController = undefined

      const speech = this.speech
      if (speech !== undefined) {
        return this.#talkRunner.speak(speech)
      }
      if (this.#talkFlow.length > 0) {
        return this.#talkRunner.start(this.#talkFlow)
      }

      return Promise.resolve()
    }

    stopTalking(): void {
      this.#activationAbortController?.abort()
      this.#activationAbortController = undefined
      this.#talkRunner.stop()
    }

    async startConversation(): Promise<void> {
      this.stopTalking()
      this.stopConversation()
      if (this.#customVoiceEngine) {
        const error = new Error(
          'Clear the custom voiceEngine before starting a voiceModel conversation.'
        )
        this.#handleTalkError(error)
        throw error
      }
      let conversation: ReturnType<typeof createOrbVConversation>
      try {
        conversation = createOrbVConversation(this.#voiceModel, this.#realtimeSession)
      } catch {
        const error = new Error(
          'OrbV startConversation() requires a Realtime voiceModel and realtimeSession.'
        )
        this.#handleTalkError(error)
        throw error
      }
      this.#stateBeforeConversation = this.state
      await this.#conversationRunner.start(conversation)
    }

    stopConversation(): void {
      this.#conversationRunner.stop()
    }

    interruptConversation(): void {
      this.#conversationRunner.interrupt()
    }

    #handleConversationState(state: OrbVConversationState): void {
      this.#handleSpeakingChange(state === 'speaking')
      if (state === 'idle' || state === 'error') {
        const previous = this.#stateBeforeConversation
        this.#stateBeforeConversation = undefined
        if (previous) {
          this.state = previous
        }
      } else {
        this.state = state === 'connecting' ? 'thinking' : state
      }
      this.dispatchEvent(
        new CustomEvent('orbv-conversation-state-change', {
          detail: Object.freeze({ state })
        })
      )
    }

    #upgradeVoiceProperties(): void {
      // Recover properties assigned before customElements.define() upgraded the host.
      for (const property of ['voiceModel', 'realtimeSession', 'voiceEngine'] as const) {
        if (Object.hasOwn(this, property)) {
          const value: unknown = Reflect.get(this, property)
          if (Reflect.deleteProperty(this, property)) {
            Reflect.set(this, property, value)
          }
        }
      }
    }

    #waitForTalkActivation(): void {
      if (this.#activationAbortController || !this.#connected) {
        return
      }

      const abortController = new AbortController()
      const handleActivation = (): void => {
        abortController.abort()
        if (this.#activationAbortController === abortController) {
          this.#activationAbortController = undefined
        }

        queueMicrotask(() => {
          if (this.#connected) {
            void this.startTalking()
          }
        })
      }
      const options = {
        capture: true,
        once: true,
        signal: abortController.signal
      } as const

      this.#activationAbortController = abortController
      this.ownerDocument.addEventListener('keydown', handleActivation, options)
      this.ownerDocument.addEventListener('pointerdown', handleActivation, options)
      this.ownerDocument.addEventListener('touchend', handleActivation, options)
    }

    #connectMotionPreference(): void {
      if (typeof globalThis.matchMedia !== 'function') {
        return
      }

      this.#motionQuery = globalThis.matchMedia('(prefers-reduced-motion: reduce)')
      if (typeof this.#motionQuery.addEventListener === 'function') {
        this.#motionQuery.addEventListener('change', this.#handleMotionPreferenceChange)
      } else {
        this.#motionQuery.addListener(this.#handleMotionPreferenceChange)
      }
    }

    #disconnectMotionPreference(): void {
      if (typeof this.#motionQuery?.removeEventListener === 'function') {
        this.#motionQuery.removeEventListener('change', this.#handleMotionPreferenceChange)
      } else {
        this.#motionQuery?.removeListener(this.#handleMotionPreferenceChange)
      }
      this.#motionQuery = undefined
    }

    #synchronizePresentationAttributes(): void {
      this.#synchronizeSize(this.getAttribute('size'))

      const presetAttribute = this.getAttribute('preset')
      if (presetAttribute !== null) {
        const normalized = normalizeOrbVPreset(presetAttribute)
        if (presetAttribute !== normalized) {
          this.setAttribute('preset', normalized)
        }
      }

      for (const key of ORBV_COLOR_KEYS) {
        this.#normalizeColorAttribute(key, this.getAttribute(ORBV_COLOR_ATTRIBUTES[key]))
      }

      this.#synchronizeColors()
    }

    #synchronizeSize(value: string | null): void {
      const normalized = normalizeOrbVSize(value)
      if (value !== null && value !== normalized) {
        this.setAttribute('size', normalized)
        return
      }

      this.#visualRoot.style.setProperty('--orbv-size', normalized)
    }

    #normalizeColorAttribute(key: keyof OrbVColors, value: string | null): boolean {
      if (value === null) {
        return true
      }

      const normalized = value.trim()
      const attribute = ORBV_COLOR_ATTRIBUTES[key]
      if (normalized.length === 0) {
        this.removeAttribute(attribute)
        return false
      }

      if (value !== normalized) {
        this.setAttribute(attribute, normalized)
        return false
      }

      return true
    }

    #synchronizeColors(): void {
      const hasExplicitPreset = this.hasAttribute('preset')
      const colors = hasExplicitPreset
        ? { ...ORBV_PRESETS[this.preset] }
        : mergeOrbVColors(this.#readColorOverrides())

      for (const key of ORBV_COLOR_KEYS) {
        this.#visualRoot.style.setProperty(`--orbv-${key}`, colors[key])
      }

      this.#queueColorConflictCheck()
    }

    #queueColorConflictCheck(): void {
      if (this.#colorConflictCheckQueued) {
        return
      }

      this.#colorConflictCheckQueued = true
      queueMicrotask(() => {
        this.#colorConflictCheckQueued = false
        const customAttributes = ORBV_COLOR_KEYS.filter((key) =>
          this.hasAttribute(ORBV_COLOR_ATTRIBUTES[key])
        )
        const hasConflict = this.hasAttribute('preset') && customAttributes.length > 0

        if (hasConflict && !this.#hasColorConflict) {
          const names = customAttributes.map((key) => ORBV_COLOR_ATTRIBUTES[key]).join(', ')
          console.error(
            `[OrbV] preset='${this.preset}' cannot be combined with ` +
              `${names}. ` +
              'The preset is applied and custom color attributes are ignored.'
          )
        }
        this.#hasColorConflict = hasConflict
      })
    }

    #readColorOverrides(): OrbVColorOverrides {
      const overrides: OrbVColorOverrides = {}
      for (const key of ORBV_COLOR_KEYS) {
        const value = this.getAttribute(ORBV_COLOR_ATTRIBUTES[key])
        if (value !== null) {
          overrides[key] = value
        }
      }
      return overrides
    }

    #handleSpeakingChange(speaking: boolean): void {
      if (this.#speaking === speaking) {
        return
      }

      this.#speaking = speaking

      if (speaking) {
        if (this.state !== 'speaking') {
          this.#stateBeforeSpeech = this.state
          this.state = 'speaking'
        }
      } else {
        const stateBeforeSpeech = this.#stateBeforeSpeech
        this.#stateBeforeSpeech = undefined

        if (stateBeforeSpeech && this.state === 'speaking') {
          this.state = stateBeforeSpeech
        }
      }

      this.dispatchEvent(
        new CustomEvent('orbv-speaking-change', {
          detail: Object.freeze({ speaking })
        })
      )
    }

    #handleTalkError(error: unknown): void {
      if (isSpeechActivationError(error)) {
        this.#waitForTalkActivation()
      }

      this.dispatchEvent(
        new CustomEvent('orbv-talk-error', {
          detail: Object.freeze({ error })
        })
      )
    }

    #renderMotion(): void {
      if (!this.#connected) {
        return
      }

      const reducedMotion = this.reducedMotion
      const reduced =
        reducedMotion === 'always' ||
        (reducedMotion === DEFAULT_ORBV_REDUCED_MOTION && (this.#motionQuery?.matches ?? false))

      this.#animationService.render({
        paused: this.paused,
        reduced,
        speed: this.speed,
        state: this.state
      })
    }
  }

  const elementConstructor = OrbVHTMLElement as unknown as OrbVElementConstructor
  ELEMENT_CONSTRUCTORS.set(HTMLElementBase, elementConstructor)

  return elementConstructor
}

function normalizeSpeech(value: string | null | undefined): string | undefined {
  const normalized = value?.trim()
  return normalized && normalized.length > 0 ? normalized : undefined
}

function colorKeyForAttribute(name: string): keyof OrbVColors | undefined {
  return ORBV_COLOR_KEYS.find((key) => ORBV_COLOR_ATTRIBUTES[key] === name)
}

function isSpeechActivationError(error: unknown): boolean {
  if (!(error instanceof Error)) {
    return false
  }

  return (
    error.name === 'NotAllowedError' ||
    error.name === 'SpeechSynthesisStartError' ||
    /autoplay|not[- ]allowed|user (?:gesture|interaction)/i.test(error.message)
  )
}
