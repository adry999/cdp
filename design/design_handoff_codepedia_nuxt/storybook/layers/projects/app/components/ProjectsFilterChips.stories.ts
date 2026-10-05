import type { Meta, StoryObj } from '@storybook-vue/nuxt'
import { ref } from 'vue'
import ProjectsFilterChips from './ProjectsFilterChips.vue'
import { SERVICE_TAG_IDS } from '#layers/core/shared/types/service-tag'

const tags = [...SERVICE_TAG_IDS]

const meta = {
  title: 'Projects/ProjectsFilterChips',
  component: ProjectsFilterChips,
  args: { tags, active: null },
  render: (args) => ({
    components: { ProjectsFilterChips },
    setup: () => ({ args, active: ref(args.active) }),
    template: '<ProjectsFilterChips :tags="args.tags" :active="active" @select="active = $event" />',
  }),
} satisfies Meta<typeof ProjectsFilterChips>
export default meta
type Story = StoryObj<typeof meta>

export const AllActive: Story = {}
export const OneActive: Story = { args: { active: tags[1] } }
