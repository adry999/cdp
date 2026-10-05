import { createProjectRepository } from '#layers/projects/server/repository/projectRepository'

export default defineEventHandler((event) => createProjectRepository(event).listPublishedCards())
