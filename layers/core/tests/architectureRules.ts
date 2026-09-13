export interface SourceFile {
  path: string
  content: string
}

export type ViolationRule =
  | 'undeclared-layer'
  | 'component-prefix'
  | 'duplicate-component'
  | 'foreign-component'
  | 'foreign-auto-import'

export interface Violation {
  rule: ViolationRule
  file: string
  detail: string
}

export type LayerDependencies = Readonly<Record<string, readonly string[]>>

interface ComponentEntry {
  owner: string
  path: string
}

const ROOT_OWNER = 'root'
const CORE_LAYER = 'core'
const COMPONENT_PATH = /^(?:app|layers\/[^/]+\/app)\/components\/(.+)\.vue$/
const AUTO_IMPORT_PATH =
  /^(?:layers\/[^/]+\/)?(?:app\/(?:composables|utils)|shared\/(?:utils|types)|server\/utils)\/[^/]+\.ts$/
const EXPORTED_NAME = /^export\s+(?:async\s+)?(?:function|const|let|class|interface|type|enum)\s+([A-Za-z_$][\w$]*)/gm
const TEMPLATE_TAG = /<([A-Z][A-Za-z0-9]*|[a-z][a-z0-9]*(?:-[a-z0-9]+)+)[\s/>]/g

function ownerOf(path: string): string {
  return path.match(/^layers\/([^/]+)\//)?.[1] ?? ROOT_OWNER
}

function toPascalCase(name: string): string {
  return name
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join('')
}

function isTestSource(path: string): boolean {
  return path.endsWith('.test.ts') || /^layers\/[^/]+\/tests\//.test(path)
}

function stripComments(content: string): string {
  return content
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/(^|[^:])\/\/.*$/gm, '$1')
}

function templateOf(content: string): string {
  const start = content.search(/<template[\s>]/)
  const end = content.lastIndexOf('</template>')
  return start === -1 || end === -1 ? '' : content.slice(start, end)
}

function registerComponents(files: readonly SourceFile[], violations: Violation[]): Map<string, ComponentEntry> {
  const components = new Map<string, ComponentEntry>()
  for (const { path } of files) {
    const relativeName = path.match(COMPONENT_PATH)?.[1]
    if (!relativeName) continue
    const owner = ownerOf(path)
    const name = relativeName.split('/').pop() ?? relativeName
    if (owner !== ROOT_OWNER && owner !== CORE_LAYER) {
      const prefix = toPascalCase(owner)
      if (relativeName.includes('/') || !name.startsWith(prefix)) {
        violations.push({
          rule: 'component-prefix',
          file: path,
          detail: `component must sit directly in app/components and start with "${prefix}"`,
        })
      }
    }
    const existing = components.get(name)
    if (existing) {
      violations.push({ rule: 'duplicate-component', file: path, detail: `"${name}" is also defined in ${existing.path}` })
      continue
    }
    components.set(name, { owner, path })
  }
  return components
}

function registerAutoImports(files: readonly SourceFile[]): Map<string, Set<string>> {
  const autoImports = new Map<string, Set<string>>()
  for (const { path, content } of files) {
    if (!AUTO_IMPORT_PATH.test(path) || isTestSource(path)) continue
    for (const [, name] of content.matchAll(EXPORTED_NAME)) {
      if (!name) continue
      const owners = autoImports.get(name) ?? new Set<string>()
      owners.add(ownerOf(path))
      autoImports.set(name, owners)
    }
  }
  return autoImports
}

export function checkArchitecture(files: readonly SourceFile[], layerDependencies: LayerDependencies): Violation[] {
  const violations: Violation[] = []

  const layers = [...new Set(files.map((file) => ownerOf(file.path)))].filter((owner) => owner !== ROOT_OWNER).sort()
  for (const layer of layers) {
    if (!(layer in layerDependencies)) {
      violations.push({
        rule: 'undeclared-layer',
        file: `layers/${layer}`,
        detail: `layer "${layer}" is missing from LAYER_DEPENDENCIES`,
      })
    }
  }

  const components = registerComponents(files, violations)
  const autoImports = registerAutoImports(files)

  for (const { path, content } of files) {
    const layer = ownerOf(path)
    if (layer === ROOT_OWNER || isTestSource(path)) continue
    const allowed = new Set([layer, ...(layerDependencies[layer] ?? [])])
    const code = stripComments(content)

    if (path.endsWith('.vue')) {
      const reported = new Set<string>()
      for (const [, tag] of templateOf(code).matchAll(TEMPLATE_TAG)) {
        if (!tag) continue
        const name = toPascalCase(tag).replace(/^Lazy(?=[A-Z])/, '')
        const component = components.get(name)
        if (!component || allowed.has(component.owner) || reported.has(name)) continue
        reported.add(name)
        violations.push({ rule: 'foreign-component', file: path, detail: `${name} belongs to ${component.owner}` })
      }
    }

    for (const [name, owners] of autoImports) {
      if ([...owners].some((owner) => allowed.has(owner))) continue
      if (new RegExp(`\\b${name.replace(/\$/g, '\\$')}\\b`).test(code)) {
        violations.push({
          rule: 'foreign-auto-import',
          file: path,
          detail: `${name} is auto-imported from ${[...owners].sort().join(', ')}`,
        })
      }
    }
  }

  return violations
}
