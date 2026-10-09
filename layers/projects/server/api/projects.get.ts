import { createProjectRepository } from '#layers/projects/server/repository/projectRepository'

export default defineEventHandler(async (event) => {
  return await createProjectRepository(event).listPublishedCards()
})
