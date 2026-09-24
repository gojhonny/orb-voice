import type {
  OrboColorOverrides,
  OrboColors,
  OrboPresetName,
  OrboReducedMotion,
  OrboSize,
  OrboState
} from '@core/appearance/appearance.types'
import { mergeOrboColors } from '@core/appearance/merge-colors.compute'
import {
  DEFAULT_ORBO_REDUCED_MOTION,
  ORBO_COLOR_ATTRIBUTES,
  ORBO_COLOR_KEYS,
  ORBO_PRESETS
} from '@core/config.data'
import { normalizeOrboPreset } from '@core/lib/normalize-preset.compute'
import { normalizeOrboReducedMotion } from '@core/lib/normalize-reduced-motion.compute'
import { normalizeOrboSize } from '@core/lib/normalize-size.compute'
import { normalizeOrboSpeed } from '@core/lib/normalize-speed.compute'
import { normalizeOrboState } from '@core/lib/normalize-state.compute'
import { ORBO_OBSERVED_ATTRIBUTES } from '@element/element.data'
import type { OrboElement, OrboElementConstructor } from '@element/element.types'
import { orboShadowTreeFactory } from '@factories/shadow-tree.factory'
import type { OrboConversationState } from '@ports/conversation.port'
import type { OrboIntelligencePort } from '@ports/intelligence.port'
import type { OrboVoiceEnginePort } from '@ports/voice-engine.port'
import { OrboAnimationService } from '@services/animation.service'
import { OrboConversationRunnerService } from '@services/conversation-runner.service'
import { OrboTalkRunnerService } from '@services/talk-runner.service'
import {
  createDefaultOrboVoiceModel,
  createOrboConversation,
  createOrboVoiceEngine
} from '@services/voice-model.service'
import { normalizeRealtimeSession } from '@talk/normalize-realtime-session.compute'
import { normalizeVoiceModel } from '@talk/normalize-voice-model.compute'
import { DEFAULT_TALK_FLOW } from '@talk/talk.data'
import type { OrboTalkContext, OrboTalkStep } from '@talk/talk.types'
import type { OrboRealtimeSession, OrboVoiceModel } from '@talk/voice-model.types'

const ELEMENT_CONSTRUCTORS = new WeakMap<object, OrboElementConstructor>()

/**
 * Creates the Orbo custom-element class only when a DOM implementation exists.
 * Importing this module on a server never evaluates an HTMLElement subclass.
 */
