import { readFileSync } from 'fs'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'
import { describe, expect, it } from 'vitest'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const cliRoot = __dirname
const repoRoot = join(cliRoot, '../../../../')

function readFromCli(relativePath: string): string {
  return readFileSync(join(cliRoot, relativePath), 'utf8')
}

function readFromRepo(relativePath: string): string {
  return readFileSync(join(repoRoot, relativePath), 'utf8')
}

describe('yolo option removal regression', () => {
  it('does not expose --yolo in open-pr/create-branch/ai-commit command files', () => {
    const openPr = readFromCli('open-pr/open-pr.ts')
    const createBranch = readFromCli('create-branch/create-branch.ts')
    const aiCommit = readFromCli('ai-commit/ai-commit.ts')

    expect(openPr).not.toContain(".option('--yolo'")
    expect(createBranch).not.toContain(".option('--yolo'")
    expect(aiCommit).not.toContain(".option('--yolo'")
  })

  it('does not document --yolo in open-pr/create-branch/ai-commit docs', () => {
    const openPrDoc = readFromRepo('docs/commands/open-pr.md')
    const createBranchDoc = readFromRepo('docs/commands/create-branch.md')
    const aiCommitDoc = readFromRepo('docs/commands/ai-commit.md')

    expect(openPrDoc).not.toContain('--yolo')
    expect(createBranchDoc).not.toContain('--yolo')
    expect(aiCommitDoc).not.toContain('--yolo')
  })

  it('open-pr keeps --non-interactive and --ci for non-web automation', () => {
    const openPr = readFromCli('open-pr/open-pr.ts')
    const openPrDoc = readFromRepo('docs/commands/open-pr.md')

    // Allow multiline option declarations to avoid brittle formatting-only failures.
    expect(openPr).toMatch(/\.option\(\s*'--non-interactive'/)
    expect(openPr).toMatch(/\.option\(\s*'--ci'/)
    expect(openPr).not.toMatch(/\.option\(\s*'--no-web'/)

    expect(openPrDoc).toContain('--non-interactive')
    expect(openPrDoc).toContain('--ci')
    expect(openPrDoc).not.toContain('--no-web')
  })
})
