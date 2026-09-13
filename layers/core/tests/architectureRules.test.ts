import { describe, expect, it } from 'vitest'
import { checkArchitecture, type SourceFile } from './architectureRules'

function source(path: string, content = ''): SourceFile {
  return { path, content }
}

const dependencies = { core: [], consent: ['core'], admin: ['core'] }

describe('checkArchitecture', () => {
  it('accepts a layer that uses its own and core components and auto-imports', () => {
    const files = [
      source('layers/core/app/components/ui/AppButton.vue'),
      source('layers/core/shared/utils/text.ts', 'export function clipText() {}'),
      source('layers/consent/app/components/ConsentBanner.vue', '<template><AppButton /></template>'),
      source(
        'layers/consent/app/pages/privacy.vue',
        '<script setup lang="ts">clipText("a", 1)</script><template><ConsentBanner /></template>',
      ),
    ]
    expect(checkArchitecture(files, dependencies)).toEqual([])
  })

  it('reports a layer missing from the dependency map', () => {
    expect(checkArchitecture([source('layers/billing/index.ts')], dependencies)).toEqual([
      { rule: 'undeclared-layer', file: 'layers/billing', detail: 'layer "billing" is missing from LAYER_DEPENDENCIES' },
    ])
  })

  it('reports a feature component without the layer prefix', () => {
    const path = 'layers/consent/app/components/CookieBanner.vue'
    expect(checkArchitecture([source(path)], dependencies)).toEqual([
      { rule: 'component-prefix', file: path, detail: 'component must sit directly in app/components and start with "Consent"' },
    ])
  })

  it('reports a feature component nested in a subfolder', () => {
    const path = 'layers/consent/app/components/banner/ConsentBanner.vue'
    expect(checkArchitecture([source(path)], dependencies)).toEqual([
      { rule: 'component-prefix', file: path, detail: 'component must sit directly in app/components and start with "Consent"' },
    ])
  })

  it('reports a component name defined twice', () => {
    const files = [
      source('app/components/site/SiteSection.vue'),
      source('layers/core/app/components/ui/SiteSection.vue'),
    ]
    expect(checkArchitecture(files, dependencies)).toEqual([
      {
        rule: 'duplicate-component',
        file: 'layers/core/app/components/ui/SiteSection.vue',
        detail: '"SiteSection" is also defined in app/components/site/SiteSection.vue',
      },
    ])
  })

  it('reports another feature component used in PascalCase or kebab-case', () => {
    const files = [
      source('layers/admin/app/components/AdminSidebar.vue'),
      source('layers/consent/app/pages/one.vue', '<template><AdminSidebar /></template>'),
      source('layers/consent/app/pages/two.vue', '<template><admin-sidebar></admin-sidebar></template>'),
    ]
    expect(checkArchitecture(files, dependencies)).toEqual([
      { rule: 'foreign-component', file: 'layers/consent/app/pages/one.vue', detail: 'AdminSidebar belongs to admin' },
      { rule: 'foreign-component', file: 'layers/consent/app/pages/two.vue', detail: 'AdminSidebar belongs to admin' },
    ])
  })

  it('attributes a component to the layer that holds the file, not to its name prefix', () => {
    const files = [
      source('layers/core/app/components/admin/AdminField.vue'),
      source('layers/consent/app/pages/privacy.vue', '<template><AdminField /></template>'),
    ]
    expect(checkArchitecture(files, dependencies)).toEqual([])
  })

  it('reports core using a component owned by the root app', () => {
    const files = [
      source('app/components/site/SiteHeader.vue'),
      source('layers/core/app/components/ui/SiteSection.vue', '<template><SiteHeader /></template>'),
    ]
    expect(checkArchitecture(files, dependencies)).toEqual([
      { rule: 'foreign-component', file: 'layers/core/app/components/ui/SiteSection.vue', detail: 'SiteHeader belongs to root' },
    ])
  })

  it('reports a root auto-import used from core', () => {
    const files = [
      source('app/composables/useQualifier.ts', 'export function useQualifier() {}'),
      source(
        'layers/core/app/components/ui/AppButton.vue',
        '<script setup lang="ts">const { enabled } = useQualifier()</script>',
      ),
    ]
    expect(checkArchitecture(files, dependencies)).toEqual([
      {
        rule: 'foreign-auto-import',
        file: 'layers/core/app/components/ui/AppButton.vue',
        detail: 'useQualifier is auto-imported from root',
      },
    ])
  })

  it('reports an auto-import from another feature layer', () => {
    const files = [
      source('layers/admin/app/composables/useAdminNav.ts', 'export function useAdminNav() {}'),
      source('layers/consent/state/useCookieConsent.ts', 'const nav = useAdminNav()'),
    ]
    expect(checkArchitecture(files, dependencies)).toEqual([
      {
        rule: 'foreign-auto-import',
        file: 'layers/consent/state/useCookieConsent.ts',
        detail: 'useAdminNav is auto-imported from admin',
      },
    ])
  })

  it('ignores names that appear only in comments', () => {
    const files = [
      source('app/composables/useQualifier.ts', 'export function useQualifier() {}'),
      source('app/components/site/SiteHeader.vue'),
      source(
        'layers/core/app/components/ui/SiteSection.vue',
        '<script setup lang="ts">\n// replaces useQualifier()\n/* useQualifier */\n</script>\n<template><!-- <SiteHeader /> --><div /></template>',
      ),
    ]
    expect(checkArchitecture(files, dependencies)).toEqual([])
  })

  it('skips test files and the tests folder when scanning usages', () => {
    const files = [
      source('app/composables/useQualifier.ts', 'export function useQualifier() {}'),
      source('layers/core/shared/utils/text.test.ts', 'useQualifier()'),
      source('layers/core/tests/fixture.ts', 'useQualifier()'),
    ]
    expect(checkArchitecture(files, dependencies)).toEqual([])
  })
})
