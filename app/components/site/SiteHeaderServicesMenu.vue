<script setup lang="ts">
import type { MappedNavProject } from '#layers/projects'
import type { ComponentPublicInstance } from 'vue'

const props = defineProps<{
  groups: NavServiceGroup[]
  projectsByService: Partial<Record<string, MappedNavProject[]>>
  /** The current page belongs to services: underline the trigger. */
  active: boolean
  /** The service page that is open, preselected when the menu opens. */
  currentSlug: string | null
  servicesTo: string
  allProjectsTo: string
}>()

const { t } = useI18n()
const localePath = useLocalePath()
const route = useRoute()

const CLOSE_DELAY_MS = 220
const HOVER_BLOCK_MS = 600

const root = ref<HTMLElement | null>(null)
const toggleButton = ref<HTMLButtonElement | null>(null)
const panelId = useId()
const open = ref(false)
// Cover images are only rendered once the menu has been opened, so closed menus cost no image requests.
const everOpened = ref(false)
const selectedSlug = ref('')
const projectIndex = ref(0)
let closeTimer: ReturnType<typeof setTimeout> | undefined
// After Escape the pointer may still rest over the panel; the browser then re-fires pointerenter, which would reopen it.
let ignoreHoverUntil = 0

const allServices = computed(() => props.groups.flatMap((group) => group.services))
const selected = computed(() => allServices.value.find((s) => s.slug === selectedSlug.value) ?? allServices.value[0])
const projects = computed(() => (selected.value ? projectsOf(selected.value.slug) : []))
const activeProject = computed(() => projects.value[projectIndex.value] ?? projects.value[0])
const serviceLinks = ref<Record<string, ComponentPublicInstance | null>>({})

function projectsOf(slug: string): MappedNavProject[] {
  return props.projectsByService[slug] ?? []
}

watch(
  () => props.currentSlug,
  (slug) => {
    if (slug) selectedSlug.value = slug
  },
  { immediate: true },
)

function projectTo(project: MappedNavProject): string {
  return localePath({ name: 'proiecte-slug', params: { slug: project.slug } })
}

function selectService(slug: string) {
  if (slug === selectedSlug.value) return
  selectedSlug.value = slug
  projectIndex.value = 0
}

// Roving tabindex: only the selected service is in the tab sequence, so Tab goes from it straight to
// its projects. ArrowUp/ArrowDown move the selection (and focus) through the list.
function onServiceKeydown(event: KeyboardEvent) {
  if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return
  const list = allServices.value
  if (!list.length) return
  event.preventDefault()
  const current = list.findIndex((s) => s.slug === selected.value?.slug)
  const next = list[(current + (event.key === 'ArrowDown' ? 1 : -1) + list.length) % list.length]
  if (!next) return
  selectService(next.slug)
  const el = serviceLinks.value[next.slug]?.$el
  if (el instanceof HTMLElement) el.focus()
}

function openMenu() {
  clearTimeout(closeTimer)
  open.value = true
  everOpened.value = true
}

function closeMenu({ returnFocus = false } = {}) {
  clearTimeout(closeTimer)
  if (!open.value) return
  open.value = false
  if (!returnFocus) return
  ignoreHoverUntil = performance.now() + HOVER_BLOCK_MS
  toggleButton.value?.focus()
}

function scheduleClose() {
  clearTimeout(closeTimer)
  closeTimer = setTimeout(() => closeMenu(), CLOSE_DELAY_MS)
}

// Mouse only: a tap on a touch screen opens through the click handler instead.
function onPointerEnter(event: PointerEvent) {
  if (event.pointerType === 'mouse' && performance.now() > ignoreHoverUntil) openMenu()
}

function onPointerLeave(event: PointerEvent) {
  if (event.pointerType === 'mouse') scheduleClose()
}

