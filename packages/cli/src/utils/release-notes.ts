import packageJson from '../../package.json'

const RELEASES_API_URL =
  'https://api.github.com/repos/leochiu-a/git-pr-ai/releases?per_page=30'
const RELEASES_PAGE_URL = 'https://github.com/leochiu-a/git-pr-ai/releases'
// Changesets tags each release as `<package>@<version>`
const TAG_PREFIX = 'git-pr-ai@'
const REQUEST_TIMEOUT_MS = 3000

interface GitHubRelease {
  tag_name: string
  body: string | null
}

export interface ReleaseNote {
  version: string
  changes: string[]
}

/**
 * Compare two `x.y.z` versions; returns a negative number, 0, or a positive number
 */
export function compareVersions(a: string, b: string): number {
  const aParts = a.split('.').map(Number)
  const bParts = b.split('.').map(Number)
  for (let i = 0; i < 3; i++) {
    const diff = (aParts[i] ?? 0) - (bParts[i] ?? 0)
    if (diff !== 0) return diff
  }
  return 0
}

/**
 * Take the first line of each top-level changeset entry, e.g.
 * `- 4e5271a: feat(skill): ...` → `feat(skill): ...`
 */
export function parseChanges(body: string): string[] {
  return body
    .split('\n')
    .map((line) => line.match(/^- (?:[0-9a-f]{7,40}: )?(.+)$/)?.[1]?.trim())
    .filter((change): change is string => !!change)
}

/**
 * Fetch the GitHub Release notes for versions newer than `current` up to `latest`, oldest first
 */
export async function fetchReleaseNotes(
  current: string,
  latest: string,
): Promise<ReleaseNote[]> {
  const response = await fetch(RELEASES_API_URL, {
    headers: { Accept: 'application/vnd.github+json' },
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  })
  if (!response.ok) {
    throw new Error(`GitHub releases request failed: ${response.status}`)
  }

  const releases = (await response.json()) as GitHubRelease[]
  return releases
    .filter((release) => release.tag_name.startsWith(TAG_PREFIX))
    .map((release) => ({
      version: release.tag_name.slice(TAG_PREFIX.length),
      changes: parseChanges(release.body ?? ''),
    }))
    .filter(
      ({ version }) =>
        compareVersions(version, current) > 0 &&
        compareVersions(version, latest) <= 0,
    )
    .sort((a, b) => compareVersions(a.version, b.version))
}

export function formatReleaseNotes(
  current: string,
  notes: ReleaseNote[],
): string {
  const lines = [`What's new since ${current}:`]
  for (const note of notes) {
    lines.push(`  ${note.version}`)
    for (const change of note.changes) {
      lines.push(`    • ${change}`)
    }
  }
  lines.push(`Full release notes: ${RELEASES_PAGE_URL}`)
  return lines.join('\n')
}

/**
 * Print what changed between the installed version and `latest`.
 * Never throws: the upgrade prompt must still show when GitHub is unreachable.
 */
export async function printReleaseNotes(
  latest: string,
  current: string = packageJson.version,
): Promise<void> {
  try {
    const notes = await fetchReleaseNotes(current, latest)
    if (notes.length === 0) return
    console.log(formatReleaseNotes(current, notes))
  } catch {
    // Release notes are a nice-to-have; skip them silently
  }
}
