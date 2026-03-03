import { describe, expect, it } from 'vitest'
import { resolveNonInteractiveMode } from './non-interactive'

describe('resolveNonInteractiveMode', () => {
  it('returns true when --non-interactive is set', () => {
    expect(resolveNonInteractiveMode({ nonInteractive: true })).toBe(true)
  })

  it('returns true when --ci alias is set', () => {
    expect(resolveNonInteractiveMode({ ci: true })).toBe(true)
  })

  it('returns true for legacy yolo flag', () => {
    expect(resolveNonInteractiveMode({ yolo: true })).toBe(true)
  })

  it('can ignore legacy yolo flag when requested', () => {
    expect(
      resolveNonInteractiveMode({ yolo: true }, { includeLegacyYolo: false }),
    ).toBe(false)
  })

  it('returns false when no flags are set', () => {
    expect(resolveNonInteractiveMode({})).toBe(false)
  })
})
