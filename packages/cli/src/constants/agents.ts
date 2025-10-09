export const AI_AGENT_CHOICES = [
  {
    name: 'Claude Code',
    value: 'claude' as const,
  },
  {
    name: 'Gemini CLI',
    value: 'gemini' as const,
  },
  {
    name: 'Cursor CLI',
    value: 'cursor-agent' as const,
  },
] as const

export type AIAgent = (typeof AI_AGENT_CHOICES)[number]['value']

export const SUPPORTED_AGENTS: AIAgent[] = AI_AGENT_CHOICES.map(
  (choice) => choice.value,
)
