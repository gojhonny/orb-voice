import { orboConfiguration } from '@core/config.data'
import type {
  OrboConversationHandlers,
  OrboConversationPort,
  OrboConversationState
} from '@ports/conversation.port'

import { normalizeRealtimeSession } from './normalize-realtime-session.compute'
import type {
  OpenAIRealtimeAdapterOptions,
  OrboRealtimeSession,
  OrboRealtimeSessionRequest
} from './voice-model.types'

interface ActiveSession {
  readonly controller: AbortController
  readonly peer: RTCPeerConnection
  readonly channel: RTCDataChannel
  readonly audio: HTMLAudioElement
  readonly handlers: OrboConversationHandlers
  readonly remoteTracks: Set<MediaStreamTrack>
  readonly interruptedResponseIds: Set<string>
  responseId?: string
  microphone?: MediaStream
  timeout?: ReturnType<typeof globalThis.setTimeout>
  failure?: Error
  ready?: () => void
  closed: boolean
  responding: boolean
  playing: boolean
  state: OrboConversationState
}

/**
 * Direct browser/OpenAI audio over WebRTC. The application exchanges the SDP
 * offer on its server, where credentials, tools, context and persona remain.
 * Construction performs no network, playback or microphone work.
 */
export class OpenAIRealtimeAdapter implements OrboConversationPort {
  readonly #session: OrboRealtimeSession
  readonly #model: string
  readonly #voice: string
  readonly #sessionTimeoutMs: number
  #active: ActiveSession | undefined

  constructor(options: OpenAIRealtimeAdapterOptions) {
    const defaults = orboConfiguration.realtime.openai
    const session = normalizeRealtimeSession(options.session)
    if (!session) {
      throw new TypeError('OpenAI Realtime requires an application session authorizer or endpoint.')
    }
    this.#session = session
    this.#model = options.model?.trim() || defaults.model
    this.#voice = options.voice?.trim() || defaults.voice
    const timeout = options.sessionTimeoutMs ?? defaults.sessionTimeoutMs
    this.#sessionTimeoutMs =
      Number.isFinite(timeout) && timeout > 0
        ? Math.min(timeout, 2_147_483_647)
        : defaults.sessionTimeoutMs
  }

