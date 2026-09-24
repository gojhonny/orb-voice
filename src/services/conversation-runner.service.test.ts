import type { OrboConversationHandlers } from '@ports/conversation.port'
import { describe, expect, it, vi } from 'vitest'

import { OrboConversationRunnerService } from './conversation-runner.service'

describe('service/conversation-runner', () => {
  it('ignores events and rejection from a superseded startup', async () => {
    const handlers = { onStateChange: vi.fn(), onTranscript: vi.fn(), onError: vi.fn() }
    const runner = new OrboConversationRunnerService(handlers)
    let rejectStartup: (error: Error) => void = () => {}
    const pending = new Promise<void>((_resolve, reject) => {
      rejectStartup = reject
    })
    let oldHandlers: OrboConversationHandlers | undefined
    const first = {
      start: vi.fn((callbacks: OrboConversationHandlers) => {
        oldHandlers = callbacks
        callbacks.onStateChange('connecting')
        return pending
      }),
      stop: vi.fn(),
      interrupt: vi.fn()
    }
    const firstStart = runner.start(first)
    const second = {
      start: vi.fn(async (callbacks: OrboConversationHandlers) => {
        callbacks.onStateChange('listening')
      }),
      stop: vi.fn(),
      interrupt: vi.fn()
    }

    await runner.start(second)
    oldHandlers?.onStateChange('error')
    oldHandlers?.onTranscript({ role: 'assistant', text: 'Old response', final: true })
    oldHandlers?.onError(new Error('Old failure'))
    rejectStartup(new Error('Old startup failed'))
    await firstStart
    runner.interrupt()

    expect(runner.state).toBe('listening')
    expect(first.stop).toHaveBeenCalledOnce()
    expect(second.interrupt).toHaveBeenCalledOnce()
    expect(handlers.onTranscript).not.toHaveBeenCalled()
    expect(handlers.onError).not.toHaveBeenCalled()
    runner.stop()
  })

  it('retires a failed startup before late callbacks or interruption can reach it', async () => {
    const handlers = { onStateChange: vi.fn(), onTranscript: vi.fn(), onError: vi.fn() }
    const runner = new OrboConversationRunnerService(handlers)
    let failedHandlers: OrboConversationHandlers | undefined
    const conversation = {
      start: vi.fn(async (callbacks: OrboConversationHandlers) => {
        failedHandlers = callbacks
        throw new Error('Private provider diagnostic')
      }),
      stop: vi.fn(),
      interrupt: vi.fn()
    }

    await expect(runner.start(conversation)).rejects.toThrow('Orbo conversation could not start.')
    failedHandlers?.onStateChange('speaking')
    failedHandlers?.onTranscript({ role: 'assistant', text: 'Late response', final: true })
    failedHandlers?.onError(new Error('Late failure'))
    runner.interrupt()

    expect(runner.state).toBe('error')
    expect(conversation.stop).toHaveBeenCalledOnce()
    expect(conversation.interrupt).not.toHaveBeenCalled()
    expect(handlers.onTranscript).not.toHaveBeenCalled()
    expect(handlers.onError).toHaveBeenCalledOnce()
  })
})
