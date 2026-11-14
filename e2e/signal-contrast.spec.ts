import { expect, test, type Page } from '@playwright/test'
import { pinLocale } from './support/helpers'

// Text on the signal orange must read at WCAG AA (4.5:1) in both themes. The dark theme flips
// `ink` to a light colour, which on #FF4D14 gave 2.89:1; `on-signal` stays near-black.
const PAGES = ['/', '/servicii/aplicatie-web', '/blog/cat-costa-un-site', '/c']

type Sample = { text: string; ratio: number }

// Every visible element painted signal orange that carries its own text.
function signalTextContrast(page: Page): Promise<Sample[]> {
  return page.evaluate(() => {
    const rgb = (value: string) => (value.match(/[\d.]+/g) ?? []).slice(0, 3).map(Number)
    const luminance = ([r = 0, g = 0, b = 0]: number[]) => {
      const channel = (c: number) => {
        const s = c / 255
        return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4
      }
      return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b)
    }
    const signal = getComputedStyle(document.documentElement).getPropertyValue('--color-signal').trim()
    const probe = document.createElement('span')
    probe.style.color = signal
    document.body.append(probe)
    const signalRgb = getComputedStyle(probe).color
    probe.remove()

    const samples: { text: string; ratio: number }[] = []
    for (const element of document.querySelectorAll<HTMLElement>('body *')) {
      const style = getComputedStyle(element)
      if (style.backgroundColor !== signalRgb) continue
      const box = element.getBoundingClientRect()
      const text = element.innerText?.trim() ?? ''
      if (!box.width || !box.height || !text || style.visibility === 'hidden') continue
      const [light, dark] = [luminance(rgb(style.color)), luminance(rgb(style.backgroundColor))].sort((a, b) => b - a)
      samples.push({ text: text.slice(0, 40), ratio: Math.round(((light! + 0.05) / (dark! + 0.05)) * 100) / 100 })
    }
    return samples
  })
}

for (const theme of ['light', 'dark'] as const) {
  test(`text on signal orange reads at 4.5:1 in the ${theme} theme`, async ({ page, context }) => {
    await pinLocale(context)
    await page.emulateMedia({ colorScheme: theme })

    let checked = 0
    for (const path of PAGES) {
      await page.goto(path)
      await expect(page.locator('html')).toHaveAttribute('data-theme', theme)
      const samples = await signalTextContrast(page)
      checked += samples.length
      for (const sample of samples) {
        expect(sample.ratio, `${path}: "${sample.text}"`).toBeGreaterThanOrEqual(4.5)
      }
    }
    // The pages above all carry an orange call to action; an empty run would prove nothing.
    expect(checked).toBeGreaterThan(0)
  })
}
