import { defineConfig } from 'vitepress'

export default defineConfig({
  title: 'Git PR AI',
  description:
    'A powerful command-line tool that automates Pull Request creation for GitHub and GitLab with JIRA integration',
  base: '/git-pr-ai/',
  head: [['link', { rel: 'icon', href: '/git-pr-ai/logo.svg' }]],

  themeConfig: {
    logo: '/git-pr-ai/logo.svg',

    nav: [
      { text: 'Home', link: '/' },
      { text: 'GitHub', link: 'https://github.com/leochiu-a/git-pr-ai' },
    ],

    sidebar: [
      {
        text: 'Introduction',
        collapsed: false,
        items: [
          { text: 'What is git-pr-ai?', link: '/introduction/intro' },
          { text: 'Installation', link: '/introduction/installation' },
          { text: 'Usage', link: '/introduction/usage' },
        ],
      },
      {
        text: 'Commands',
        collapsed: false,
        items: [
          { text: 'Commands Reference', link: '/commands/commands' },
          { text: 'git create-branch', link: '/commands/create-branch' },
          { text: 'git open-pr', link: '/commands/open-pr' },
          { text: 'git update-pr-desc', link: '/commands/update-pr-desc' },
          { text: 'git pr-review', link: '/commands/pr-review' },
          { text: 'git plan-issue', link: '/commands/plan-issue' },
          { text: 'git take-issue', link: '/commands/take-issue' },
          { text: 'git weekly-summary', link: '/commands/weekly-summary' },
          { text: 'git pr-ai config', link: '/commands/config' },
        ],
      },
      { text: 'Configuration', link: '/configuration' },
    ],

    socialLinks: [
      { icon: 'github', link: 'https://github.com/leochiu-a/git-pr-ai' },
    ],

    footer: {
      message: 'Built with VitePress',
      copyright: `Copyright © ${new Date().getFullYear()} Git PR AI`,
    },
  },
})