// A mouse click lands after hover already opened the panel, so it must not close it; leaving the header does.
function toggleMenu(event: MouseEvent) {
  if (event instanceof PointerEvent && event.pointerType === 'mouse') openMenu()
  else if (open.value) closeMenu()
  else openMenu()
}

// On the document, not the wrapper: a menu opened by hover has no focus inside it, and Escape must still close it.
// Focus goes back to the trigger only when it was inside the menu.
function onDocumentKeydown(event: KeyboardEvent) {
  if (event.key !== 'Escape' || !open.value) return
  event.preventDefault()
  closeMenu({ returnFocus: focusInside() })
}

function focusInside(): boolean {
  return document.activeElement instanceof Node && Boolean(root.value?.contains(document.activeElement))
}

function onFocusOut(event: FocusEvent) {
  const next = event.relatedTarget
  if (next instanceof Node && !root.value?.contains(next)) closeMenu()
}

// A click outside closes the menu. If focus was inside it and the click lands on nothing focusable,
// the browser would drop focus on <body>; it goes back to the trigger instead.
function onDocumentPointerDown(event: PointerEvent) {
  if (!open.value || !(event.target instanceof Node) || root.value?.contains(event.target)) return
  const hadFocus = focusInside()
  closeMenu()
  if (!hadFocus) return
  requestAnimationFrame(() => {
    if (document.activeElement && document.activeElement !== document.body) return
    toggleButton.value?.focus({ preventScroll: true })
  })
}

watch(() => route.fullPath, () => closeMenu())

onMounted(() => {
  document.addEventListener('pointerdown', onDocumentPointerDown)
  document.addEventListener('keydown', onDocumentKeydown)
})
onBeforeUnmount(() => {
  clearTimeout(closeTimer)
  document.removeEventListener('pointerdown', onDocumentPointerDown)
  document.removeEventListener('keydown', onDocumentKeydown)
})
</script>

