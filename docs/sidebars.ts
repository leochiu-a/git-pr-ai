import type { SidebarsConfig } from '@docusaurus/plugin-content-docs'

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

/**
 * Creating a sidebar enables you to:
 - create an ordered group of docs
 - render a sidebar for each doc of that group
 - provide next/previous navigation

 The sidebars can be generated from the filesystem, or explicitly defined here.

 Create as many sidebars as you want.
 */
const sidebars: SidebarsConfig = {
  tutorialSidebar: [
    {
      type: 'category',
      label: 'Introduction',
      collapsed: false,
      items: [
        'introduction/intro',
        'introduction/installation',
        'introduction/usage',
      ],
    },
    {
      type: 'category',
      label: 'Commands',
      collapsed: false,
      items: [
        'commands/commands',
        'commands/create-branch',
        'commands/open-pr',
        'commands/update-pr-desc',
        'commands/pr-review',
        'commands/plan-issue',
        'commands/take-issue',
        'commands/weekly-summary',
        'commands/config',
      ],
    },
    'configuration',
  ],
}

export default sidebars
