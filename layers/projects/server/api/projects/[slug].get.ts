import { createProjectRepository } from '#layers/projects/server/repository/projectRepository'

export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, 'slug')
  if (!slug || !/^[a-z0-9-]+$/.test(slug)) {
    throw createError({ statusCode: 404, statusMessage: 'Project not found' })
  }
  const project = await createProjectRepository(event).findPublishedBySlug(slug)
  if (!project) throw createError({ statusCode: 404, statusMessage: 'Project not found' })
  if (import.meta.dev) {
    const { withStarDemo } = await import('#layers/projects/server/dev/starDemo')
    return withStarDemo(project)
  }
  return project
})