  async start(handlers: OrboConversationHandlers): Promise<void> {
    this.stop()
    if (
      typeof globalThis.RTCPeerConnection !== 'function' ||
      typeof globalThis.Audio !== 'function' ||
      typeof globalThis.navigator?.mediaDevices?.getUserMedia !== 'function'
    ) {
      const error = realtimeError(
        'Realtime audio requires a browser with microphone and WebRTC support.'
      )
      handlers.onStateChange('error')
      handlers.onError(error)
      throw error
    }

    const peer = new globalThis.RTCPeerConnection()
    let channel: RTCDataChannel
    let audio: HTMLAudioElement
    try {
      channel = peer.createDataChannel(orboConfiguration.realtime.openai.dataChannelLabel)
      audio = new globalThis.Audio()
    } catch {
      peer.close()
      const error = realtimeError('Realtime audio could not be initialized.')
      handlers.onStateChange('error')
      handlers.onError(error)
      throw error
    }

    const active: ActiveSession = {
      controller: new AbortController(),
      peer,
      channel,
      audio,
      handlers,
      remoteTracks: new Set(),
      interruptedResponseIds: new Set(),
      closed: false,
      responding: false,
      playing: false,
      state: 'idle'
    }
    this.#active = active
    this.#setState(active, 'connecting')
    active.timeout = globalThis.setTimeout(() => {
      this.#fail(active, realtimeError('Realtime session startup timed out.', 'TimeoutError'))
    }, this.#sessionTimeoutMs)
    this.#listen(active)

    try {
      const microphoneRequest = globalThis.navigator.mediaDevices.getUserMedia({ audio: true })
      // getUserMedia has no AbortSignal; always release a stream granted after cancellation.
      void microphoneRequest.then(
        (stream) => {
          if (active.closed) {
            stopTracks(stream)
          }
        },
        () => {}
      )
      const microphone = await untilAborted(microphoneRequest, active.controller.signal)
      if (active.closed) {
        stopTracks(microphone)
        return
      }
      active.microphone = microphone
      const tracks = microphone.getAudioTracks()
      if (tracks.length === 0) {
        throw realtimeError('Microphone audio is not available.')
      }
      for (const track of tracks) {
        track.onended = () => this.#fail(active, realtimeError('Microphone audio ended.'))
        peer.addTrack(track, microphone)
      }

      const offer = await untilAborted(peer.createOffer(), active.controller.signal)
      await untilAborted(peer.setLocalDescription(offer), active.controller.signal)
      const sdp = peer.localDescription?.sdp ?? offer.sdp
      if (!sdp) {
        throw realtimeError('Realtime session could not create an audio offer.')
      }
      const answer = await untilAborted(
        this.#authorize({
          sdp,
          model: this.#model,
          voice: this.#voice,
          signal: active.controller.signal
        }),
        active.controller.signal
      )
      if (typeof answer !== 'string' || !answer.trim().startsWith('v=0')) {
        throw realtimeError('Realtime session endpoint did not return an SDP answer.')
      }
      await untilAborted(
        peer.setRemoteDescription({ type: 'answer', sdp: answer }),
        active.controller.signal
      )
      await untilAborted(
        new Promise<void>((resolve) => {
          active.ready = resolve
          this.#ready(active)
        }),
        active.controller.signal
      )
      globalThis.clearTimeout(active.timeout)
      delete active.timeout
      delete active.ready
      if (!active.closed && active.state === 'connecting') {
        this.#setState(active, 'listening')
      }
    } catch (error) {
      if (active.failure) {
        throw active.failure
      }
      if (active.closed) {
        return
      }
      const safe = sanitizeRealtimeError(error)
      this.#fail(active, safe)
      throw safe
    }
  }

  stop(): void {
    const active = this.#active
    if (active) {
      this.#close(active)
    }
  }

  /** Cancel generation and clear buffered remote audio without closing the microphone. */
  interrupt(): void {
    const active = this.#active
    if (!active || active.closed || active.channel.readyState !== 'open') {
      return
    }
    try {
      const clearOutput = active.responding || active.playing
      const responding = active.responding
      const responseId = active.responseId
      this.#retireResponse(active)
      if (responding) {
        active.channel.send(
          JSON.stringify({
            type: 'response.cancel',
            ...(responseId === undefined ? {} : { response_id: responseId })
          })
        )
      }
      if (clearOutput) {
        active.channel.send(JSON.stringify({ type: 'output_audio_buffer.clear' }))
      }
      this.#setState(active, 'listening')
    } catch {
      this.#fail(active, realtimeError('Realtime interruption failed.'))
    }
  }

  async #authorize(request: OrboRealtimeSessionRequest): Promise<string> {
    if (typeof this.#session === 'function') {
      return this.#session(Object.freeze(request))
    }
    const fetcher = this.#session.fetch ?? globalThis.fetch
    if (typeof fetcher !== 'function') {
      throw realtimeError('Realtime session authorization requires fetch support.')
    }
    const response = await fetcher(String(this.#session.endpoint), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/sdp' },
      credentials: this.#session.credentials ?? orboConfiguration.realtime.openai.credentials,
      body: JSON.stringify({ sdp: request.sdp, model: request.model, voice: request.voice }),
      signal: request.signal
    })
    if (!response.ok) {
      // The application's response body may contain provider diagnostics or credentials.
      throw realtimeError('Realtime session authorization failed.')
    }
    return response.text()
  }

  #listen(active: ActiveSession): void {
    const { peer, channel, audio } = active
    peer.ontrack = (event) => {
      if (active.closed) {
        event.track.stop()
        return
      }
      active.remoteTracks.add(event.track)
      audio.srcObject = event.streams[0] ?? new MediaStream([event.track])
      void audio.play().catch((error: unknown) => {
        this.#fail(active, sanitizeRealtimeError(error))
      })
    }
    peer.onconnectionstatechange = () => {
      if (peer.connectionState === 'failed' || peer.connectionState === 'disconnected') {
        this.#fail(active, realtimeError('Realtime audio connection was lost.'))
      } else if (peer.connectionState === 'closed' && !active.closed) {
        this.#close(active)
      } else {
        this.#ready(active)
      }
    }
    channel.onopen = () => this.#ready(active)
    channel.onclose = () =>
      this.#fail(active, realtimeError('Realtime event connection was closed.'))
    channel.onerror = () => this.#fail(active, realtimeError('Realtime event connection failed.'))
    channel.onmessage = (event) => this.#message(active, event.data)
    audio.onerror = () => this.#fail(active, realtimeError('Realtime audio could not be played.'))
  }

  #ready(active: ActiveSession): void {
    if (
      !active.closed &&
      active.peer.connectionState === 'connected' &&
      active.channel.readyState === 'open'
    ) {
      active.ready?.()
    }
  }

  #message(active: ActiveSession, data: unknown): void {
    if (
      active.closed ||
      typeof data !== 'string' ||
      data.length > orboConfiguration.realtime.maxEventBytes
    ) {
      return
    }
    let event: Record<string, unknown>
    try {
      const parsed: unknown = JSON.parse(data)
      if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
        return
      }
      event = parsed as Record<string, unknown>
    } catch {
      return
    }
    const responseId = readResponseId(event)
    const responseEvent =
      typeof event.type === 'string' &&
      (event.type.startsWith('response.') || event.type.startsWith('output_audio_buffer.'))
    if (responseEvent) {
      // Correlate audio and captions before changing state. A delayed completion
      // for an old response must not finish or caption its replacement.
      if (!responseId || active.interruptedResponseIds.has(responseId)) {
        return
      }
      if (event.type !== 'response.created' && responseId !== active.responseId) {
        return
      }
    }
    switch (event.type) {
      case 'input_audio_buffer.speech_started':
        // OpenAI's server VAD interrupts remote playback and truncates unheard audio.
        this.#retireResponse(active)
        this.#setState(active, 'listening')
        break
      case 'input_audio_buffer.speech_stopped':
        this.#setState(active, 'thinking')
        break
      case 'response.created':
        if (!responseId || responseId === active.responseId) {
          return
        }
        this.#retireResponse(active)
        active.responseId = responseId
        active.responding = true
        this.#setState(active, 'thinking')
        break
      case 'output_audio_buffer.started':
        active.playing = true
        this.#setState(active, 'speaking')
        break
      case 'output_audio_buffer.stopped':
      case 'output_audio_buffer.cleared':
        active.playing = false
        this.#setState(active, 'listening')
        break
      case 'response.done':
        active.responding = false
        if (
          event.response &&
          typeof event.response === 'object' &&
          Reflect.get(event.response, 'status') === 'failed'
        ) {
          this.#fail(active, realtimeError('Realtime provider could not complete the response.'))
          break
        }
        if (!active.playing) {
          this.#setState(active, 'listening')
        }
        break
      case 'response.output_audio_transcript.delta':
      case 'response.output_audio_transcript.done':
      case 'conversation.item.input_audio_transcription.completed': {
        const final = event.type !== 'response.output_audio_transcript.delta'
        const text = final ? event.transcript : event.delta
        if (typeof text !== 'string') {
          return
        }
        const itemId =
          typeof event.item_id === 'string' && /^[\w-]+$/.test(event.item_id)
            ? event.item_id.slice(0, 256)
            : undefined
        active.handlers.onTranscript(
          Object.freeze({
            role:
              event.type === 'conversation.item.input_audio_transcription.completed'
                ? 'user'
                : 'assistant',
            text: text.slice(0, orboConfiguration.realtime.maxTranscriptLength),
            final,
            ...(itemId === undefined ? {} : { itemId })
          })
        )
        break
      }
      case 'error': {
        const details = event.error
        // A server VAD cancellation may race an explicit interrupt().
        if (
          details &&
          typeof details === 'object' &&
          Reflect.get(details, 'code') === 'response_cancel_not_active'
        ) {
          return
        }
        this.#fail(active, realtimeError('Realtime provider reported a session error.'))
        break
      }
    }
  }

  #retireResponse(active: ActiveSession): void {
    if (active.responseId) {
      active.interruptedResponseIds.add(active.responseId)
      // Bound per-session correlation history; non-current response events are
      // also rejected even after an old ID leaves this set.
      if (active.interruptedResponseIds.size > 128) {
        const oldest = active.interruptedResponseIds.values().next().value
        if (oldest !== undefined) {
          active.interruptedResponseIds.delete(oldest)
        }
      }
      delete active.responseId
    }
    active.responding = false
    active.playing = false
  }

  #setState(active: ActiveSession, state: OrboConversationState): void {
    if (active.state !== state) {
      active.state = state
      active.handlers.onStateChange(state)
    }
  }

  #fail(active: ActiveSession, error: Error): void {
    if (active.closed) {
      return
    }
    active.failure = error
    this.#close(active, error)
  }

  #close(active: ActiveSession, error?: Error): void {
    if (active.closed) {
      return
    }
    active.closed = true
    if (this.#active === active) {
      this.#active = undefined
    }
    active.controller.abort()
    globalThis.clearTimeout(active.timeout)
    active.peer.ontrack = null
    active.peer.onconnectionstatechange = null
    active.channel.onopen = null
    active.channel.onclose = null
    active.channel.onerror = null
    active.channel.onmessage = null
    active.audio.onerror = null
    active.channel.close()
    active.peer.close()
    if (active.microphone) {
      for (const track of active.microphone.getTracks()) {
        track.onended = null
      }
      stopTracks(active.microphone)
    }
    for (const track of active.remoteTracks) {
      track.stop()
    }
    active.audio.pause()
    active.audio.srcObject = null
    active.audio.removeAttribute('src')
    this.#setState(active, error ? 'error' : 'idle')
    if (error) {
      active.handlers.onError(error)
    }
  }
}

