import type {
  OrboPresetName,
  OrboReducedMotion,
  OrboSize,
  OrboState
} from '@core/appearance/appearance.types'
import type { OrboElement } from '@element/element.types'
import type { OrboRealtimeSession, OrboVoiceModel } from '@talk/voice-model.types'
import type { DetailedHTMLProps, HTMLAttributes } from 'react'

export interface OrboReactAttributes {
  voiceModel?: OrboVoiceModel
  realtimeSession?: OrboRealtimeSession
  'color-accent'?: string
  'color-background'?: string
  'color-highlight'?: string
  'color-primary'?: string
  'color-secondary'?: string
  /** Use Orbo presets/properties and an outer element for layout styling. */
  className?: never
  elevated?: boolean | string
  paused?: boolean | string
  preset?: OrboPresetName
  'reduced-motion'?: OrboReducedMotion
  size?: OrboSize
  speech?: string
  speed?: number | string
  state?: OrboState
}

type OrboReactHostProps = Omit<
  DetailedHTMLProps<HTMLAttributes<OrboElement>, OrboElement>,
  'className'
>

export type OrboReactIntrinsicProps = OrboReactHostProps & OrboReactAttributes

declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      'orb-o': OrboReactIntrinsicProps
    }
  }
}
