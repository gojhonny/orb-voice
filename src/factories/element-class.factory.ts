import type {
  OrbuColorOverrides,
  OrbuColors,
  OrbuPresetName,
  OrbuReducedMotion,
  OrbuSize,
  OrbuState
} from '@core/appearance/appearance.types'
import { mergeOrbuColors } from '@core/appearance/merge-colors.compute'
import {
  DEFAULT_ORBU_REDUCED_MOTION,
  ORBU_COLOR_ATTRIBUTES,
  ORBU_COLOR_KEYS,
  ORBU_PRESETS
} from '@core/config.data'
import { normalizeOrbuPreset } from '@core/lib/normalize-preset.compute'
import { normalizeOrbuReducedMotion } from '@core/lib/normalize-reduced-motion.compute'
import { normalizeOrbuSize } from '@core/lib/normalize-size.compute'
import { normalizeOrbuSpeed } from '@core/lib/normalize-speed.compute'
import { normalizeOrbuState } from '@core/lib/normalize-state.compute'
import { ORBU_OBSERVED_ATTRIBUTES } from '@element/element.data'
import type { OrbuElement, OrbuElementConstructor } from '@element/element.types'
import { orbuShadowTreeFactory } from '@factories/shadow-tree.factory'
import type { OrbuConversationState } from '@ports/conversation.port'
import type { OrbuIntelligencePort } from '@ports/intelligence.port'
import type { OrbuVoiceEnginePort } from '@ports/voice-engine.port'
import { OrbuAnimationService } from '@services/animation.service'
import { OrbuConversationRunnerService } from '@services/conversation-runner.service'
import { OrbuTalkRunnerService } from '@services/talk-runner.service'
import {
  createDefaultOrbuVoiceModel,
  createOrbuConversation,
  createOrbuVoiceEngine
} from '@services/voice-model.service'
import { normalizeRealtimeSession } from '@talk/normalize-realtime-session.compute'
import { normalizeVoiceModel } from '@talk/normalize-voice-model.compute'
import { DEFAULT_TALK_FLOW } from '@talk/talk.data'
import type { OrbuTalkContext, OrbuTalkStep } from '@talk/talk.types'
import type { OrbuRealtimeSession, OrbuVoiceModel } from '@talk/voice-model.types'

const ELEMENT_CONSTRUCTORS = new WeakMap<object, OrbuElementConstructor>()

/**
 * Creates the Orbu custom-element class only when a DOM implementation exists.
 * Importing this module on a server never evaluates an HTMLElement subclass.
 */
