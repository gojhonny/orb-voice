import { ORB_VOICE_DEFAULT_APPEARANCE_BY_STATE } from '@core/appearance/appearance.data'
import type { OrbVoiceResolvedConfigurationSource } from '@core/config.types'
import { ORB_VOICE_DEFAULT_MOTION } from '@core/motion/default-motion.data'
import { ORB_VOICE_DEFAULT_SPEECH } from '@talk/default-speech.data'

import { cloneOrbVoiceConfigurationInput } from './clone-configuration.compute'

/** Validate a cloned input; diagnostics contain schema paths without supplied values. */
export function readOrbVoiceConfigurationSource(input: unknown): OrbVoiceResolvedConfigurationSource {
  const source = cloneOrbVoiceConfigurationInput(input)
  const root = record(source, '$', ['component', 'appearance', 'realtime'], ['motion', 'speech'])
  // Only absent legacy groups receive defaults. Explicit null/invalid input
  // still reaches validation, and every returned tree owns its nested data.
  if (!Object.hasOwn(root, 'motion')) root.motion = cloneOrbVoiceConfigurationInput(ORB_VOICE_DEFAULT_MOTION)
  if (!Object.hasOwn(root, 'speech')) root.speech = cloneOrbVoiceConfigurationInput(ORB_VOICE_DEFAULT_SPEECH)
  const component = record(root.component, '$.component', [
    'tagName',
    'states',
    'reducedMotionModes',
    'defaultState',
    'defaultSize',
    'defaultSpeed',
    'defaultReducedMotion',
    'observedAttributes'
  ])
  choice(component.tagName, '$.component.tagName', ['orb-voice'])
  const states = tuple(component.states, '$.component.states', [
    'idle',
    'listening',
    'thinking',
    'speaking',
    'asleep'
  ])
  const reducedModes = tuple(component.reducedMotionModes, '$.component.reducedMotionModes', [
    'system',
    'always',
    'never'
  ])
  choice(component.defaultState, '$.component.defaultState', states)
  choice(component.defaultReducedMotion, '$.component.defaultReducedMotion', reducedModes)
  positive(component.defaultSpeed, '$.component.defaultSpeed')
  const size = text(component.defaultSize, '$.component.defaultSize')
  if (Number.isFinite(Number(size))) {
    positive(Number(size), '$.component.defaultSize')
  } else {
    const length = /^([-+]?(?:\d+\.?\d*|\.\d+))(?:[a-z]+|%)$/i.exec(size.trim())
    if (length) {
      positive(Number(length[1]), '$.component.defaultSize')
    }
  }
  tuple(component.observedAttributes, '$.component.observedAttributes', [
    'state',
    'size',
    'speed',
    'speech',
    'paused',
    'elevated',
    'preset',
    'reduced-motion'
  ])

  const appearance = record(
    root.appearance,
    '$.appearance',
    ['defaultPreset', 'presetNames', 'colorKeys', 'colorAttributes', 'presets'],
    ['byState']
  )
  if (!Object.hasOwn(appearance, 'byState')) {
    appearance.byState = cloneOrbVoiceConfigurationInput(ORB_VOICE_DEFAULT_APPEARANCE_BY_STATE)
  }
  // The accidental 1.0.1 identifier is accepted only in its exact legacy shape.
  // Normalize our clone before canonical validation; preserve every palette value.
  if (Array.isArray(appearance.presetNames) && appearance.presetNames[0] === 'gojhonny') {
    tuple(appearance.presetNames, '$.appearance.presetNames', [
      'gojhonny',
      'periwinkle',
      'magenta',
      'peach',
      'mocha',
      'ivory'
    ])
    const legacy = record(appearance.presets, '$.appearance.presets', appearance.presetNames)
    appearance.presets = Object.fromEntries(
      Object.entries(legacy).map(([key, value]) => [key === 'gojhonny' ? 'neongate' : key, value])
    )
    appearance.presetNames[0] = 'neongate'
  }
  if (appearance.defaultPreset === 'gojhonny') appearance.defaultPreset = 'neongate'
  const presets = tuple(appearance.presetNames, '$.appearance.presetNames', [
    'neongate',
    'periwinkle',
    'magenta',
    'peach',
    'mocha',
    'ivory'
  ])
  const colors = tuple(appearance.colorKeys, '$.appearance.colorKeys', [
    'accent',
    'background',
    'highlight',
    'primary',
    'secondary'
  ])
  choice(appearance.defaultPreset, '$.appearance.defaultPreset', presets)
  const attributes = record(appearance.colorAttributes, '$.appearance.colorAttributes', colors)
  for (const color of colors) {
    choice(attributes[color], `$.appearance.colorAttributes.${color}`, [`color-${color}`])
  }
  const palettes = record(appearance.presets, '$.appearance.presets', presets)
  for (const preset of presets) {
    const path = `$.appearance.presets.${preset}`
    const palette = record(palettes[preset], path, colors)
    for (const color of colors) {
      const value = text(palette[color], `${path}.${color}`)
      if (!/^#(?:[\da-f]{3,4}|[\da-f]{6}|[\da-f]{8})$/i.test(value)) {
        invalid(`${path}.${color}`, 'expected a hexadecimal CSS color')
      }
    }
  }
  const byState = record(appearance.byState, '$.appearance.byState', states)
  for (const state of states) {
    const path = `$.appearance.byState.${state}`
    const profile = record(byState[state], path, ['contrast', 'saturation'])
    number(profile.contrast, `${path}.contrast`, 0)
    number(profile.saturation, `${path}.saturation`, 0)
  }

  const motion = record(root.motion, '$.motion', [
    'animatedStyleProperties',
    'easings',
    'full',
    'reduced'
  ])
  tuple(motion.animatedStyleProperties, '$.motion.animatedStyleProperties', [
    '--orb-voice-angle',
    'opacity',
    'rotate',
    'scale',
    'translate'
  ])
  const easings = record(motion.easings, '$.motion.easings', ['easeInOut', 'easeOut', 'linear'])
  choice(easings.easeInOut, '$.motion.easings.easeInOut', ['ease-in-out'])
  choice(easings.easeOut, '$.motion.easings.easeOut', ['ease-out'])
  choice(easings.linear, '$.motion.easings.linear', ['linear'])
  motionProfiles(motion.full, '$.motion.full', states, false)
  motionProfiles(motion.reduced, '$.motion.reduced', states, true)
  speechConfiguration(root.speech)
  realtimeConfiguration(root.realtime)
  return source as OrbVoiceResolvedConfigurationSource
}

