export type {
  OrbuBaseOptions,
  OrbuColorOverrides,
  OrbuColorSelection,
  OrbuColors,
  OrbuCustomColorOptions,
  OrbuOptions,
  OrbuPresetName,
  OrbuPresetOptions,
  OrbuReducedMotion,
  OrbuSize,
  OrbuState
} from '@core/appearance/appearance.types'
export { mergeOrbuColors } from '@core/appearance/merge-colors.compute'
export {
  config,
  DEFAULT_ORBU_COLORS,
  DEFAULT_ORBU_PRESET,
  DEFAULT_ORBU_REDUCED_MOTION,
  DEFAULT_ORBU_SIZE,
  DEFAULT_ORBU_SPEED,
  DEFAULT_ORBU_STATE,
  ORBU_COLOR_ATTRIBUTES,
  ORBU_COLOR_KEYS,
  ORBU_PRESET_NAMES,
  ORBU_PRESETS,
  ORBU_REDUCED_MOTION_MODES,
  ORBU_STATES,
  orbuConfiguration
} from '@core/config.data'
export { isOrbuPresetName } from '@core/lib/is-preset-name.guard'
export { isOrbuState } from '@core/lib/is-state.guard'
export { normalizeOrbuPreset } from '@core/lib/normalize-preset.compute'
export { normalizeOrbuReducedMotion } from '@core/lib/normalize-reduced-motion.compute'
export { normalizeOrbuSize } from '@core/lib/normalize-size.compute'
export { normalizeOrbuSpeed } from '@core/lib/normalize-speed.compute'
export { normalizeOrbuState } from '@core/lib/normalize-state.compute'
export { isOrbuReducedMotion } from '@core/motion/is-reduced-motion.guard'
export { ORBU_OBSERVED_ATTRIBUTES, ORBU_TAG_NAME } from '@element/element.data'
export type {
  OrbuElement,
  OrbuElementConstructor,
  OrbuVoiceOptions
} from '@element/element.types'
export { orbuElementClassFactory } from '@factories/element-class.factory'
export type { OrbuIntelligencePort } from '@ports/intelligence.port'
export type { OrbuVoiceEnginePort } from '@ports/voice-engine.port'
export { defineOrbu } from '@services/registration.service'
export { OpenAISpeechAdapter } from '@talk/openai-speech.adapter'
export { DEFAULT_SPEECH_LANGUAGE, DEFAULT_TALK_FLOW, talk } from '@talk/talk.data'
export type {
  OpenAISpeechAdapterOptions,
  OpenAISpeechFormat,
  OpenAISpeechModel,
  OpenAISpeechVoice,
  OrbuTalkContext,
  OrbuTalkStep,
  WebSpeechAdapterOptions
} from '@talk/talk.types'
export { WebSpeechAdapter } from '@talk/web-speech.adapter'

export { OpenAIRealtimeAdapter } from '@talk/openai-realtime.adapter'
export type {
  OpenAIRealtimeAdapterOptions,
  OpenAIRealtimeModel,
  OrbuOpenAIRealtimeVoiceModel,
  OrbuOpenAISpeechVoiceModel,
  OrbuRealtimeSession,
  OrbuRealtimeSessionAuthorizer,
  OrbuRealtimeSessionEndpoint,
  OrbuRealtimeSessionRequest,
  OrbuVoiceModel,
  OrbuWebSpeechVoiceModel
} from '@talk/voice-model.types'
export type {
  OrbuConversationHandlers,
  OrbuConversationPort,
  OrbuConversationState,
  OrbuTranscript
} from '@ports/conversation.port'

export { transformOrbuConfiguration } from '@core/lib/transform-configuration.compute'
export type { OrbuConfiguration, OrbuConfigurationSource, OrbuDeepReadonly } from '@core/config.types'
