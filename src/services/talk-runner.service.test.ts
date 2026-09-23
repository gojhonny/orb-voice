import { OrbVTalkRunnerService } from '@services/talk-runner.service'
import type { OrbVTalkStep } from '@talk/talk.types'
import { describe, expect, it, vi } from 'vitest'

describe('service/talk-runner', () => {
  it('treats blank direct speech and an empty flow as silence', async () => {
    const onSpeakingChange = vi.fn()
    const onError = vi.fn()
    const runner = new OrbVTalkRunnerService(onSpeakingChange, onError)

    await runner.speak('   ')
    await runner.start([])

    expect(onSpeakingChange).not.toHaveBeenCalled()
    expect(onError).not.toHaveBeenCalled()
  })

  it('speaks explicit text and exposes speaking transitions', async () => {
    const onSpeakingChange = vi.fn()
    const onError = vi.fn()
    const voiceEngine = {
      speak: vi.fn(async (_text: string) => undefined),
      stop: vi.fn()
    }
    const runner = new OrbVTalkRunnerService(onSpeakingChange, onError)
    runner.voiceEngine = voiceEngine

    await runner.speak('  Olá, Jonny.  ')

    expect(voiceEngine.speak).toHaveBeenCalledOnce()
    expect(voiceEngine.speak).toHaveBeenCalledWith('Olá, Jonny.')
    expect(onSpeakingChange.mock.calls).toEqual([[true], [false]])
    expect(onError).not.toHaveBeenCalled()
  })

  it('supports an explicit consumer-owned conversational flow', async () => {
    const voiceEngine = {
      speak: vi.fn(async (_text: string) => undefined),
      stop: vi.fn()
    }
    const runner = new OrbVTalkRunnerService(vi.fn(), vi.fn())
    const flow: readonly OrbVTalkStep[] = [
      {
        id: 'welcome',
        kind: 'say',
        needsAuth: false,
        text: 'Olá.'
      },
      {
        capture: 'fullName',
        id: 'ask-name',
        kind: 'ask',
        needsAuth: false,
        text: 'Qual é o seu nome?'
      },
      {
        id: 'confirm-name',
        kind: 'say',
        needsAuth: false,
        text: 'Prazer, {{fullName}}.'
      }
    ]
    runner.voiceEngine = voiceEngine

    await runner.start(flow)
    await runner.receive('Jonny')

    expect(voiceEngine.speak.mock.calls.map(([text]: [string]) => text)).toEqual([
      'Olá.',
      'Qual é o seu nome?',
      'Prazer, Jonny.'
    ])
    expect(runner.context).toEqual({ fullName: 'Jonny' })
  })

  it('reports a missing voice engine only when speech was requested', async () => {
    const onError = vi.fn()
    const runner = new OrbVTalkRunnerService(vi.fn(), onError)

    await expect(runner.speak('Olá.')).rejects.toThrow(
      'OrbV voiceEngine must be configured before startTalking().'
    )
    expect(onError).toHaveBeenCalledOnce()
  })
})
