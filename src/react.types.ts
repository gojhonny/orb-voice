import type {
  OrbVPresetName,
  OrbVReducedMotion,
  OrbVSize,
  OrbVState
} from '@core/appearance/appearance.types'
import type { OrbVElement } from '@element/element.types'
import type { OrbVRealtimeSession, OrbVVoiceModel } from '@talk/voice-model.types'
import type { DetailedHTMLProps, HTMLAttributes } from 'react'

export interface OrbVReactAttributes {
  voiceModel?: OrbVVoiceModel
  realtimeSession?: OrbVRealtimeSession
  'color-accent'?: string
  'color-background'?: string
  'color-highlight'?: string
  'color-primary'?: string
  'color-secondary'?: string
  /** Use OrbV presets/properties and an outer element for layout styling. */
  className?: never
  elevated?: boolean | string
  paused?: boolean | string
  preset?: OrbVPresetName
  'reduced-motion'?: OrbVReducedMotion
  size?: OrbVSize
  speech?: string
  speed?: number | string
  state?: OrbVState
}

type OrbVReactHostProps = Omit<
  DetailedHTMLProps<HTMLAttributes<OrbVElement>, OrbVElement>,
  'className'
>

export type OrbVReactIntrinsicProps = OrbVReactHostProps & OrbVReactAttributes

declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      'orb-v': OrbVReactIntrinsicProps
    }
  }
}
