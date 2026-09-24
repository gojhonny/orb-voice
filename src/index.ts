export type {
  OrbVoiceBaseOptions,
  OrbVoiceColorOverrides,
  OrbVoiceColorSelection,
  OrbVoiceColors,
  OrbVoiceCustomColorOptions,
  OrbVoiceOptions,
  OrbVoicePresetName,
  OrbVoicePresetOptions,
  OrbVoiceReducedMotion,
  OrbVoiceSize,
  OrbVoiceState
} from '@core/appearance/appearance.types'
export { mergeOrbVoiceColors } from '@core/appearance/merge-colors.compute'
export {
  config,
  DEFAULT_ORB_VOICE_COLORS,
  DEFAULT_ORB_VOICE_PRESET,
  DEFAULT_ORB_VOICE_REDUCED_MOTION,
  DEFAULT_ORB_VOICE_SIZE,
  DEFAULT_ORB_VOICE_SPEED,
  DEFAULT_ORB_VOICE_STATE,
  ORB_VOICE_COLOR_ATTRIBUTES,
  ORB_VOICE_COLOR_KEYS,
  ORB_VOICE_PRESET_NAMES,
  ORB_VOICE_PRESETS,
  ORB_VOICE_REDUCED_MOTION_MODES,
  ORB_VOICE_STATES,
  orbVoiceConfiguration
} from '@core/config.data'
export { isOrbVoicePresetName } from '@core/lib/is-preset-name.guard'
export { isOrbVoiceState } from '@core/lib/is-state.guard'
export { normalizeOrbVoicePreset } from '@core/lib/normalize-preset.compute'
export { normalizeOrbVoiceReducedMotion } from '@core/lib/normalize-reduced-motion.compute'
export { normalizeOrbVoiceSize } from '@core/lib/normalize-size.compute'
export { normalizeOrbVoiceSpeed } from '@core/lib/normalize-speed.compute'
export { normalizeOrbVoiceState } from '@core/lib/normalize-state.compute'
export { isOrbVoiceReducedMotion } from '@core/motion/is-reduced-motion.guard'
export { ORB_VOICE_OBSERVED_ATTRIBUTES, ORB_VOICE_TAG_NAME } from '@element/element.data'
export type {
  OrbVoiceElement,
  OrbVoiceElementConstructor,
  OrbVoiceVoiceOptions
} from '@element/element.types'
export { orbVoiceElementClassFactory } from '@factories/element-class.factory'
export type { OrbVoiceIntelligencePort } from '@ports/intelligence.port'
export type { OrbVoiceVoiceEnginePort } from '@ports/voice-engine.port'
export { defineOrbVoice } from '@services/registration.service'
export { OpenAISpeechAdapter } from '@talk/openai-speech.adapter'
export { DEFAULT_SPEECH_LANGUAGE, DEFAULT_TALK_FLOW, talk } from '@talk/talk.data'
export type {
  OpenAISpeechAdapterOptions,
  OpenAISpeechFormat,
  OpenAISpeechModel,
  OpenAISpeechVoice,
  OrbVoiceTalkContext,
  OrbVoiceTalkStep,
  WebSpeechAdapterOptions
} from '@talk/talk.types'
export { WebSpeechAdapter } from '@talk/web-speech.adapter'

export { OpenAIRealtimeAdapter } from '@talk/openai-realtime.adapter'
export type {
  OpenAIRealtimeAdapterOptions,
  OpenAIRealtimeModel,
  OrbVoiceOpenAIRealtimeVoiceModel,
  OrbVoiceOpenAISpeechVoiceModel,
  OrbVoiceRealtimeSession,
  OrbVoiceRealtimeSessionAuthorizer,
  OrbVoiceRealtimeSessionEndpoint,
  OrbVoiceRealtimeSessionRequest,
  OrbVoiceVoiceModel,
  OrbVoiceWebSpeechVoiceModel
} from '@talk/voice-model.types'
export type {
  OrbVoiceConversationHandlers,
  OrbVoiceConversationPort,
  OrbVoiceConversationState,
  OrbVoiceTranscript
} from '@ports/conversation.port'

export { transformOrbVoiceConfiguration } from '@core/lib/transform-configuration.compute'
export type { OrbVoiceConfiguration, OrbVoiceConfigurationSource, OrbVoiceDeepReadonly } from '@core/config.types'
