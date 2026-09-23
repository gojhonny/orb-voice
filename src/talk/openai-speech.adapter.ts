import { orbvConfiguration } from '@core/config.data'
import type { OrbVVoiceEnginePort } from '@ports/voice-engine.port'

import type {
  OpenAISpeechAdapterOptions,
  OpenAISpeechFormat,
  OpenAISpeechModel,
  OpenAISpeechVoice
} from './talk.types'

interface ActiveAudio {
  finish(): void
}

class SpeechAdapterError extends Error {
  constructor(message: string, name = 'Error') {
    super(message)
    this.name = name
  }
}

/**
 * Plays OpenAI text-to-speech audio returned by an implementer-owned endpoint.
 * The endpoint keeps the OpenAI API key outside the browser and should accept
 * the same JSON fields as OpenAI's audio speech endpoint.
 */
export class OpenAISpeechAdapter implements OrbVVoiceEnginePort {
  #activeAudio: ActiveAudio | undefined
  #abortController: AbortController | undefined
  readonly #credentials: RequestCredentials
  readonly #endpoint: string
  readonly #fetch: typeof globalThis.fetch | undefined
  readonly #headers: Readonly<Record<string, string>>
  readonly #instructions: string
  readonly #model: OpenAISpeechModel
  readonly #requestTimeoutMs: number
  readonly #responseFormat: OpenAISpeechFormat
  #run = 0
  readonly #voice: OpenAISpeechVoice

  constructor(options: OpenAISpeechAdapterOptions) {
    const endpoint = String(options.endpoint).trim()
    if (endpoint.length === 0) {
      throw new TypeError('OpenAI speech endpoint must not be empty.')
    }

    const defaults = orbvConfiguration.speech.openaiSpeech
    this.#credentials = options.credentials ?? defaults.credentials
    this.#endpoint = endpoint
    this.#fetch = options.fetch ?? globalThis.fetch
    this.#headers = Object.freeze({ ...options.headers })
    this.#instructions = options.instructions ?? defaults.instructions
    this.#model = options.model ?? defaults.model
    const requestTimeoutMs = options.requestTimeoutMs ?? defaults.requestTimeoutMs
    this.#requestTimeoutMs =
      Number.isFinite(requestTimeoutMs) && requestTimeoutMs > 0
        ? Math.min(requestTimeoutMs, 2_147_483_647)
        : defaults.requestTimeoutMs
    this.#responseFormat = options.responseFormat ?? defaults.responseFormat
    this.#voice = options.voice ?? defaultVoiceForModel(this.#model)
  }

