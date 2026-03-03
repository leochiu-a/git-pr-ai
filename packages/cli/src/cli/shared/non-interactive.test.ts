import { describe, expect, it } from 'vitest'
import {
  assertNoYoloWithNonInteractive,
  resolveNonInteractiveMode,
} from './non-interactive'

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

describe('assertNoYoloWithNonInteractive', () => {
  it('throws when --yolo and --non-interactive are both set', () => {
    expect(() =>
      assertNoYoloWithNonInteractive({ yolo: true, nonInteractive: true }),
    ).toThrow('--yolo cannot be combined with --non-interactive/--ci')
  })

  it('throws when --yolo and --ci are both set', () => {
    expect(() =>
      assertNoYoloWithNonInteractive({ yolo: true, ci: true }),
    ).toThrow('--yolo cannot be combined with --non-interactive/--ci')
  })

  it('does not throw when only --yolo is set', () => {
    expect(() => assertNoYoloWithNonInteractive({ yolo: true })).not.toThrow()
  })

  it('does not throw when only --non-interactive is set', () => {
    expect(() =>
      assertNoYoloWithNonInteractive({ nonInteractive: true }),
    ).not.toThrow()
  })

  it('does not throw when neither flag is set', () => {
    expect(() => assertNoYoloWithNonInteractive({})).not.toThrow()
  })
})
