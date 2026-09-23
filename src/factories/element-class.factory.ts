import type {
  OrbVoiceColorOverrides,
  OrbVoiceColors,
  OrbVoicePresetName,
  OrbVoiceReducedMotion,
  OrbVoiceSize,
  OrbVoiceState
} from '@core/appearance/appearance.types'
import { mergeOrbVoiceColors } from '@core/appearance/merge-colors.compute'
import {
  DEFAULT_ORB_VOICE_REDUCED_MOTION,
  ORB_VOICE_COLOR_ATTRIBUTES,
  ORB_VOICE_COLOR_KEYS,
  ORB_VOICE_PRESETS
} from '@core/config.data'
import { normalizeOrbVoicePreset } from '@core/lib/normalize-preset.compute'
import { normalizeOrbVoiceReducedMotion } from '@core/lib/normalize-reduced-motion.compute'
import { normalizeOrbVoiceSize } from '@core/lib/normalize-size.compute'
import { normalizeOrbVoiceSpeed } from '@core/lib/normalize-speed.compute'
import { normalizeOrbVoiceState } from '@core/lib/normalize-state.compute'
import { ORB_VOICE_OBSERVED_ATTRIBUTES } from '@element/element.data'
import type { OrbVoiceElement, OrbVoiceElementConstructor } from '@element/element.types'
import { orbVoiceShadowTreeFactory } from '@factories/shadow-tree.factory'
import type { OrbVoiceConversationState } from '@ports/conversation.port'
import type { OrbVoiceIntelligencePort } from '@ports/intelligence.port'
import type { OrbVoiceVoiceEnginePort } from '@ports/voice-engine.port'
import { OrbVoiceAnimationService } from '@services/animation.service'
import { OrbVoiceConversationRunnerService } from '@services/conversation-runner.service'
import { OrbVoiceTalkRunnerService } from '@services/talk-runner.service'
import {
  createDefaultOrbVoiceVoiceModel,
  createOrbVoiceConversation,
  createOrbVoiceVoiceEngine
} from '@services/voice-model.service'
import { normalizeRealtimeSession } from '@talk/normalize-realtime-session.compute'
import { normalizeVoiceModel } from '@talk/normalize-voice-model.compute'
import { DEFAULT_TALK_FLOW } from '@talk/talk.data'
import type { OrbVoiceTalkContext, OrbVoiceTalkStep } from '@talk/talk.types'
import type { OrbVoiceRealtimeSession, OrbVoiceVoiceModel } from '@talk/voice-model.types'

const ELEMENT_CONSTRUCTORS = new WeakMap<object, OrbVoiceElementConstructor>()

/**
 * Creates the Orb Voice custom-element class only when a DOM implementation exists.
 * Importing this module on a server never evaluates an HTMLElement subclass.
 */
