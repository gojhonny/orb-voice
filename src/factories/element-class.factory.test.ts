import { ORBU_TAG_NAME } from '@element/element.data'
import type { OrbuElement } from '@element/element.types'
import { defineOrbu } from '@services/registration.service'
import { beforeAll, describe, expect, it, vi } from 'vitest'

function createOrbu(): OrbuElement {
  const element = document.createElement(ORBU_TAG_NAME) as OrbuElement
  document.body.append(element)
  return element
}

describe('factory/element-class', () => {
  beforeAll(() => {
    defineOrbu()
  })

  it('keeps the visual shadow tree closed', () => {
    expect(createOrbu().shadowRoot).toBeNull()
  })

  it('uses NeonGate by default and reflects canonical and deprecated preset assignments', () => {
    const orb = createOrbu()
    expect(orb.preset).toBe('neongate')
    orb.preset = 'neongate'
    expect(orb.getAttribute('preset')).toBe('neongate')
    orb.setAttribute('preset', 'gojhonny')
    expect(orb.getAttribute('preset')).toBe('neongate')
    expect(orb.preset).toBe('neongate')
    orb.preset = 'gojhonny'
    expect(orb.getAttribute('preset')).toBe('neongate')
    orb.preset = 'peach'
    expect(orb.getAttribute('preset')).toBe('peach')
    orb.removeAttribute('preset')
    expect(orb.preset).toBe('neongate')
  })

  it('normalizes reflected appearance and speech attributes', () => {
    const orb = createOrbu()

    orb.setAttribute('state', 'unknown')
    orb.setAttribute('size', ' 20rem ')
    orb.speech = '  Olá, mundo.  '

    expect(orb.state).toBe('idle')
    expect(orb.getAttribute('state')).toBe('idle')
    expect(orb.size).toBe('20rem')
    expect(orb.getAttribute('size')).toBe('20rem')
    expect(orb.speech).toBe('Olá, mundo.')
    expect(orb.getAttribute('speech')).toBe('Olá, mundo.')

    orb.speech = '   '
    expect(orb.speech).toBeUndefined()
    expect(orb.hasAttribute('speech')).toBe(false)
  })

  it('does not speak when no speech or explicit flow exists', async () => {
    const voiceEngine = {
      speak: vi.fn(async (_text: string) => undefined),
      stop: vi.fn()
    }
    const orb = createOrbu()
    orb.voiceEngine = voiceEngine

    await orb.startTalking()

    expect(voiceEngine.speak).not.toHaveBeenCalled()
  })

  it('keeps Realtime selection inert and preserves explicit custom output precedence', async () => {
    const authorize = vi.fn(async () => 'v=0\r\n')
    const voiceEngine = {
      speak: vi.fn(async (_text: string) => undefined),
      stop: vi.fn()
    }
    const orb = createOrbu()
    orb.voiceEngine = voiceEngine
    orb.voiceModel = { provider: 'openai-realtime', model: 'gpt-realtime-2' }
    orb.realtimeSession = authorize
    orb.speech = 'Consumer text'

    expect(orb.conversationState).toBe('idle')
    expect(voiceEngine.speak).not.toHaveBeenCalled()
    expect(authorize).not.toHaveBeenCalled()
    expect(orb.hasAttribute('voice-model')).toBe(false)
    expect(orb.hasAttribute('realtime-session')).toBe(false)

    await orb.startTalking()
    expect(voiceEngine.speak).toHaveBeenCalledWith('Consumer text')
    await expect(orb.startConversation()).rejects.toThrow('Clear the custom voiceEngine')
    expect(authorize).not.toHaveBeenCalled()
  })

  it('speaks explicit content and restores the prior visual state', async () => {
    const voiceEngine = {
      speak: vi.fn(async (_text: string) => undefined),
      stop: vi.fn()
    }
    const speakingStates: boolean[] = []
    const orb = createOrbu()
    orb.state = 'thinking'
    orb.speech = 'Olá, mundo.'
    orb.voiceEngine = voiceEngine
    orb.addEventListener('orbu-speaking-change', (event) => {
      speakingStates.push((event as CustomEvent<{ speaking: boolean }>).detail.speaking)
    })

    await orb.startTalking()

    expect(voiceEngine.speak).toHaveBeenCalledWith('Olá, mundo.')
    expect(speakingStates).toEqual([true, false])
    expect(orb.state).toBe('thinking')
  })

  it('emits an error when explicit speech has no engine', async () => {
    const errors: unknown[] = []
    const orb = createOrbu()
    orb.speech = 'Olá.'
    orb.addEventListener('orbu-talk-error', (event) => {
      errors.push((event as CustomEvent<{ error: unknown }>).detail.error)
    })

    await expect(orb.startTalking()).rejects.toThrow(
      'Orbu voiceEngine must be configured before startTalking().'
    )
    expect(errors).toHaveLength(1)
  })
})