  async speak(text: string): Promise<void> {
    const normalizedText = text.trim()
    if (normalizedText.length === 0) {
      return
    }
    const fetch = this.#fetch
    if (!fetch) {
      throw new Error('Fetch is not available in this environment.')
    }

    this.stop()
    const run = ++this.#run
    const abortController = new AbortController()
    this.#abortController = abortController

    try {
      const headers = new Headers(this.#headers)
      if (!headers.has('content-type')) {
        headers.set('content-type', 'application/json')
      }

      const body: Record<string, unknown> = {
        input: normalizedText,
        model: this.#model,
        response_format: this.#responseFormat,
        voice: this.#voice
      }
      if (supportsInstructions(this.#model)) {
        body.instructions = this.#instructions
      }

      const audioBlob = await requestSpeechAudio(
        () =>
          fetch(this.#endpoint, {
            body: JSON.stringify(body),
            credentials: this.#credentials,
            headers,
            method: 'POST',
            signal: abortController.signal
          }),
        abortController,
        this.#requestTimeoutMs
      )
      if (run !== this.#run) {
        return
      }

      await this.#play(audioBlob, run)
    } catch (error) {
      if (run !== this.#run) {
        return
      }

      throw error instanceof SpeechAdapterError
        ? error
        : new SpeechAdapterError('OpenAI speech request failed.')
    } finally {
      abortController.abort()
      if (this.#abortController === abortController) {
        this.#abortController = undefined
      }
    }
  }

  stop(): void {
    this.#run += 1
    this.#abortController?.abort()
    this.#abortController = undefined

    const activeAudio = this.#activeAudio
    this.#activeAudio = undefined
    activeAudio?.finish()
  }

  async #play(audioBlob: Blob, run: number): Promise<void> {
    const AudioConstructor = globalThis.Audio
    if (typeof AudioConstructor !== 'function') {
      throw new SpeechAdapterError('Audio playback is not available in this environment.')
    }

    const objectUrl = URL.createObjectURL(audioBlob)
    let activeAudio: ActiveAudio | undefined

    try {
      const audio = new AudioConstructor(objectUrl)
      audio.preload = 'auto'

      await new Promise<void>((resolve, reject) => {
        let settled = false

        const finish = (error?: Error): void => {
          if (settled) {
            return
          }

          settled = true
          audio.removeEventListener('ended', handleEnded)
          audio.removeEventListener('error', handleError)
          try {
            audio.pause()
          } catch {
            // A failed pause must not prevent cancellation from settling.
          }

          if (error) {
            reject(error)
          } else {
            resolve()
          }
        }

        const handleEnded = (): void => finish()
        const handleError = (): void => {
          finish(new SpeechAdapterError('The generated speech audio could not be played.'))
        }

        activeAudio = { finish }
        this.#activeAudio = activeAudio
        audio.addEventListener('ended', handleEnded, { once: true })
        audio.addEventListener('error', handleError, { once: true })

        try {
          void audio.play().catch((error: unknown) => {
            finish(toPlaybackError(error))
          })
        } catch (error) {
          finish(toPlaybackError(error))
        }
      })
    } catch (error) {
      throw error instanceof SpeechAdapterError ? error : toPlaybackError(error)
    } finally {
      URL.revokeObjectURL(objectUrl)
      if (run === this.#run && this.#activeAudio === activeAudio) {
        this.#activeAudio = undefined
      }
    }
  }
}

function requestSpeechAudio(
  request: () => Promise<Response>,
  abortController: AbortController,
  timeoutMs: number
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    let settled = false
    const signal = abortController.signal
    const timer = globalThis.setTimeout(() => {
      settle(() =>
        reject(new SpeechAdapterError('OpenAI speech request timed out.', 'TimeoutError'))
      )
      abortController.abort()
    }, timeoutMs)

    function settle(finish: () => void): void {
      if (settled) {
        return
      }

      settled = true
      globalThis.clearTimeout(timer)
      signal.removeEventListener('abort', handleAbort)
      finish()
    }

    function handleAbort(): void {
      settle(() =>
        reject(new SpeechAdapterError('OpenAI speech request was canceled.', 'AbortError'))
      )
    }

    signal.addEventListener('abort', handleAbort, { once: true })
    if (signal.aborted) {
      handleAbort()
      return
    }

    void (async () => {
      const response = await request()
      if (signal.aborted) {
        throw new SpeechAdapterError('OpenAI speech request was canceled.', 'AbortError')
      }
      if (!response.ok) {
        throw new SpeechAdapterError(`OpenAI speech endpoint failed with ${response.status}.`)
      }

      return response.blob()
    })().then(
      (blob) => settle(() => resolve(blob)),
      (error: unknown) => settle(() => reject(error))
    )
  })
}

function toPlaybackError(error: unknown): Error {
  if (error instanceof Error && error.name === 'NotAllowedError') {
    return new SpeechAdapterError(
      'Speech playback requires a user interaction in this browser.',
      'NotAllowedError'
    )
  }

  return new SpeechAdapterError('Speech audio playback failed.')
}

function supportsInstructions(model: OpenAISpeechModel): boolean {
  return model !== 'tts-1' && model !== 'tts-1-hd'
}

function defaultVoiceForModel(model: OpenAISpeechModel): OpenAISpeechVoice {
  const defaults = orbvConfiguration.speech.openaiSpeech
  return model === 'tts-1' || model === 'tts-1-hd' ? defaults.legacyVoice : defaults.voice
}
