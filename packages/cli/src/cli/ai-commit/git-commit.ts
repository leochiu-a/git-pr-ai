import { $ } from 'zx'

export async function createCommit(commitMessage: string): Promise<void> {
  const stagedResult = await $`git diff --cached --quiet`.exitCode
  const hasStaged = stagedResult !== 0

  if (!hasStaged) {
    throw new Error(
      'No staged changes detected. Please stage your files before committing.',
    )
  }

  await $({ stdio: 'inherit' })`git commit -m ${commitMessage}`
}
