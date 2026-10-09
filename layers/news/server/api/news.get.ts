import { createNewsRepository } from '#layers/news/server/repository/newsRepository'

export default defineEventHandler((event) => createNewsRepository(event).listPublished())