function motionProfiles(
  value: unknown,
  path: string,
  states: readonly string[],
  reduced: boolean
): void {
  const profiles = record(value, path, states)
  for (const state of states) {
    const profilePath = `${path}.${state}`
    const layers = record(profiles[state], profilePath, [
      'aura',
      'core',
      'field',
      'highlight',
      'ring',
      'root'
    ])
    for (const layer of Object.keys(layers)) {
      const layerPath = `${profilePath}.${layer}`
      const motion = record(layers[layer], layerPath, ['animate', 'transition'])
      const animate = record(
        motion.animate,
        `${layerPath}.animate`,
        [],
        ['--orb-voice-angle', 'opacity', 'rotate', 'scale', 'x', 'y']
      )
      if (Object.keys(animate).length === 0) {
        invalid(`${layerPath}.animate`, 'expected at least one animated property')
      }
      for (const [property, series] of Object.entries(animate)) {
        const seriesPath = `${layerPath}.animate.${property}`
        const values = Array.isArray(series) ? series : [series]
        if (values.length === 0) {
          invalid(seriesPath, 'expected a nonempty animation series')
        }
        for (const scalar of values) {
          animationScalar(scalar, seriesPath, property)
        }
      }
      const transitionPath = `${layerPath}.transition`
      const transition = record(
        motion.transition,
        transitionPath,
        ['duration'],
        ['ease', 'repeat', 'repeatType', 'times']
      )
      number(transition.duration, `${transitionPath}.duration`, 0, reduced ? 0 : undefined)
      if (Object.hasOwn(transition, 'ease')) {
        choice(transition.ease, `${transitionPath}.ease`, ['easeInOut', 'easeOut', 'linear'])
      }
      if (Object.hasOwn(transition, 'repeat')) {
        if (transition.repeat === 'infinite' && !reduced) {
          // This is the only schema position that accepts serialized Infinity.
        } else {
          integer(transition.repeat, `${transitionPath}.repeat`, 0, reduced ? 0 : undefined)
        }
      }
      if (Object.hasOwn(transition, 'repeatType')) {
        choice(transition.repeatType, `${transitionPath}.repeatType`, ['reverse'])
      }
      if (Object.hasOwn(transition, 'times')) {
        const times = array(transition.times, `${transitionPath}.times`)
        if (times.length < 2 || times[0] !== 0 || times[times.length - 1] !== 1) {
          invalid(
            `${transitionPath}.times`,
            'expected keyframe offsets beginning at 0 and ending at 1'
          )
        }
        let previous = 0
        for (const offset of times) {
          previous = number(offset, `${transitionPath}.times`, previous, 1)
        }
        if (
          !Object.values(animate).some(
            (series) => Array.isArray(series) && series.length === times.length
          )
        ) {
          invalid(`${transitionPath}.times`, 'offset count must match an animation series')
        }
      }
    }
  }
}

