import { describe, it, expect, vi, afterEach } from 'vite-plus/test'
import {
  compareVersions,
  parseChanges,
  fetchReleaseNotes,
  formatReleaseNotes,
  printReleaseNotes,
} from './release-notes'

function mockReleases(releases: { tag_name: string; body: string | null }[]) {
  return vi.spyOn(globalThis, 'fetch').mockResolvedValue({
    ok: true,
    json: async () => releases,
  } as Response)
}

const RELEASES = [
  {
    tag_name: 'git-pr-ai@1.18.0',
    body: '### Minor Changes\n\n- 4e5271a: feat(skill): approve when there are no findings\n\n  Details that should not be shown.\n- feat(cli): show release notes before upgrading',
  },
  {
    tag_name: 'git-pr-ai@1.17.2',
    body: '### Patch Changes\n\n- 97c128d: refactor(skill): rename skill',
  },
  {
    tag_name: 'git-pr-ai@1.17.1',
    body: '### Patch Changes\n\n- abc1234: fix: older change',
  },
  { tag_name: 'other-package@9.9.9', body: '- unrelated' },
]

describe('release-notes', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('compareVersions', () => {
    it('compares each version part numerically', () => {
      expect(compareVersions('1.18.0', '1.9.10')).toBeGreaterThan(0)
      expect(compareVersions('1.17.2', '1.18.0')).toBeLessThan(0)
      expect(compareVersions('1.18.0', '1.18.0')).toBe(0)
    })
  })

  describe('parseChanges', () => {
    it('keeps only the first line of each top-level entry, without the commit hash', () => {
      expect(parseChanges(RELEASES[0].body)).toEqual([
        'feat(skill): approve when there are no findings',
        'feat(cli): show release notes before upgrading',
      ])
    })
  })

  describe('fetchReleaseNotes', () => {
    it('returns releases after current up to latest, oldest first', async () => {
      mockReleases(RELEASES)

      const notes = await fetchReleaseNotes('1.17.1', '1.18.0')

      expect(notes.map((note) => note.version)).toEqual(['1.17.2', '1.18.0'])
    })

    it('throws when GitHub responds with an error', async () => {
      vi.spyOn(globalThis, 'fetch').mockResolvedValue({
        ok: false,
        status: 403,
      } as Response)

      await expect(fetchReleaseNotes('1.17.1', '1.18.0')).rejects.toThrow('403')
    })
  })

  describe('formatReleaseNotes', () => {
    it('lists each version with its changes and links to all releases', () => {
      expect(
        formatReleaseNotes('1.17.2', [
          { version: '1.18.0', changes: ['feat: a', 'fix: b'] },
        ]),
      ).toBe(
        [
          "What's new since 1.17.2:",
          '  1.18.0',
          '    • feat: a',
          '    • fix: b',
          'Full release notes: https://github.com/leochiu-a/git-pr-ai/releases',
        ].join('\n'),
      )
    })
  })

  describe('printReleaseNotes', () => {
    it('prints the notes for the new versions', async () => {
      mockReleases(RELEASES)
      const log = vi.spyOn(console, 'log').mockImplementation(() => {})

      await printReleaseNotes('1.18.0', '1.17.2')

      expect(log).toHaveBeenCalledWith(
        expect.stringContaining(
          '    • feat(skill): approve when there are no findings',
        ),
      )
      expect(log).toHaveBeenCalledWith(
        expect.not.stringContaining('rename skill'),
      )
    })

    it('prints nothing and does not throw when the request fails', async () => {
      vi.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('offline'))
      const log = vi.spyOn(console, 'log').mockImplementation(() => {})

      await expect(printReleaseNotes('1.18.0', '1.17.2')).resolves.toBe(
        undefined,
      )
      expect(log).not.toHaveBeenCalled()
    })
  })
})
