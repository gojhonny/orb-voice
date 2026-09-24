export type {
  OrboBaseOptions,
  OrboColorOverrides,
  OrboColorSelection,
  OrboColors,
  OrboCustomColorOptions,
  OrboOptions,
  OrboPresetName,
  OrboPresetOptions,
  OrboReducedMotion,
  OrboSize,
  OrboState
} from '@core/appearance/appearance.types'
export { mergeOrboColors } from '@core/appearance/merge-colors.compute'
export {
  config,
  DEFAULT_ORBO_COLORS,
  DEFAULT_ORBO_PRESET,
  DEFAULT_ORBO_REDUCED_MOTION,
  DEFAULT_ORBO_SIZE,
  DEFAULT_ORBO_SPEED,
  DEFAULT_ORBO_STATE,
  ORBO_COLOR_ATTRIBUTES,
  ORBO_COLOR_KEYS,
  ORBO_PRESET_NAMES,
  ORBO_PRESETS,
  ORBO_REDUCED_MOTION_MODES,
  ORBO_STATES,
  orboConfiguration
} from '@core/config.data'
export { isOrboPresetName } from '@core/lib/is-preset-name.guard'
export { isOrboState } from '@core/lib/is-state.guard'
export { normalizeOrboPreset } from '@core/lib/normalize-preset.compute'
export { normalizeOrboReducedMotion } from '@core/lib/normalize-reduced-motion.compute'
export { normalizeOrboSize } from '@core/lib/normalize-size.compute'
export { normalizeOrboSpeed } from '@core/lib/normalize-speed.compute'
export { normalizeOrboState } from '@core/lib/normalize-state.compute'
export { isOrboReducedMotion } from '@core/motion/is-reduced-motion.guard'
export { ORBO_OBSERVED_ATTRIBUTES, ORBO_TAG_NAME } from '@element/element.data'
export type {
  OrboElement,
  OrboElementConstructor,
  OrboVoiceOptions
} from '@element/element.types'
export { orboElementClassFactory } from '@factories/element-class.factory'
export type { OrboIntelligencePort } from '@ports/intelligence.port'
export type { OrboVoiceEnginePort } from '@ports/voice-engine.port'
export { defineOrbo } from '@services/registration.service'
export { OpenAISpeechAdapter } from '@talk/openai-speech.adapter'
export { DEFAULT_SPEECH_LANGUAGE, DEFAULT_TALK_FLOW, talk } from '@talk/talk.data'
export type {
  OpenAISpeechAdapterOptions,
  OpenAISpeechFormat,
  OpenAISpeechModel,
  OpenAISpeechVoice,
  OrboTalkContext,
  OrboTalkStep,
  WebSpeechAdapterOptions
} from '@talk/talk.types'
export { WebSpeechAdapter } from '@talk/web-speech.adapter'

export { OpenAIRealtimeAdapter } from '@talk/openai-realtime.adapter'
export type {
  OpenAIRealtimeAdapterOptions,
  OpenAIRealtimeModel,
  OrboOpenAIRealtimeVoiceModel,
  OrboOpenAISpeechVoiceModel,
  OrboRealtimeSession,
  OrboRealtimeSessionAuthorizer,
  OrboRealtimeSessionEndpoint,
  OrboRealtimeSessionRequest,
  OrboVoiceModel,
  OrboWebSpeechVoiceModel
} from '@talk/voice-model.types'
export type {
  OrboConversationHandlers,
  OrboConversationPort,
  OrboConversationState,
  OrboTranscript
} from '@ports/conversation.port'

export { transformOrboConfiguration } from '@core/lib/transform-configuration.compute'
export type { OrboConfiguration, OrboConfigurationSource, OrboDeepReadonly } from '@core/config.types'
