import type {
  OrbuPresetName,
  OrbuReducedMotion,
  OrbuSize,
  OrbuState
} from '@core/appearance/appearance.types'
import type { OrbuElement } from '@element/element.types'
import type { OrbuRealtimeSession, OrbuVoiceModel } from '@talk/voice-model.types'
import type { DetailedHTMLProps, HTMLAttributes } from 'react'

export interface OrbuReactAttributes {
  voiceModel?: OrbuVoiceModel
  realtimeSession?: OrbuRealtimeSession
  'color-accent'?: string
  'color-background'?: string
  'color-highlight'?: string
  'color-primary'?: string
  'color-secondary'?: string
  /** Use Orbu presets/properties and an outer element for layout styling. */
  className?: never
  elevated?: boolean | string
  paused?: boolean | string
  preset?: OrbuPresetName
  'reduced-motion'?: OrbuReducedMotion
  size?: OrbuSize
  speech?: string
  speed?: number | string
  state?: OrbuState
}

type OrbuReactHostProps = Omit<
  DetailedHTMLProps<HTMLAttributes<OrbuElement>, OrbuElement>,
  'className'
>

export type OrbuReactIntrinsicProps = OrbuReactHostProps & OrbuReactAttributes

declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      'orb-u': OrbuReactIntrinsicProps
    }
  }
}