export function orbVoiceElementClassFactory(): OrbVoiceElementConstructor | undefined {
  if (typeof globalThis.HTMLElement === 'undefined') {
    return undefined
  }

  const HTMLElementBase = globalThis.HTMLElement
  const existingConstructor = ELEMENT_CONSTRUCTORS.get(HTMLElementBase)
  if (existingConstructor) {
    return existingConstructor
  }

  class OrbVoiceHTMLElement extends HTMLElementBase implements OrbVoiceElement {
    static readonly observedAttributes = ORB_VOICE_OBSERVED_ATTRIBUTES

    readonly #animationService: OrbVoiceAnimationService
    readonly #conversationRunner: OrbVoiceConversationRunnerService
    readonly #talkRunner: OrbVoiceTalkRunnerService
    readonly #visualRoot: HTMLElement
    #activationAbortController: AbortController | undefined
    #colorConflictCheckQueued = false
    #connected = false
    #customVoiceEngine: OrbVoiceVoiceEnginePort | undefined
    #hasColorConflict = false
    #motionQuery: MediaQueryList | undefined
    #speaking = false
    #stateBeforeConversation: OrbVoiceState | undefined
    #stateBeforeSpeech: OrbVoiceState | undefined
    #talkFlow: readonly OrbVoiceTalkStep[] = DEFAULT_TALK_FLOW
    #voiceModel: Readonly<OrbVoiceVoiceModel> | undefined = createDefaultOrbVoiceVoiceModel()
    #realtimeSession: OrbVoiceRealtimeSession | undefined

    readonly #handleMotionPreferenceChange = (): void => {
      if (this.reducedMotion === 'system') {
        this.#renderMotion()
      }
    }

    constructor() {
      super()

      const shadowRoot = this.attachShadow({ mode: 'closed' })
      const shadowTree = orbVoiceShadowTreeFactory(shadowRoot, this.ownerDocument)

      this.#visualRoot = shadowTree.root
      this.#animationService = new OrbVoiceAnimationService(this.#visualRoot, shadowTree.layers)
      this.#talkRunner = new OrbVoiceTalkRunnerService(
        this.#handleSpeakingChange.bind(this),
        this.#handleTalkError.bind(this)
      )
      this.#conversationRunner = new OrbVoiceConversationRunnerService({
        onStateChange: this.#handleConversationState.bind(this),
        onTranscript: (transcript) => {
          this.dispatchEvent(new CustomEvent('orb-voice-transcript', { detail: transcript }))
        },
        onError: (error) => {
          this.dispatchEvent(
            new CustomEvent('orb-voice-talk-error', {
              detail: Object.freeze({ error })
            })
          )
        }
      })
      this.#talkRunner.voiceEngine = createOrbVoiceVoiceEngine(this.#voiceModel)
    }

    get intelligence(): OrbVoiceIntelligencePort | undefined {
      return this.#talkRunner.intelligence
    }

    set intelligence(value: OrbVoiceIntelligencePort | undefined) {
      if (value !== undefined && typeof value.respond !== 'function') {
        throw new TypeError('Orb Voice intelligence must implement respond().')
      }

      this.#talkRunner.intelligence = value
    }

    get talkContext(): Readonly<OrbVoiceTalkContext> {
      return this.#talkRunner.context
    }

    get talkFlow(): readonly OrbVoiceTalkStep[] {
      return Object.freeze([...this.#talkFlow])
    }

    set talkFlow(value: readonly OrbVoiceTalkStep[] | undefined) {
      const flow = value ?? DEFAULT_TALK_FLOW
      if (!Array.isArray(flow)) {
        throw new TypeError('Orb Voice talkFlow must be an array of talk steps.')
      }

      this.#talkFlow = [...flow]
    }

    get voiceEngine(): OrbVoiceVoiceEnginePort | undefined {
      return this.#talkRunner.voiceEngine
    }

    set voiceEngine(value: OrbVoiceVoiceEnginePort | undefined) {
      if (
        value !== undefined &&
        (typeof value.speak !== 'function' || typeof value.stop !== 'function')
      ) {
        throw new TypeError('Orb Voice voiceEngine must implement speak() and stop().')
      }

      this.stopTalking()
      this.stopConversation()
      this.#customVoiceEngine = value
      this.#talkRunner.voiceEngine = value ?? createOrbVoiceVoiceEngine(this.#voiceModel)
    }

    get voiceModel(): Readonly<OrbVoiceVoiceModel> | undefined {
      return this.#voiceModel
    }

    set voiceModel(value: OrbVoiceVoiceModel | null | undefined) {
      const model = normalizeVoiceModel(value)
      const engine = this.#customVoiceEngine ?? createOrbVoiceVoiceEngine(model)
      this.stopTalking()
      this.stopConversation()
      this.#voiceModel = model
      this.#talkRunner.voiceEngine = engine
    }

    get realtimeSession(): OrbVoiceRealtimeSession | undefined {
      return this.#realtimeSession
    }

    set realtimeSession(value: OrbVoiceRealtimeSession | undefined) {
      const session = normalizeRealtimeSession(value)
      this.stopConversation()
      this.#realtimeSession = session
    }

    get conversationState(): OrbVoiceConversationState {
      return this.#conversationRunner.state
    }

    get elevated(): boolean {
      return this.hasAttribute('elevated')
    }

    set elevated(value: boolean) {
      this.toggleAttribute('elevated', Boolean(value))
    }

    get preset(): OrbVoicePresetName {
      return normalizeOrbVoicePreset(this.getAttribute('preset'))
    }

    set preset(value: OrbVoicePresetName | null | undefined) {
      if (value === null || value === undefined) {
        this.removeAttribute('preset')
        return
      }

      this.setAttribute('preset', normalizeOrbVoicePreset(value))
    }

    get paused(): boolean {
      return this.hasAttribute('paused')
    }

    set paused(value: boolean) {
      this.toggleAttribute('paused', Boolean(value))
    }

    get reducedMotion(): OrbVoiceReducedMotion {
      return normalizeOrbVoiceReducedMotion(this.getAttribute('reduced-motion'))
    }

    set reducedMotion(value: OrbVoiceReducedMotion) {
      this.setAttribute('reduced-motion', normalizeOrbVoiceReducedMotion(value))
    }

    get size(): string {
      return normalizeOrbVoiceSize(this.getAttribute('size'))
    }

    set size(value: OrbVoiceSize) {
      this.setAttribute('size', normalizeOrbVoiceSize(value))
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
      return normalizeOrbVoiceSpeed(this.getAttribute('speed'))
    }

    set speed(value: number) {
      this.setAttribute('speed', String(normalizeOrbVoiceSpeed(value)))
    }

    get state(): OrbVoiceState {
      return normalizeOrbVoiceState(this.getAttribute('state'))
    }

    set state(value: OrbVoiceState) {
      this.setAttribute('state', normalizeOrbVoiceState(value))
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
          const normalized = normalizeOrbVoicePreset(newValue)
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
        const normalized = normalizeOrbVoiceState(newValue)
        if (newValue !== normalized) {
          this.setAttribute(name, normalized)
          return
        }
      }

      if (name === 'speed' && newValue !== null) {
        const normalized = String(normalizeOrbVoiceSpeed(newValue))
        if (newValue !== normalized) {
          this.setAttribute(name, normalized)
          return
        }
      }

      if (name === 'reduced-motion' && newValue !== null) {
        const normalized = normalizeOrbVoiceReducedMotion(newValue)
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
      let conversation: ReturnType<typeof createOrbVoiceConversation>
      try {
        conversation = createOrbVoiceConversation(this.#voiceModel, this.#realtimeSession)
      } catch {
        const error = new Error(
          'Orb Voice startConversation() requires a Realtime voiceModel and realtimeSession.'
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

    #handleConversationState(state: OrbVoiceConversationState): void {
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
        new CustomEvent('orb-voice-conversation-state-change', {
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
        const normalized = normalizeOrbVoicePreset(presetAttribute)
        if (presetAttribute !== normalized) {
          this.setAttribute('preset', normalized)
        }
      }

      for (const key of ORB_VOICE_COLOR_KEYS) {
        this.#normalizeColorAttribute(key, this.getAttribute(ORB_VOICE_COLOR_ATTRIBUTES[key]))
      }

      this.#synchronizeColors()
    }

    #synchronizeSize(value: string | null): void {
      const normalized = normalizeOrbVoiceSize(value)
      if (value !== null && value !== normalized) {
        this.setAttribute('size', normalized)
        return
      }

      this.#visualRoot.style.setProperty('--orb-voice-size', normalized)
    }

    #normalizeColorAttribute(key: keyof OrbVoiceColors, value: string | null): boolean {
      if (value === null) {
        return true
      }

      const normalized = value.trim()
      const attribute = ORB_VOICE_COLOR_ATTRIBUTES[key]
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
        ? { ...ORB_VOICE_PRESETS[this.preset] }
        : mergeOrbVoiceColors(this.#readColorOverrides())

      for (const key of ORB_VOICE_COLOR_KEYS) {
        this.#visualRoot.style.setProperty(`--orb-voice-${key}`, colors[key])
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
        const customAttributes = ORB_VOICE_COLOR_KEYS.filter((key) =>
          this.hasAttribute(ORB_VOICE_COLOR_ATTRIBUTES[key])
        )
        const hasConflict = this.hasAttribute('preset') && customAttributes.length > 0

        if (hasConflict && !this.#hasColorConflict) {
          const names = customAttributes.map((key) => ORB_VOICE_COLOR_ATTRIBUTES[key]).join(', ')
          console.error(
            `[Orb Voice] preset='${this.preset}' cannot be combined with ` +
              `${names}. ` +
              'The preset is applied and custom color attributes are ignored.'
          )
        }
        this.#hasColorConflict = hasConflict
      })
    }

    #readColorOverrides(): OrbVoiceColorOverrides {
      const overrides: OrbVoiceColorOverrides = {}
      for (const key of ORB_VOICE_COLOR_KEYS) {
        const value = this.getAttribute(ORB_VOICE_COLOR_ATTRIBUTES[key])
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
        new CustomEvent('orb-voice-speaking-change', {
          detail: Object.freeze({ speaking })
        })
      )
    }

    #handleTalkError(error: unknown): void {
      if (isSpeechActivationError(error)) {
        this.#waitForTalkActivation()
      }

      this.dispatchEvent(
        new CustomEvent('orb-voice-talk-error', {
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
        (reducedMotion === DEFAULT_ORB_VOICE_REDUCED_MOTION && (this.#motionQuery?.matches ?? false))

      this.#animationService.render({
        paused: this.paused,
        reduced,
        speed: this.speed,
        state: this.state
      })
    }
  }

  const elementConstructor = OrbVoiceHTMLElement as unknown as OrbVoiceElementConstructor
  ELEMENT_CONSTRUCTORS.set(HTMLElementBase, elementConstructor)

  return elementConstructor
}

function normalizeSpeech(value: string | null | undefined): string | undefined {
  const normalized = value?.trim()
  return normalized && normalized.length > 0 ? normalized : undefined
}

function colorKeyForAttribute(name: string): keyof OrbVoiceColors | undefined {
  return ORB_VOICE_COLOR_KEYS.find((key) => ORB_VOICE_COLOR_ATTRIBUTES[key] === name)
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