export function orboElementClassFactory(): OrboElementConstructor | undefined {
  if (typeof globalThis.HTMLElement === 'undefined') {
    return undefined
  }

  const HTMLElementBase = globalThis.HTMLElement
  const existingConstructor = ELEMENT_CONSTRUCTORS.get(HTMLElementBase)
  if (existingConstructor) {
    return existingConstructor
  }

  class OrboHTMLElement extends HTMLElementBase implements OrboElement {
    static readonly observedAttributes = ORBO_OBSERVED_ATTRIBUTES

    readonly #animationService: OrboAnimationService
    readonly #conversationRunner: OrboConversationRunnerService
    readonly #talkRunner: OrboTalkRunnerService
    readonly #visualRoot: HTMLElement
    #activationAbortController: AbortController | undefined
    #colorConflictCheckQueued = false
    #connected = false
    #customVoiceEngine: OrboVoiceEnginePort | undefined
    #hasColorConflict = false
    #motionQuery: MediaQueryList | undefined
    #speaking = false
    #stateBeforeConversation: OrboState | undefined
    #stateBeforeSpeech: OrboState | undefined
    #talkFlow: readonly OrboTalkStep[] = DEFAULT_TALK_FLOW
    #voiceModel: Readonly<OrboVoiceModel> | undefined = createDefaultOrboVoiceModel()
    #realtimeSession: OrboRealtimeSession | undefined

    readonly #handleMotionPreferenceChange = (): void => {
      if (this.reducedMotion === 'system') {
        this.#renderMotion()
      }
    }

    constructor() {
      super()

      const shadowRoot = this.attachShadow({ mode: 'closed' })
      const shadowTree = orboShadowTreeFactory(shadowRoot, this.ownerDocument)

      this.#visualRoot = shadowTree.root
      this.#animationService = new OrboAnimationService(this.#visualRoot, shadowTree.layers)
      this.#talkRunner = new OrboTalkRunnerService(
        this.#handleSpeakingChange.bind(this),
        this.#handleTalkError.bind(this)
      )
      this.#conversationRunner = new OrboConversationRunnerService({
        onStateChange: this.#handleConversationState.bind(this),
        onTranscript: (transcript) => {
          this.dispatchEvent(new CustomEvent('orbo-transcript', { detail: transcript }))
        },
        onError: (error) => {
          this.dispatchEvent(
            new CustomEvent('orbo-talk-error', {
              detail: Object.freeze({ error })
            })
          )
        }
      })
      this.#talkRunner.voiceEngine = createOrboVoiceEngine(this.#voiceModel)
    }

    get intelligence(): OrboIntelligencePort | undefined {
      return this.#talkRunner.intelligence
    }

    set intelligence(value: OrboIntelligencePort | undefined) {
      if (value !== undefined && typeof value.respond !== 'function') {
        throw new TypeError('Orbo intelligence must implement respond().')
      }

      this.#talkRunner.intelligence = value
    }

    get talkContext(): Readonly<OrboTalkContext> {
      return this.#talkRunner.context
    }

    get talkFlow(): readonly OrboTalkStep[] {
      return Object.freeze([...this.#talkFlow])
    }

    set talkFlow(value: readonly OrboTalkStep[] | undefined) {
      const flow = value ?? DEFAULT_TALK_FLOW
      if (!Array.isArray(flow)) {
        throw new TypeError('Orbo talkFlow must be an array of talk steps.')
      }

      this.#talkFlow = [...flow]
    }

    get voiceEngine(): OrboVoiceEnginePort | undefined {
      return this.#talkRunner.voiceEngine
    }

    set voiceEngine(value: OrboVoiceEnginePort | undefined) {
      if (
        value !== undefined &&
        (typeof value.speak !== 'function' || typeof value.stop !== 'function')
      ) {
        throw new TypeError('Orbo voiceEngine must implement speak() and stop().')
      }

      this.stopTalking()
      this.stopConversation()
      this.#customVoiceEngine = value
      this.#talkRunner.voiceEngine = value ?? createOrboVoiceEngine(this.#voiceModel)
    }

    get voiceModel(): Readonly<OrboVoiceModel> | undefined {
      return this.#voiceModel
    }

    set voiceModel(value: OrboVoiceModel | null | undefined) {
      const model = normalizeVoiceModel(value)
      const engine = this.#customVoiceEngine ?? createOrboVoiceEngine(model)
      this.stopTalking()
      this.stopConversation()
      this.#voiceModel = model
      this.#talkRunner.voiceEngine = engine
    }

    get realtimeSession(): OrboRealtimeSession | undefined {
      return this.#realtimeSession
    }

    set realtimeSession(value: OrboRealtimeSession | undefined) {
      const session = normalizeRealtimeSession(value)
      this.stopConversation()
      this.#realtimeSession = session
    }

    get conversationState(): OrboConversationState {
      return this.#conversationRunner.state
    }

    get elevated(): boolean {
      return this.hasAttribute('elevated')
    }

    set elevated(value: boolean) {
      this.toggleAttribute('elevated', Boolean(value))
    }

    get preset(): OrboPresetName {
      return normalizeOrboPreset(this.getAttribute('preset'))
    }

    set preset(value: OrboPresetName | null | undefined) {
      if (value === null || value === undefined) {
        this.removeAttribute('preset')
        return
      }

      this.setAttribute('preset', normalizeOrboPreset(value))
    }

    get paused(): boolean {
      return this.hasAttribute('paused')
    }

    set paused(value: boolean) {
      this.toggleAttribute('paused', Boolean(value))
    }

    get reducedMotion(): OrboReducedMotion {
      return normalizeOrboReducedMotion(this.getAttribute('reduced-motion'))
    }

    set reducedMotion(value: OrboReducedMotion) {
      this.setAttribute('reduced-motion', normalizeOrboReducedMotion(value))
    }

    get size(): string {
      return normalizeOrboSize(this.getAttribute('size'))
    }

    set size(value: OrboSize) {
      this.setAttribute('size', normalizeOrboSize(value))
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
      return normalizeOrboSpeed(this.getAttribute('speed'))
    }

    set speed(value: number) {
      this.setAttribute('speed', String(normalizeOrboSpeed(value)))
    }

    get state(): OrboState {
      return normalizeOrboState(this.getAttribute('state'))
    }

    set state(value: OrboState) {
      this.setAttribute('state', normalizeOrboState(value))
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
          const normalized = normalizeOrboPreset(newValue)
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
        const normalized = normalizeOrboState(newValue)
        if (newValue !== normalized) {
          this.setAttribute(name, normalized)
          return
        }
      }

      if (name === 'speed' && newValue !== null) {
        const normalized = String(normalizeOrboSpeed(newValue))
        if (newValue !== normalized) {
          this.setAttribute(name, normalized)
          return
        }
      }

      if (name === 'reduced-motion' && newValue !== null) {
        const normalized = normalizeOrboReducedMotion(newValue)
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
      let conversation: ReturnType<typeof createOrboConversation>
      try {
        conversation = createOrboConversation(this.#voiceModel, this.#realtimeSession)
      } catch {
        const error = new Error(
          'Orbo startConversation() requires a Realtime voiceModel and realtimeSession.'
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

    #handleConversationState(state: OrboConversationState): void {
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
        new CustomEvent('orbo-conversation-state-change', {
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
        const normalized = normalizeOrboPreset(presetAttribute)
        if (presetAttribute !== normalized) {
          this.setAttribute('preset', normalized)
        }
      }

      for (const key of ORBO_COLOR_KEYS) {
        this.#normalizeColorAttribute(key, this.getAttribute(ORBO_COLOR_ATTRIBUTES[key]))
      }

      this.#synchronizeColors()
    }

    #synchronizeSize(value: string | null): void {
      const normalized = normalizeOrboSize(value)
      if (value !== null && value !== normalized) {
        this.setAttribute('size', normalized)
        return
      }

      this.#visualRoot.style.setProperty('--orbo-size', normalized)
    }

    #normalizeColorAttribute(key: keyof OrboColors, value: string | null): boolean {
      if (value === null) {
        return true
      }

      const normalized = value.trim()
      const attribute = ORBO_COLOR_ATTRIBUTES[key]
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
        ? { ...ORBO_PRESETS[this.preset] }
        : mergeOrboColors(this.#readColorOverrides())

      for (const key of ORBO_COLOR_KEYS) {
        this.#visualRoot.style.setProperty(`--orbo-${key}`, colors[key])
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
        const customAttributes = ORBO_COLOR_KEYS.filter((key) =>
          this.hasAttribute(ORBO_COLOR_ATTRIBUTES[key])
        )
        const hasConflict = this.hasAttribute('preset') && customAttributes.length > 0

        if (hasConflict && !this.#hasColorConflict) {
          const names = customAttributes.map((key) => ORBO_COLOR_ATTRIBUTES[key]).join(', ')
          console.error(
            `[Orbo] preset='${this.preset}' cannot be combined with ` +
              `${names}. ` +
              'The preset is applied and custom color attributes are ignored.'
          )
        }
        this.#hasColorConflict = hasConflict
      })
    }

    #readColorOverrides(): OrboColorOverrides {
      const overrides: OrboColorOverrides = {}
      for (const key of ORBO_COLOR_KEYS) {
        const value = this.getAttribute(ORBO_COLOR_ATTRIBUTES[key])
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
        new CustomEvent('orbo-speaking-change', {
          detail: Object.freeze({ speaking })
        })
      )
    }

    #handleTalkError(error: unknown): void {
      if (isSpeechActivationError(error)) {
        this.#waitForTalkActivation()
      }

      this.dispatchEvent(
        new CustomEvent('orbo-talk-error', {
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
        (reducedMotion === DEFAULT_ORBO_REDUCED_MOTION && (this.#motionQuery?.matches ?? false))

      this.#animationService.render({
        paused: this.paused,
        reduced,
        speed: this.speed,
        state: this.state
      })
    }
  }

  const elementConstructor = OrboHTMLElement as unknown as OrboElementConstructor
  ELEMENT_CONSTRUCTORS.set(HTMLElementBase, elementConstructor)

  return elementConstructor
}

function normalizeSpeech(value: string | null | undefined): string | undefined {
  const normalized = value?.trim()
  return normalized && normalized.length > 0 ? normalized : undefined
}

function colorKeyForAttribute(name: string): keyof OrboColors | undefined {
  return ORBO_COLOR_KEYS.find((key) => ORBO_COLOR_ATTRIBUTES[key] === name)
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