function animationScalar(value: unknown, path: string, property: string): void {
  if (property === 'opacity') {
    number(value, path, 0, 1)
  } else if (property === 'scale') {
    number(value, path, 0)
  } else if (typeof value === 'number') {
    number(value, path)
  } else {
    const scalar = text(value, path)
    const units =
      property === 'rotate' || property === '--orb-voice-angle'
        ? /^[-+]?(?:\d+\.?\d*|\.\d+)(?:deg|rad|grad|turn)$/
        : /^[-+]?(?:\d+\.?\d*|\.\d+)(?:%|px|rem|em|vh|vw|vmin|vmax|ch|ex|cm|mm|in|pt|pc)$/
    if (!units.test(scalar)) {
      invalid(path, 'expected a numeric value with a supported CSS unit')
    }
  }
}

function speechConfiguration(value: unknown): void {
  const speech = record(value, '$.speech', [
    'defaultVoiceModel',
    'models',
    'talk',
    'defaultTalkFlow',
    'tokenPattern',
    'webSpeech',
    'openaiSpeech'
  ])
  const models = tuple(speech.models, '$.speech.models', [
    'web-speech',
    'openai-speech',
    'openai-realtime'
  ])
  if (speech.defaultVoiceModel !== null) {
    choice(speech.defaultVoiceModel, '$.speech.defaultVoiceModel', models)
  }
  record(speech.talk, '$.speech.talk', [])
  if (array(speech.defaultTalkFlow, '$.speech.defaultTalkFlow').length !== 0) {
    invalid('$.speech.defaultTalkFlow', 'package defaults must not contain conversation copy')
  }
  const pattern = record(speech.tokenPattern, '$.speech.tokenPattern', ['source', 'flags'])
  choice(pattern.source, '$.speech.tokenPattern.source', ['\\{\\{([a-zA-Z][a-zA-Z0-9]*)\\}\\}'])
  choice(pattern.flags, '$.speech.tokenPattern.flags', ['g'])
  const web = record(speech.webSpeech, '$.speech.webSpeech', [
    'language',
    'pitch',
    'rate',
    'volume',
    'preferredVoices',
    'voiceLoadTimeoutMs',
    'speechStartTimeoutMs'
  ])
  const language = text(web.language, '$.speech.webSpeech.language')
  try {
    Intl.getCanonicalLocales(language)
  } catch {
    invalid('$.speech.webSpeech.language', 'expected a BCP 47 language tag')
  }
  number(web.pitch, '$.speech.webSpeech.pitch', 0, 2)
  number(web.rate, '$.speech.webSpeech.rate', 0.1, 10)
  number(web.volume, '$.speech.webSpeech.volume', 0, 1)
  for (const voice of array(web.preferredVoices, '$.speech.webSpeech.preferredVoices')) {
    text(voice, '$.speech.webSpeech.preferredVoices')
  }
  integer(web.voiceLoadTimeoutMs, '$.speech.webSpeech.voiceLoadTimeoutMs', 0)
  integer(web.speechStartTimeoutMs, '$.speech.webSpeech.speechStartTimeoutMs', 1)
  const openai = record(speech.openaiSpeech, '$.speech.openaiSpeech', [
    'model',
    'responseFormat',
    'voice',
    'legacyVoice',
    'instructions',
    'credentials',
    'requestTimeoutMs'
  ])
  for (const key of ['model', 'voice', 'legacyVoice']) {
    text(openai[key], `$.speech.openaiSpeech.${key}`)
  }
  text(openai.instructions, '$.speech.openaiSpeech.instructions', true)
  choice(openai.responseFormat, '$.speech.openaiSpeech.responseFormat', [
    'aac',
    'flac',
    'mp3',
    'opus',
    'wav'
  ])
  credentials(openai.credentials, '$.speech.openaiSpeech.credentials')
  integer(openai.requestTimeoutMs, '$.speech.openaiSpeech.requestTimeoutMs', 1)
}

