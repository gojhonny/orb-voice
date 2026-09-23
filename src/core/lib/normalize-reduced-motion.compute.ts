import type { OrbVoiceReducedMotion } from '@core/appearance/appearance.types'
import { DEFAULT_ORB_VOICE_REDUCED_MOTION } from '@core/config.data'
import { isOrbVoiceReducedMotion } from '@core/motion/is-reduced-motion.guard'

export function normalizeOrbVoiceReducedMotion(value: unknown): OrbVoiceReducedMotion {
  return isOrbVoiceReducedMotion(value) ? value : DEFAULT_ORB_VOICE_REDUCED_MOTION
}