export function orbuElementClassFactory(): OrbuElementConstructor | undefined {
  if (typeof globalThis.HTMLElement === 'undefined') {
    return undefined
  }

  const HTMLElementBase = globalThis.HTMLElement
  const existingConstructor = ELEMENT_CONSTRUCTORS.get(HTMLElementBase)
  if (existingConstructor) {
    return existingConstructor
  }

  class OrbuHTMLElement extends HTMLElementBase implements OrbuElement {
    static readonly observedAttributes = ORBU_OBSERVED_ATTRIBUTES

    readonly #animationService: OrbuAnimationService
    readonly #conversationRunner: OrbuConversationRunnerService
    readonly #talkRunner: OrbuTalkRunnerService
    readonly #visualRoot: HTMLElement
    #activationAbortController: AbortController | undefined
    #colorConflictCheckQueued = false
    #connected = false
    #customVoiceEngine: OrbuVoiceEnginePort | undefined
    #hasColorConflict = false
    #motionQuery: MediaQueryList | undefined
    #speaking = false
    #stateBeforeConversation: OrbuState | undefined
    #stateBeforeSpeech: OrbuState | undefined
    #talkFlow: readonly OrbuTalkStep[] = DEFAULT_TALK_FLOW
    #voiceModel: Readonly<OrbuVoiceModel> | undefined = createDefaultOrbuVoiceModel()
    #realtimeSession: OrbuRealtimeSession | undefined

    readonly #handleMotionPreferenceChange = (): void => {
      if (this.reducedMotion === 'system') {
        this.#renderMotion()
      }
    }

    constructor() {
      super()

      const shadowRoot = this.attachShadow({ mode: 'closed' })
      const shadowTree = orbuShadowTreeFactory(shadowRoot, this.ownerDocument)

      this.#visualRoot = shadowTree.root
      this.#animationService = new OrbuAnimationService(this.#visualRoot, shadowTree.layers)
      this.#talkRunner = new OrbuTalkRunnerService(
        this.#handleSpeakingChange.bind(this),
        this.#handleTalkError.bind(this)
      )
      this.#conversationRunner = new OrbuConversationRunnerService({
        onStateChange: this.#handleConversationState.bind(this),
        onTranscript: (transcript) => {
          this.dispatchEvent(new CustomEvent('orbu-transcript', { detail: transcript }))
        },
        onError: (error) => {
          this.dispatchEvent(
            new CustomEvent('orbu-talk-error', {
              detail: Object.freeze({ error })
            })
          )
        }
      })
      this.#talkRunner.voiceEngine = createOrbuVoiceEngine(this.#voiceModel)
    }

    get intelligence(): OrbuIntelligencePort | undefined {
      return this.#talkRunner.intelligence
    }

    set intelligence(value: OrbuIntelligencePort | undefined) {
      if (value !== undefined && typeof value.respond !== 'function') {
        throw new TypeError('Orbu intelligence must implement respond().')
      }

      this.#talkRunner.intelligence = value
    }

    get talkContext(): Readonly<OrbuTalkContext> {
      return this.#talkRunner.context
    }

    get talkFlow(): readonly OrbuTalkStep[] {
      return Object.freeze([...this.#talkFlow])
    }

    set talkFlow(value: readonly OrbuTalkStep[] | undefined) {
      const flow = value ?? DEFAULT_TALK_FLOW
      if (!Array.isArray(flow)) {
        throw new TypeError('Orbu talkFlow must be an array of talk steps.')
      }

      this.#talkFlow = [...flow]
    }

    get voiceEngine(): OrbuVoiceEnginePort | undefined {
      return this.#talkRunner.voiceEngine
    }

    set voiceEngine(value: OrbuVoiceEnginePort | undefined) {
      if (
        value !== undefined &&
        (typeof value.speak !== 'function' || typeof value.stop !== 'function')
      ) {
        throw new TypeError('Orbu voiceEngine must implement speak() and stop().')
      }

      this.stopTalking()
      this.stopConversation()
      this.#customVoiceEngine = value
      this.#talkRunner.voiceEngine = value ?? createOrbuVoiceEngine(this.#voiceModel)
    }

    get voiceModel(): Readonly<OrbuVoiceModel> | undefined {
      return this.#voiceModel
    }

    set voiceModel(value: OrbuVoiceModel | null | undefined) {
      const model = normalizeVoiceModel(value)
      const engine = this.#customVoiceEngine ?? createOrbuVoiceEngine(model)
      this.stopTalking()
      this.stopConversation()
      this.#voiceModel = model
      this.#talkRunner.voiceEngine = engine
    }

    get realtimeSession(): OrbuRealtimeSession | undefined {
      return this.#realtimeSession
    }

    set realtimeSession(value: OrbuRealtimeSession | undefined) {
      const session = normalizeRealtimeSession(value)
      this.stopConversation()
      this.#realtimeSession = session
    }

    get conversationState(): OrbuConversationState {
      return this.#conversationRunner.state
    }

    get elevated(): boolean {
      return this.hasAttribute('elevated')
    }

    set elevated(value: boolean) {
      this.toggleAttribute('elevated', Boolean(value))
    }

    get preset(): OrbuPresetName {
      return normalizeOrbuPreset(this.getAttribute('preset'))
    }

    set preset(value: OrbuPresetName | null | undefined) {
      if (value === null || value === undefined) {
        this.removeAttribute('preset')
        return
      }

      this.setAttribute('preset', normalizeOrbuPreset(value))
    }

    get paused(): boolean {
      return this.hasAttribute('paused')
    }

    set paused(value: boolean) {
      this.toggleAttribute('paused', Boolean(value))
    }

    get reducedMotion(): OrbuReducedMotion {
      return normalizeOrbuReducedMotion(this.getAttribute('reduced-motion'))
    }

    set reducedMotion(value: OrbuReducedMotion) {
      this.setAttribute('reduced-motion', normalizeOrbuReducedMotion(value))
    }

    get size(): string {
      return normalizeOrbuSize(this.getAttribute('size'))
    }

    set size(value: OrbuSize) {
      this.setAttribute('size', normalizeOrbuSize(value))
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
      return normalizeOrbuSpeed(this.getAttribute('speed'))
    }

    set speed(value: number) {
      this.setAttribute('speed', String(normalizeOrbuSpeed(value)))
    }

    get state(): OrbuState {
      return normalizeOrbuState(this.getAttribute('state'))
    }

    set state(value: OrbuState) {
      this.setAttribute('state', normalizeOrbuState(value))
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
          const normalized = normalizeOrbuPreset(newValue)
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
        const normalized = normalizeOrbuState(newValue)
        if (newValue !== normalized) {
          this.setAttribute(name, normalized)
          return
        }
      }

      if (name === 'speed' && newValue !== null) {
        const normalized = String(normalizeOrbuSpeed(newValue))
        if (newValue !== normalized) {
          this.setAttribute(name, normalized)
          return
        }
      }

      if (name === 'reduced-motion' && newValue !== null) {
        const normalized = normalizeOrbuReducedMotion(newValue)
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
      let conversation: ReturnType<typeof createOrbuConversation>
      try {
        conversation = createOrbuConversation(this.#voiceModel, this.#realtimeSession)
      } catch {
        const error = new Error(
          'Orbu startConversation() requires a Realtime voiceModel and realtimeSession.'
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

    #handleConversationState(state: OrbuConversationState): void {
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
        new CustomEvent('orbu-conversation-state-change', {
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
        const normalized = normalizeOrbuPreset(presetAttribute)
        if (presetAttribute !== normalized) {
          this.setAttribute('preset', normalized)
        }
      }

      for (const key of ORBU_COLOR_KEYS) {
        this.#normalizeColorAttribute(key, this.getAttribute(ORBU_COLOR_ATTRIBUTES[key]))
      }

      this.#synchronizeColors()
    }

    #synchronizeSize(value: string | null): void {
      const normalized = normalizeOrbuSize(value)
      if (value !== null && value !== normalized) {
        this.setAttribute('size', normalized)
        return
      }

      this.#visualRoot.style.setProperty('--orbu-size', normalized)
    }

    #normalizeColorAttribute(key: keyof OrbuColors, value: string | null): boolean {
      if (value === null) {
        return true
      }

      const normalized = value.trim()
      const attribute = ORBU_COLOR_ATTRIBUTES[key]
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
        ? { ...ORBU_PRESETS[this.preset] }
        : mergeOrbuColors(this.#readColorOverrides())

      for (const key of ORBU_COLOR_KEYS) {
        this.#visualRoot.style.setProperty(`--orbu-${key}`, colors[key])
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
        const customAttributes = ORBU_COLOR_KEYS.filter((key) =>
          this.hasAttribute(ORBU_COLOR_ATTRIBUTES[key])
        )
        const hasConflict = this.hasAttribute('preset') && customAttributes.length > 0

        if (hasConflict && !this.#hasColorConflict) {
          const names = customAttributes.map((key) => ORBU_COLOR_ATTRIBUTES[key]).join(', ')
          console.error(
            `[Orbu] preset='${this.preset}' cannot be combined with ` +
              `${names}. ` +
              'The preset is applied and custom color attributes are ignored.'
          )
        }
        this.#hasColorConflict = hasConflict
      })
    }

    #readColorOverrides(): OrbuColorOverrides {
      const overrides: OrbuColorOverrides = {}
      for (const key of ORBU_COLOR_KEYS) {
        const value = this.getAttribute(ORBU_COLOR_ATTRIBUTES[key])
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
        new CustomEvent('orbu-speaking-change', {
          detail: Object.freeze({ speaking })
        })
      )
    }

    #handleTalkError(error: unknown): void {
      if (isSpeechActivationError(error)) {
        this.#waitForTalkActivation()
      }

      this.dispatchEvent(
        new CustomEvent('orbu-talk-error', {
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
        (reducedMotion === DEFAULT_ORBU_REDUCED_MOTION && (this.#motionQuery?.matches ?? false))

      this.#animationService.render({
        paused: this.paused,
        reduced,
        speed: this.speed,
        state: this.state
      })
    }
  }

  const elementConstructor = OrbuHTMLElement as unknown as OrbuElementConstructor
  ELEMENT_CONSTRUCTORS.set(HTMLElementBase, elementConstructor)

  return elementConstructor
}

function normalizeSpeech(value: string | null | undefined): string | undefined {
  const normalized = value?.trim()
  return normalized && normalized.length > 0 ? normalized : undefined
}

function colorKeyForAttribute(name: string): keyof OrbuColors | undefined {
  return ORBU_COLOR_KEYS.find((key) => ORBU_COLOR_ATTRIBUTES[key] === name)
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
