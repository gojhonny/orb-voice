export type {
  OrbVBaseOptions,
  OrbVColorOverrides,
  OrbVColorSelection,
  OrbVColors,
  OrbVCustomColorOptions,
  OrbVOptions,
  OrbVPresetName,
  OrbVPresetOptions,
  OrbVReducedMotion,
  OrbVSize,
  OrbVState
} from '@core/appearance/appearance.types'
export { mergeOrbVColors } from '@core/appearance/merge-colors.compute'
export {
  config,
  DEFAULT_ORBV_COLORS,
  DEFAULT_ORBV_PRESET,
  DEFAULT_ORBV_REDUCED_MOTION,
  DEFAULT_ORBV_SIZE,
  DEFAULT_ORBV_SPEED,
  DEFAULT_ORBV_STATE,
  ORBV_COLOR_ATTRIBUTES,
  ORBV_COLOR_KEYS,
  ORBV_PRESET_NAMES,
  ORBV_PRESETS,
  ORBV_REDUCED_MOTION_MODES,
  ORBV_STATES,
  orbvConfiguration
} from '@core/config.data'
export { isOrbVPresetName } from '@core/lib/is-preset-name.guard'
export { isOrbVState } from '@core/lib/is-state.guard'
export { normalizeOrbVPreset } from '@core/lib/normalize-preset.compute'
export { normalizeOrbVReducedMotion } from '@core/lib/normalize-reduced-motion.compute'
export { normalizeOrbVSize } from '@core/lib/normalize-size.compute'
export { normalizeOrbVSpeed } from '@core/lib/normalize-speed.compute'
export { normalizeOrbVState } from '@core/lib/normalize-state.compute'
export { isOrbVReducedMotion } from '@core/motion/is-reduced-motion.guard'
export { ORBV_OBSERVED_ATTRIBUTES, ORBV_TAG_NAME } from '@element/element.data'
export type {
  OrbVElement,
  OrbVElementConstructor,
  OrbVVoiceOptions
} from '@element/element.types'
export { orbvElementClassFactory } from '@factories/element-class.factory'
export type { OrbVIntelligencePort } from '@ports/intelligence.port'
export type { OrbVVoiceEnginePort } from '@ports/voice-engine.port'
export { defineOrbV } from '@services/registration.service'
export { OpenAISpeechAdapter } from '@talk/openai-speech.adapter'
export { DEFAULT_SPEECH_LANGUAGE, DEFAULT_TALK_FLOW, talk } from '@talk/talk.data'
export type {
  OpenAISpeechAdapterOptions,
  OpenAISpeechFormat,
  OpenAISpeechModel,
  OpenAISpeechVoice,
  OrbVTalkContext,
  OrbVTalkStep,
  WebSpeechAdapterOptions
} from '@talk/talk.types'
export { WebSpeechAdapter } from '@talk/web-speech.adapter'

export { OpenAIRealtimeAdapter } from '@talk/openai-realtime.adapter'
export type {
  OpenAIRealtimeAdapterOptions,
  OpenAIRealtimeModel,
  OrbVOpenAIRealtimeVoiceModel,
  OrbVOpenAISpeechVoiceModel,
  OrbVRealtimeSession,
  OrbVRealtimeSessionAuthorizer,
  OrbVRealtimeSessionEndpoint,
  OrbVRealtimeSessionRequest,
  OrbVVoiceModel,
  OrbVWebSpeechVoiceModel
} from '@talk/voice-model.types'
export type {
  OrbVConversationHandlers,
  OrbVConversationPort,
  OrbVConversationState,
  OrbVTranscript
} from '@ports/conversation.port'

export { transformOrbVConfiguration } from '@core/lib/transform-configuration.compute'
export type { OrbVConfiguration, OrbVConfigurationSource, OrbVDeepReadonly } from '@core/config.types'