function readResponseId(event: Record<string, unknown>): string | undefined {
  const nested = event.response
  const value =
    event.response_id ??
    (nested && typeof nested === 'object' ? Reflect.get(nested, 'id') : undefined)
  return typeof value === 'string' && value.length <= 256 && /^[\w-]+$/.test(value)
    ? value
    : undefined
}

function stopTracks(stream: MediaStream): void {
  for (const track of stream.getTracks()) {
    track.stop()
  }
}

function untilAborted<T>(work: Promise<T>, signal: AbortSignal): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const aborted = (): void => reject(realtimeError('Realtime session was stopped.', 'AbortError'))
    if (signal.aborted) {
      aborted()
    } else {
      signal.addEventListener('abort', aborted, { once: true })
    }
    // Observe late rejection even after cancellation and remove listeners in either case.
    work.then(resolve, reject).finally(() => signal.removeEventListener('abort', aborted))
  })
}

function realtimeError(message: string, name = 'OrboRealtimeError'): Error {
  const error = new Error(message)
  error.name = name
  return error
}

function sanitizeRealtimeError(error: unknown): Error {
  if (error instanceof Error && error.name === 'NotAllowedError') {
    return realtimeError(
      'Realtime audio requires microphone permission and user activation.',
      'NotAllowedError'
    )
  }
  // Do not expose callback exceptions, endpoint bodies, SDP, or provider payloads.
  return realtimeError('Realtime audio could not start or continue.')
}
