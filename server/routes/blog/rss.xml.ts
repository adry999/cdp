import { buildBlogRss } from '#layers/blog/server'

export default defineEventHandler((event) => {
  setResponseHeader(event, 'content-type', 'application/xml; charset=utf-8')
  return buildBlogRss(event, 'ro')
})
