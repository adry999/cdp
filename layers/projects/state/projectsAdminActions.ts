import { computed, ref, type Ref } from 'vue'
import { evaluateChecklist } from '#layers/projects/domain/adminProjectList'
import type { AdminProjectListRow } from '#layers/projects/domain/projectSelect'

export interface ProjectsAdminActionsDeps {
  /** The loaded list; actions look their project up here by `slug_ro`. */
  projects: Ref<AdminProjectListRow[] | null | undefined>
  repository: {
    remove: (slug: string) => Promise<void>
    /** False when the copy is incomplete. */
    duplicate: (slug: string) => Promise<boolean>
    setPublished: (project: AdminProjectListRow, published: boolean) => Promise<void>
    setFeatured: (slug: string, featured: boolean) => Promise<void>
  }
  /** Brings the list and the public cache in line with the database after an action. */
  sync: () => Promise<void>
}

// The per-row actions of the projects list, with their dependencies passed in so the flows can be
// tested without Nuxt. `useProjectsAdminList` wires them to Supabase and the loaded list.
export function createProjectsAdminActions({ projects, repository, sync }: ProjectsAdminActionsDeps) {
  const deleting = ref<string | null>(null)
  const publishing = ref<string | null>(null)
  // Unpublishing deletes the project's redirects too, so it is confirmed in a dialog first.
  const unpublishing = ref<string | null>(null)
  const consentConfirmed = ref(false)
  const busy = ref<string | null>(null)
  // `slug` names the row the notice belongs to, so the page can show it beside that row (or in
  // its open dialog) instead of at the top of a long list.
  const notice = ref<{ tone: 'info' | 'error'; text: string; slug: string } | null>(null)

  const find = (slug: string | null) => projects.value?.find((project) => project.slug_ro === slug) ?? null
  const deletingProject = computed(() => find(deleting.value))
  const publishingProject = computed(() => find(publishing.value))
  const unpublishingProject = computed(() => find(unpublishing.value))
  const checklist = computed(() =>
    publishingProject.value ? evaluateChecklist(publishingProject.value, consentConfirmed.value) : null,
  )

  async function run(slug: string, action: () => Promise<void>, failure: string): Promise<boolean> {
    busy.value = slug
    notice.value = null
    let ok = true
    try {
      await action()
    } catch (caught) {
      console.warn('[admin] project action failed', slug, caught)
      notice.value = { tone: 'error', text: failure, slug }
      ok = false
    } finally {
      busy.value = null
    }
    // Also after a failure: an action can fail halfway (row written, redirects not), so the
    // list and the public cache must show what the database actually holds.
    await sync()
    return ok
  }

  // Opening a dialog drops the last notice, so it never shows an older action's failure.
  function askDelete(slug: string) {
    notice.value = null
    deleting.value = slug
  }

  async function confirmDelete() {
    const slug = deleting.value
    if (!slug) return
    if (await run(slug, () => repository.remove(slug), 'Proiectul nu a putut fi șters.')) deleting.value = null
  }

  async function duplicate(slug: string) {
    let complete = true
    const ok = await run(
      slug,
      async () => {
        complete = await repository.duplicate(slug)
      },
      'Proiectul nu a putut fi duplicat.',
    )
    // Surfacing a partial copy beats a silent one the admin doesn't know about.
    if (ok && !complete) {
      notice.value = {
        tone: 'error',
        text: 'Proiectul a fost duplicat, dar unele elemente nu s-au copiat corect. Verifică proiectul nou.',
        slug,
      }
    }
  }

  function askPublish(slug: string) {
    notice.value = null
    consentConfirmed.value = false
    publishing.value = slug
  }

  async function confirmPublish() {
    const project = publishingProject.value
    if (!project || !checklist.value?.canPublish) return
    if (await run(project.slug_ro, () => repository.setPublished(project, true), 'Proiectul nu a putut fi publicat.')) {
      publishing.value = null
    }
  }

  function askUnpublish(slug: string) {
    notice.value = null
    unpublishing.value = slug
  }

  // On failure the dialog stays open and shows the notice, like a failed delete.
  async function confirmUnpublish() {
    const project = unpublishingProject.value
    if (!project) return
    if (await run(project.slug_ro, () => repository.setPublished(project, false), 'Proiectul nu a putut fi retras.')) {
      unpublishing.value = null
    }
  }

  async function toggleFeatured(slug: string) {
    const project = find(slug)
    if (project) await run(slug, () => repository.setFeatured(slug, !project.featured), 'Afișarea pe homepage nu s-a schimbat.')
  }

  return {
    deleting,
    deletingProject,
    publishing,
    publishingProject,
    unpublishing,
    unpublishingProject,
    consentConfirmed,
    checklist,
    busy,
    notice,
    askDelete,
    confirmDelete,
    duplicate,
    askPublish,
    confirmPublish,
    askUnpublish,
    confirmUnpublish,
    toggleFeatured,
  }
}
