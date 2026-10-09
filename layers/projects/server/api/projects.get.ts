import { createProjectRepository } from '#layers/projects/server/repository/projectRepository'

export default defineEventHandler(async (event) => {
  const cards = await createProjectRepository(event).listPublishedCards()
  if (import.meta.dev) {
    const { withStarDemo } = await import('#layers/projects/server/dev/starDemo')
    return cards?.map(withStarDemo)
  }
  return cards
})
