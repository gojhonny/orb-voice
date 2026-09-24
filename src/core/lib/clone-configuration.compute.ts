/** Clone plain JSON data without invoking accessors or sharing caller-owned objects. */
export function cloneOrbuConfigurationInput(input: unknown): unknown {
  const ancestors = new Set<object>()
  let nodes = 0

  function clone(value: unknown, depth: number): unknown {
    nodes += 1
    if (depth > 64 || nodes > 50_000) {
      throw new TypeError('Invalid Orbu configuration at $: JSON structure is too large.')
    }
    if (value === null || typeof value === 'string' || typeof value === 'boolean') {
      return value
    }
    if (typeof value === 'number' && Number.isFinite(value)) {
      return value
    }
    if (typeof value !== 'object' || value === null) {
      throw new TypeError('Invalid Orbu configuration at $: expected finite JSON data.')
    }
    if (ancestors.has(value)) {
      throw new TypeError('Invalid Orbu configuration at $: cyclic references are not JSON.')
    }
    const array = Array.isArray(value)
    const prototype = Object.getPrototypeOf(value)
    if (
      array ? prototype !== Array.prototype : prototype !== Object.prototype && prototype !== null
    ) {
      throw new TypeError('Invalid Orbu configuration at $: expected plain JSON objects.')
    }
    ancestors.add(value)
    const entries: [string, unknown][] = []
    for (const key of Reflect.ownKeys(value)) {
      if (array && key === 'length') {
        continue
      }
      if (typeof key !== 'string' || (array && !/^(0|[1-9]\d*)$/.test(key))) {
        throw new TypeError('Invalid Orbu configuration at $: unsupported JSON property.')
      }
      const property = Object.getOwnPropertyDescriptor(value, key)
      if (!property || !property.enumerable || !('value' in property)) {
        throw new TypeError('Invalid Orbu configuration at $: JSON accessors are not allowed.')
      }
      entries.push([key, clone(property.value, depth + 1)])
    }
    ancestors.delete(value)
    if (array) {
      if (entries.length !== value.length) {
        throw new TypeError('Invalid Orbu configuration at $: sparse arrays are not allowed.')
      }
      return entries.map(([, child]) => child)
    }
    return Object.fromEntries(entries)
  }

  return clone(input, 0)
}
