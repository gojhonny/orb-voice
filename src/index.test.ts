/**
 * @vitest-environment node
 */
import { describe, expect, it } from 'vitest'

describe('core/ssr-entry', () => {
  it('imports without evaluating an HTMLElement subclass', async () => {
    const orbVoice = await import('./index')

    expect(globalThis.HTMLElement).toBeUndefined()
    expect(orbVoice.orbVoiceElementClassFactory()).toBeUndefined()
    expect(orbVoice.defineOrbVoice()).toBeUndefined()
    expect(orbVoice.ORB_VOICE_TAG_NAME).toBe('orb-voice')
    expect(orbVoice.orbVoiceConfiguration.component.tagName).toBe('orb-voice')
  })
})
