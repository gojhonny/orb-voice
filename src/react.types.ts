import type {
  OrbVoicePresetName,
  OrbVoiceReducedMotion,
  OrbVoiceSize,
  OrbVoiceState
} from '@core/appearance/appearance.types'
import type { OrbVoiceElement } from '@element/element.types'
import type { OrbVoiceRealtimeSession, OrbVoiceVoiceModel } from '@talk/voice-model.types'
import type { DetailedHTMLProps, HTMLAttributes } from 'react'

export interface OrbVoiceReactAttributes {
  voiceModel?: OrbVoiceVoiceModel
  realtimeSession?: OrbVoiceRealtimeSession
  'color-accent'?: string
  'color-background'?: string
  'color-highlight'?: string
  'color-primary'?: string
  'color-secondary'?: string
  /** Use Orb Voice presets/properties and an outer element for layout styling. */
  className?: never
  elevated?: boolean | string
  paused?: boolean | string
  preset?: OrbVoicePresetName
  'reduced-motion'?: OrbVoiceReducedMotion
  size?: OrbVoiceSize
  speech?: string
  speed?: number | string
  state?: OrbVoiceState
}

type OrbVoiceReactHostProps = Omit<
  DetailedHTMLProps<HTMLAttributes<OrbVoiceElement>, OrbVoiceElement>,
  'className'
>

export type OrbVoiceReactIntrinsicProps = OrbVoiceReactHostProps & OrbVoiceReactAttributes

declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      'orb-voice': OrbVoiceReactIntrinsicProps
    }
  }
}