<template>
  <div
    ref="root"
    @pointerenter="onPointerEnter"
    @pointerleave="onPointerLeave"
    @focusout="onFocusOut"
  >
    <div class="flex items-center">
      <NuxtLink
        :to="servicesTo"
        class="group relative flex items-center py-2 hover:text-signal-text"
        :class="active ? 'text-ink' : 'text-muted'"
        :aria-current="active ? 'page' : undefined"
      >
        {{ t('nav.services') }}
        <span
          aria-hidden="true"
          class="absolute inset-x-0 bottom-0.5 h-0.5 origin-left bg-signal transition-transform duration-[250ms] motion-reduce:transition-none"
          :class="active ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'"
        />
      </NuxtLink>
      <button
        ref="toggleButton"
        type="button"
        class="inline-flex min-h-8 min-w-8 cursor-pointer items-center justify-center border-0 bg-transparent p-0 hover:text-signal-text"
        :class="active ? 'text-ink' : 'text-muted'"
        :aria-label="t('nav.servicesToggle')"
        :aria-expanded="open"
        :aria-controls="panelId"
        @click="toggleMenu"
      >
        <Icon
          name="lucide:chevron-down"
          aria-hidden="true"
          class="size-3.5 transition-transform duration-200 motion-reduce:transition-none"
          :class="open && 'rotate-180'"
        />
      </button>
    </div>

    <div
      :id="panelId"
      class="pointer-events-none absolute inset-x-0 top-full transition-[opacity,transform,visibility] duration-150 motion-reduce:transition-none"
      :class="open ? 'visible translate-y-0 opacity-100' : 'invisible -translate-y-1.5 opacity-0'"
    >
      <div class="container-site flex justify-end">
        <div
          class="pointer-events-auto grid w-[min(860px,100%)] grid-cols-[230px_minmax(0,1fr)] overflow-hidden rounded-b border border-t-0 border-hairline bg-paper font-sans text-base normal-case tracking-normal shadow-dropdown"
        >
          <div class="flex flex-col gap-5 border-r border-hairline bg-panel py-[22px]" @keydown="onServiceKeydown">
            <div v-for="group in groups" :key="group.label" class="flex flex-col">
              <div class="px-5 pb-2 eyebrow-sm text-muted">{{ group.label }}</div>
              <NuxtLink
                v-for="service in group.services"
                :key="service.slug"
                :ref="(el) => (serviceLinks[service.slug] = el as ComponentPublicInstance | null)"
                :to="service.to"
                class="block border-l-2 py-[9px] pl-[18px] pr-5 text-[15px] leading-[1.3] hover:text-ink"
                :class="
                  selected?.slug === service.slug
                    ? 'border-signal bg-transparent font-semibold text-ink'
                    : 'border-transparent text-muted'
                "
                :tabindex="selected?.slug === service.slug ? 0 : -1"
                :aria-current="service.slug === currentSlug ? 'page' : undefined"
                @mouseenter="selectService(service.slug)"
                @focus="selectService(service.slug)"
              >
                {{ service.name }}
              </NuxtLink>
            </div>
          </div>

          <!-- One pane per service, stacked in the same cell and hidden but the selected one: the panel keeps
               the height of the tallest pane, so the bottom links stay put while the selection moves. -->
          <div class="grid min-w-0">
            <div
              v-for="service in allServices"
              :key="service.slug"
              class="col-start-1 row-start-1 flex min-w-0 flex-col gap-4 px-6 py-[22px]"
              :class="service.slug !== selected?.slug && 'invisible'"
            >
              <div class="eyebrow-sm text-muted">
                {{ projectsOf(service.slug).length ? t('nav.projectsKicker', { service: service.name }) : service.name }}
              </div>

              <div v-if="projectsOf(service.slug).length" class="grid grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)] items-start gap-5">
                <div class="flex flex-col gap-0.5">
                  <NuxtLink
                    v-for="(project, index) in projectsOf(service.slug)"
                    :key="project.slug"
                    :to="projectTo(project)"
                    class="flex flex-col gap-0.5 rounded-[3px] px-2.5 py-[9px] text-ink"
                    :class="service.slug === selected?.slug && index === projectIndex ? 'bg-hatch' : 'bg-transparent'"
                    @mouseenter="projectIndex = index"
                    @focus="projectIndex = index"
                  >
                    <span class="line-clamp-2 text-[15px] font-semibold leading-[1.25]">{{ project.title }}</span>
                    <span v-if="project.subtitle" class="line-clamp-2 text-[13px] leading-[1.3] text-muted">{{ project.subtitle }}</span>
                  </NuxtLink>
                </div>
                <NuxtLink
                  v-if="everOpened && activeProject && service.slug === selected?.slug"
                  :to="projectTo(activeProject)"
                  tabindex="-1"
                  aria-hidden="true"
                  class="block"
                >
                  <MediaFrame
                    :key="activeProject.slug"
                    ratio="16/9"
                    :src="activeProject.coverPath ?? undefined"
                    :alt="activeProject.coverAlt"
                    sizes="320:400px"
                    class="rounded-[3px]! bg-hatch object-left-top"
                  />
                </NuxtLink>
                <!-- Same box as the cover, without loading an image for every service. -->
                <div v-else aria-hidden="true" class="aspect-[16/9]" />
              </div>
              <p v-else class="m-0 max-w-[46ch] text-[17px] leading-normal text-ink text-pretty">{{ service.intro }}</p>

              <div class="mt-auto flex flex-wrap justify-between gap-3 border-t border-hairline pt-2 eyebrow-sm">
                <NuxtLink :to="service.to" class="inline-flex min-h-8 items-center text-ink underline-offset-4 hover:text-signal-text hover:underline">{{ t('nav.aboutService') }} →</NuxtLink>
                <NuxtLink :to="allProjectsTo" class="inline-flex min-h-8 items-center text-ink underline-offset-4 hover:text-signal-text hover:underline">{{ t('nav.allProjects') }} →</NuxtLink>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
