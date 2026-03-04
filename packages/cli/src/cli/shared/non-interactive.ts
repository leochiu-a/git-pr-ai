export interface NonInteractiveFlags {
  nonInteractive?: boolean
  ci?: boolean
  yolo?: boolean
}

export function assertNoYoloWithNonInteractive(
  flags: NonInteractiveFlags,
): void {
  if (flags.yolo && (flags.nonInteractive || flags.ci)) {
    throw new Error('--yolo cannot be combined with --non-interactive/--ci')
  }
}

export function resolveNonInteractiveMode(
  flags: NonInteractiveFlags,
  options: { includeLegacyYolo?: boolean } = {},
): boolean {
  const { includeLegacyYolo = true } = options
  return Boolean(
    flags.nonInteractive || flags.ci || (includeLegacyYolo && flags.yolo),
  )
}
