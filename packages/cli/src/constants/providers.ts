import { type ProviderType } from '../providers/types'

export const PROVIDER_NAME_MAP: Record<ProviderType, string> = {
  github: 'GitHub',
  gitlab: 'GitLab',
}

export const PROVIDER_CHOICES = [
  {
    name: 'Auto-detect (based on git remote origin)',
    value: 'auto',
  },
  {
    name: 'GitHub',
    value: 'github',
  },
  {
    name: 'GitLab',
    value: 'gitlab',
  },
] as const

export type ProviderChoice = (typeof PROVIDER_CHOICES)[number]['value']
