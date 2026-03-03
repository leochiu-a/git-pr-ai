export interface NonInteractiveFlags {
  nonInteractive?: boolean
  ci?: boolean
  yolo?: boolean
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
