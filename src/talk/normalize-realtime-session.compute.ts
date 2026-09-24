import type {
  OrboRealtimeSession,
  OrboRealtimeSessionAuthorizer,
  OrboRealtimeSessionEndpoint
} from './voice-model.types'

/** Copy public transport options only; application authorization stays opaque. */
export function normalizeRealtimeSession(value: unknown): OrboRealtimeSession | undefined {
  if (value === undefined) {
    return undefined
  }
  if (typeof value === 'function') {
    return value as OrboRealtimeSessionAuthorizer
  }
  if (value === null || typeof value !== 'object' || Array.isArray(value)) {
    throw invalidSession()
  }

  const properties = Object.getOwnPropertyDescriptors(value)
  for (const key of Reflect.ownKeys(properties)) {
    if (key !== 'endpoint' && key !== 'credentials' && key !== 'fetch') {
      throw invalidSession()
    }
    if (!Object.hasOwn(properties[key], 'value')) {
      throw invalidSession()
    }
  }

  const source: unknown = properties.endpoint?.value
  let endpoint: string
  if (typeof source === 'string') {
    endpoint = source.trim()
  } else if (typeof globalThis.URL === 'function' && source instanceof globalThis.URL) {
    endpoint = URL.prototype.toString.call(source)
  } else {
    throw invalidSession()
  }
  if (!endpoint) {
    throw invalidSession()
  }

  const credentials: unknown = properties.credentials?.value
  if (
    credentials !== undefined &&
    credentials !== 'omit' &&
    credentials !== 'same-origin' &&
    credentials !== 'include'
  ) {
    throw invalidSession()
  }
  const fetcher: unknown = properties.fetch?.value
  if (fetcher !== undefined && typeof fetcher !== 'function') {
    throw invalidSession()
  }

  const session: OrboRealtimeSessionEndpoint = {
    endpoint,
    ...(credentials === undefined ? {} : { credentials }),
    ...(fetcher === undefined ? {} : { fetch: fetcher as typeof globalThis.fetch })
  }
  return Object.freeze(session)
}

function invalidSession(): TypeError {
  return new TypeError(
    'Orbo realtimeSession requires an authorizer or endpoint with optional fetch policy and function only.'
  )
}
