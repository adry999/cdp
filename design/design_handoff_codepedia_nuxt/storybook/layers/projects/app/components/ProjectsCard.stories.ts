import type { Meta, StoryObj } from '@storybook-vue/nuxt'
import ProjectsCard from './ProjectsCard.vue'
import type { MappedProjectCard } from '#layers/projects/domain/mapProject'

const project: MappedProjectCard = {
  slug: 'saas-logistica',
  title: 'SaaS de logistică',
  text: 'Planificare curse și documente pentru o firmă de transport.',
  tech: ['Nuxt', 'Supabase'],
  coverPath: null,
  coverAlt: 'Dashboard curse',
  thumbnailLabel: '[ Dashboard curse ]',
  serviceTag: 'web-app',
  featured: true,
}

const meta = {
  title: 'Projects/ProjectsCard',
  component: ProjectsCard,
  args: { project, showTech: true },
  decorators: [() => ({ template: '<div style="max-width:380px"><story /></div>' })],
} satisfies Meta<typeof ProjectsCard>
export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
export const WithoutTech: Story = { args: { showTech: false } }