function realtimeConfiguration(value: unknown): void {
  const realtime = record(value, '$.realtime', ['maxEventBytes', 'maxTranscriptLength', 'openai'])
  integer(realtime.maxEventBytes, '$.realtime.maxEventBytes', 1)
  integer(realtime.maxTranscriptLength, '$.realtime.maxTranscriptLength', 1)
  const openai = record(realtime.openai, '$.realtime.openai', [
    'model',
    'voice',
    'credentials',
    'sessionTimeoutMs',
    'dataChannelLabel'
  ])
  for (const key of ['model', 'voice', 'dataChannelLabel']) {
    text(openai[key], `$.realtime.openai.${key}`)
  }
  credentials(openai.credentials, '$.realtime.openai.credentials')
  integer(openai.sessionTimeoutMs, '$.realtime.openai.sessionTimeoutMs', 1)
}

function record(
  value: unknown,
  path: string,
  required: readonly string[],
  optional: readonly string[] = []
): Record<string, unknown> {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    invalid(path, 'expected an object')
  }
  const result = value as Record<string, unknown>
  for (const key of Object.keys(result)) {
    if (!required.includes(key) && !optional.includes(key)) {
      invalid(path, 'unknown configuration field')
    }
  }
  for (const key of required) {
    if (!Object.hasOwn(result, key)) {
      invalid(`${path}.${key}`, 'missing required field')
    }
  }
  return result
}

function array(value: unknown, path: string): unknown[] {
  if (!Array.isArray(value)) {
    invalid(path, 'expected an array')
  }
  return value
}

function text(value: unknown, path: string, allowEmpty = false): string {
  if (typeof value !== 'string' || (!allowEmpty && value.trim().length === 0)) {
    invalid(path, 'expected a string')
  }
  return value
}

function choice(value: unknown, path: string, choices: readonly string[]): string {
  const result = text(value, path)
  if (!choices.includes(result)) {
    invalid(path, 'unsupported value or reference')
  }
  return result
}

function tuple(value: unknown, path: string, expected: readonly string[]): readonly string[] {
  const values = array(value, path)
  if (values.length !== expected.length || values.some((item, index) => item !== expected[index])) {
    invalid(path, 'expected the supported values in their canonical order')
  }
  return values as string[]
}

function number(
  value: unknown,
  path: string,
  minimum = Number.NEGATIVE_INFINITY,
  maximum = Number.POSITIVE_INFINITY
): number {
  if (typeof value !== 'number' || !Number.isFinite(value) || value < minimum || value > maximum) {
    invalid(path, 'expected a finite number in the supported range')
  }
  return value
}

function positive(value: unknown, path: string): number {
  const result = number(value, path, 0)
  if (result === 0) {
    invalid(path, 'expected a positive number')
  }
  return result
}

function integer(value: unknown, path: string, minimum: number, maximum?: number): number {
  const result = number(value, path, minimum, maximum)
  if (!Number.isSafeInteger(result)) {
    invalid(path, 'expected a safe integer')
  }
  return result
}

function credentials(value: unknown, path: string): void {
  choice(value, path, ['omit', 'same-origin', 'include'])
}

function invalid(path: string, reason: string): never {
  throw new TypeError(`Invalid Orb Voice configuration at ${path}: ${reason}.`)
}
