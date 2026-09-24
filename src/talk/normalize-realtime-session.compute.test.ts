import type { OrbuElement } from '@element/element.types'
import { defineOrbu } from '@services/registration.service'
import { beforeAll, describe, expect, it, vi } from 'vitest'

import { normalizeRealtimeSession } from './normalize-realtime-session.compute'
import { OpenAIRealtimeAdapter } from './openai-realtime.adapter'
import type { OrbuRealtimeSessionEndpoint } from './voice-model.types'

describe('talk/realtime-session-boundary', () => {
  beforeAll(() => {
    defineOrbu()
  })

  it.each(['apiKey', 'token', 'secret', 'headers'])('rejects %s without echoing values', (key) => {
    const value = { endpoint: '/api/session', [key]: 'synthetic-private-value' }
    expect(() => normalizeRealtimeSession(value)).toThrow(TypeError)
    try {
      normalizeRealtimeSession(value)
    } catch (error) {
      expect(String(error)).not.toContain('synthetic-private-value')
    }
  })

  it('rejects accessors without invoking them and rejects hidden extra fields', () => {
    const read = vi.fn(() => '/api/session')
    expect(() =>
      normalizeRealtimeSession(Object.defineProperty({}, 'endpoint', { get: read }))
    ).toThrow(TypeError)
    expect(read).not.toHaveBeenCalled()
    const hidden = Object.defineProperty({ endpoint: '/api/session' }, 'token', {
      value: 'synthetic-private-value'
    })
    expect(() => normalizeRealtimeSession(hidden)).toThrow(TypeError)
    expect(() =>
      normalizeRealtimeSession({ endpoint: '/api/session', [Symbol('token')]: 'synthetic' })
    ).toThrow(TypeError)
  })

  it('snapshots a mutable URL and freezes only the copied endpoint configuration', () => {
    const endpoint = new URL('https://application.example/api/session')
    const input: OrbuRealtimeSessionEndpoint = { endpoint, credentials: 'same-origin' }
    const result = normalizeRealtimeSession(input)
    endpoint.pathname = '/changed'
    input.credentials = 'omit'
    expect(result).toEqual({
      endpoint: 'https://application.example/api/session',
      credentials: 'same-origin'
    })
    expect(Object.isFrozen(result)).toBe(true)
    expect(Object.isFrozen(input)).toBe(false)
  })

  it('accepts an inert application callback and valid fetch policy, never credential values', () => {
    const authorize = vi.fn(async () => 'v=0\r\n')
    expect(normalizeRealtimeSession(authorize)).toBe(authorize)
    expect(authorize).not.toHaveBeenCalled()
    for (const credentials of ['omit', 'same-origin', 'include']) {
      expect(normalizeRealtimeSession({ endpoint: '/session', credentials })).toEqual({
        endpoint: '/session',
        credentials
      })
    }
    expect(() =>
      normalizeRealtimeSession({ endpoint: '/session', credentials: 'synthetic-token' })
    ).toThrow(TypeError)
    expect(() => normalizeRealtimeSession({ endpoint: '/session', fetch: 'not-callable' })).toThrow(
      TypeError
    )
  })

  it('guards direct adapter construction as well as the native property', () => {
    const session = { endpoint: '/session', apiKey: 'synthetic-private-value' }
    expect(() => new OpenAIRealtimeAdapter({ session })).toThrow(TypeError)
    const orb = document.createElement('orb-u') as OrbuElement
    orb.realtimeSession = { endpoint: '/original' }
    const previous = orb.realtimeSession
    const stop = vi.spyOn(orb, 'stopConversation')
    expect(() => Reflect.set(orb, 'realtimeSession', session)).toThrow(TypeError)
    expect(orb.realtimeSession).toBe(previous)
    expect(stop).not.toHaveBeenCalled()
    expect(orb.hasAttribute('realtime-session')).toBe(false)
  })

  it('keeps model settings out of markup and rejects secret-bearing selections', () => {
    const orb = document.createElement('orb-u') as OrbuElement
    orb.voiceModel = { provider: 'openai-realtime', model: 'gpt-realtime-2' }
    const previous = orb.voiceModel
    expect(orb.hasAttribute('voice-model')).toBe(false)
    expect(() =>
      Reflect.set(orb, 'voiceModel', {
        provider: 'openai-realtime',
        apiKey: 'synthetic-private-value'
      })
    ).toThrow(TypeError)
    expect(orb.voiceModel).toBe(previous)
  })
})
