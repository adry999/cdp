import type { StorybookConfig } from '@storybook-vue/nuxt'

const config: StorybookConfig = {
  stories: ['../layers/**/*.stories.@(ts|mdx)', '../app/**/*.stories.@(ts|mdx)'],
  addons: ['@storybook/addon-a11y', '@storybook/addon-docs'],
  framework: { name: '@storybook-vue/nuxt', options: {} },
  staticDirs: ['../public'],
}
export default config
