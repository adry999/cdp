<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'

export type BackgroundVariant = 'dot-matrix' | 'constellation' | 'light-orbs'

const props = withDefaults(
  defineProps<{
    variant?: BackgroundVariant
    inverted?: boolean
  }>(),
  {
    variant: 'dot-matrix',
    inverted: false,
  },
)

const containerRef = ref<HTMLDivElement | null>(null)
const canvasRef = ref<HTMLCanvasElement | null>(null)

interface Point {
  originX: number
  originY: number
  x: number
  y: number
  vx: number
  vy: number
}

interface ConstellationParticle {
  x: number
  y: number
  vx: number
  vy: number
  radius: number
  isAccent: boolean
  phase: number
}

interface LightOrb {
  x: number
  y: number
  vx: number
  vy: number
  radius: number
  mass: number
  angle: number
  colorRgb: [number, number, number]
  alphaMax: number
}

onMounted(() => {
  if (!import.meta.client) return

  const container = containerRef.value
  const canvas = canvasRef.value
  if (!container || !canvas) return

  const ctx = canvas.getContext('2d')
  if (!ctx) return

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const canHover = window.matchMedia('(hover: hover)').matches

  let animId: number | null = null
  let isVisible = true
  let width = 0
  let height = 0
  let dpr = 1

  // Physical mouse state
  const mouse = {
    x: 0,
    y: 0,
    targetX: 0,
    targetY: 0,
    active: false,
    alpha: 0.85,
    targetAlpha: 0.85,
  }

  // Variant 1: Dot Matrix state
  let gridPoints: Point[] = []
  const GRID_GAP = 32
  const LENS_RADIUS = 210

  function initGrid() {
    gridPoints = []
    if (width <= 0 || height <= 0) return
    const cols = Math.ceil(width / GRID_GAP) + 1
    const rows = Math.ceil(height / GRID_GAP) + 1
    const offsetX = (width - (cols - 1) * GRID_GAP) / 2
    const offsetY = (height - (rows - 1) * GRID_GAP) / 2

    for (let i = 0; i < cols; i++) {
      for (let j = 0; j < rows; j++) {
        const ox = offsetX + i * GRID_GAP
        const oy = offsetY + j * GRID_GAP
        gridPoints.push({
          originX: ox,
          originY: oy,
          x: ox,
          y: oy,
          vx: 0,
          vy: 0,
        })
      }
    }
  }

  // Variant 2: Constellation state
  let particles: ConstellationParticle[] = []
  const CONNECT_DIST = 125

  function initConstellation() {
    particles = []
    if (width <= 0 || height <= 0) return
    const count = Math.min(55, Math.max(26, Math.floor((width * height) / 16000)))
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2
      const speed = 0.25 + Math.random() * 0.45
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        radius: 1.8 + Math.random() * 1.8,
        isAccent: Math.random() < 0.22,
        phase: Math.random() * Math.PI * 2,
      })
    }
  }

  // Variant 3: Light Orbs state
  let orbs: LightOrb[] = []
  function initOrbs() {
    if (width <= 0 || height <= 0) return
    orbs = [
      {
        x: width * 0.35,
        y: height * 0.45,
        vx: 0,
        vy: 0,
        radius: Math.max(180, Math.min(300, width * 0.35)),
        mass: 14,
        angle: 0,
        colorRgb: [255, 77, 20], // Signal Orange
        alphaMax: props.inverted ? 0.36 : 0.14,
      },
      {
        x: width * 0.65,
        y: height * 0.55,
        vx: 0,
        vy: 0,
        radius: Math.max(220, Math.min(360, width * 0.45)),
        mass: 22,
        angle: Math.PI * 0.7,
        colorRgb: [245, 158, 11], // Warm Amber
        alphaMax: props.inverted ? 0.28 : 0.10,
      },
      {
        x: width * 0.5,
        y: height * 0.35,
        vx: 0,
        vy: 0,
        radius: Math.max(140, Math.min(220, width * 0.25)),
        mass: 8,
        angle: Math.PI * 1.4,
        colorRgb: [255, 122, 69], // Flame accent
        alphaMax: props.inverted ? 0.30 : 0.12,
      },
    ]
  }

  function resize() {
    if (!container || !canvas) return
    const rect = container.getBoundingClientRect()
    if (rect.width <= 0 || rect.height <= 0) return

    width = rect.width
    height = rect.height
    dpr = Math.min(window.devicePixelRatio || 1, 2)

    canvas.width = Math.floor(width * dpr)
    canvas.height = Math.floor(height * dpr)
    canvas.style.width = `${width}px`
    canvas.style.height = `${height}px`

    ctx?.setTransform(dpr, 0, 0, dpr, 0, 0)

    if (props.variant === 'dot-matrix') {
      initGrid()
    } else if (props.variant === 'constellation') {
      initConstellation()
    } else if (props.variant === 'light-orbs') {
      initOrbs()
    }
  }

  // Pointer tracking attached to WINDOW so pointer-events-none elements never block tracking
  function onPointerMove(e: PointerEvent) {
    if (!container) return
    const rect = container.getBoundingClientRect()
    const margin = 120

    if (
      e.clientX >= rect.left - margin &&
      e.clientX <= rect.right + margin &&
      e.clientY >= rect.top - margin &&
      e.clientY <= rect.bottom + margin
    ) {
      mouse.targetX = e.clientX - rect.left
      mouse.targetY = e.clientY - rect.top
      mouse.active = true
      mouse.targetAlpha = 1

      // Resume loop if it was asleep
      if (animId === null && isVisible && !prefersReduced) {
        lastTime = performance.now()
        animId = requestAnimationFrame(loop)
      }
    } else if (mouse.active) {
      mouse.active = false
      mouse.targetAlpha = 0
    }
  }

  window.addEventListener('pointermove', onPointerMove, { passive: true })

  // Trigger resize and fallback checks
  resize()
  requestAnimationFrame(resize)
  setTimeout(resize, 100)

  mouse.x = width / 2
  mouse.y = height / 2
  mouse.targetX = width / 2
  mouse.targetY = height / 2

  const resizeObserver = new ResizeObserver(() => {
    resize()
  })
  resizeObserver.observe(container)

  watch(
    () => props.variant,
    () => {
      resize()
    },
  )

  // Viewport intersection observer (threshold 0 with margin so it starts before edge)
  const intersectionObserver = new IntersectionObserver(
    (entries) => {
      const entry = entries[0]
      isVisible = entry?.isIntersecting ?? true
      if (isVisible && animId === null && !prefersReduced) {
        lastTime = performance.now()
        animId = requestAnimationFrame(loop)
      }
    },
    { threshold: 0, rootMargin: '100px 0px 100px 0px' },
  )
  intersectionObserver.observe(container)

  const onVisibilityChange = () => {
    if (document.hidden) {
      if (animId !== null) {
        cancelAnimationFrame(animId)
        animId = null
      }
    } else if (isVisible && animId === null && !prefersReduced) {
      lastTime = performance.now()
      animId = requestAnimationFrame(loop)
    }
  }
  document.addEventListener('visibilitychange', onVisibilityChange)

  let lastTime = performance.now()

  // Main render loop
  function loop(now: number) {
    if (!ctx) return
    const dt = Math.min((now - lastTime) / 1000, 0.05)
    lastTime = now

    // Ensure dimensions are initialized
    if (width <= 0 || height <= 0 || (props.variant === 'dot-matrix' && gridPoints.length === 0)) {
      resize()
    }

    // Smooth cursor interpolation
    mouse.x += (mouse.targetX - mouse.x) * 0.14
    mouse.y += (mouse.targetY - mouse.y) * 0.14
    mouse.alpha += (mouse.targetAlpha - mouse.alpha) * 0.08

    // On mobile touch devices or idle, maintain gentle organic drift
    if (!canHover && !mouse.active) {
      const timeSec = now * 0.001
      mouse.x = width / 2 + Math.cos(timeSec * 0.7) * (width * 0.15)
      mouse.y = height / 2 + Math.sin(timeSec * 0.9) * (height * 0.15)
      mouse.alpha = 0.6
    }

    ctx.clearRect(0, 0, width, height)

    if (props.variant === 'dot-matrix') {
      renderDotMatrix(ctx, now)
    } else if (props.variant === 'constellation') {
      renderConstellation(ctx, now)
    } else if (props.variant === 'light-orbs') {
      renderLightOrbs(ctx, now, dt)
    }

    if (isVisible && !prefersReduced) {
      animId = requestAnimationFrame(loop)
    } else {
      animId = null
    }
  }

  // --- Variant 1: Dot Matrix Render ---
  function renderDotMatrix(context: CanvasRenderingContext2D, now: number) {
    const isDark = props.inverted
    const light = mouse.alpha
    const timeSec = now * 0.001

    // 1. Ambient radial spotlight glow
    if (light > 0.01) {
      const grad = context.createRadialGradient(
        mouse.x,
        mouse.y,
        0,
        mouse.x,
        mouse.y,
        LENS_RADIUS * 1.15,
      )
      if (isDark) {
        grad.addColorStop(0, `rgba(255, 77, 20, ${0.24 * light})`)
        grad.addColorStop(0.45, `rgba(255, 77, 20, ${0.08 * light})`)
        grad.addColorStop(1, 'rgba(255, 77, 20, 0)')
      } else {
        grad.addColorStop(0, `rgba(255, 77, 20, ${0.14 * light})`)
        grad.addColorStop(0.5, `rgba(255, 77, 20, ${0.04 * light})`)
        grad.addColorStop(1, 'rgba(255, 77, 20, 0)')
      }
      context.fillStyle = grad
      context.beginPath()
      context.arc(mouse.x, mouse.y, LENS_RADIUS * 1.15, 0, Math.PI * 2)
      context.fill()
    }

    // 2. Base dots: clearly visible architectural coordinate grid
    const baseColor = isDark ? 'rgba(250, 248, 244, 0.22)' : 'rgba(11, 11, 11, 0.20)'
    context.fillStyle = baseColor
    context.beginPath()

    const activePoints: { x: number; y: number; r: number; color: string }[] = []

    for (let i = 0; i < gridPoints.length; i++) {
      const p = gridPoints[i]!
      const dx = p.originX - mouse.x
      const dy = p.originY - mouse.y
      const dist = Math.hypot(dx, dy)

      let targetX = p.originX
      let targetY = p.originY

      if (dist < LENS_RADIUS && light > 0.01) {
        // Gravitational lens deflection
        const factor = Math.cos((dist / LENS_RADIUS) * (Math.PI / 2)) * light
        const normX = dx / (dist || 1)
        const normY = dy / (dist || 1)

        targetX = p.originX + normX * (18 * factor)
        targetY = p.originY + normY * (18 * factor)

        // Elastic spring lerp
        p.vx = (p.vx + (targetX - p.x) * 0.22) * 0.72
        p.vy = (p.vy + (targetY - p.y) * 0.22) * 0.72
        p.x += p.vx
        p.y += p.vy

        // Highlight active dots inside beam
        const intensity = 1 - dist / LENS_RADIUS
        const r = 1.35 + intensity * 1.85
        let color: string

        if (intensity > 0.45) {
          // Inner core turns vibrant signal orange
          color = `rgba(255, 77, 20, ${0.5 + intensity * 0.45 * light})`
        } else if (isDark) {
          color = `rgba(250, 248, 244, ${0.25 + intensity * 0.65 * light})`
        } else {
          color = `rgba(11, 11, 11, ${0.25 + intensity * 0.65 * light})`
        }

        activePoints.push({ x: p.x, y: p.y, r, color })
      } else {
        // Return to resting position with subtle harmonic breathing
        const idleJiggle = Math.sin(timeSec * 1.5 + p.originX * 0.02 + p.originY * 0.02) * 0.4
        p.vx = (p.vx + (p.originX - p.x) * 0.22) * 0.72
        p.vy = (p.vy + (p.originY - p.y) * 0.22) * 0.72
        p.x += p.vx
        p.y += p.vy

        context.moveTo(p.x + 1.35, p.y + idleJiggle)
        context.arc(p.x, p.y + idleJiggle, 1.35, 0, Math.PI * 2)
      }
    }

    context.fill()

    // Draw active highlighted dots
    for (let i = 0; i < activePoints.length; i++) {
      const ap = activePoints[i]!
      context.fillStyle = ap.color
      context.beginPath()
      context.arc(ap.x, ap.y, ap.r, 0, Math.PI * 2)
      context.fill()
    }
  }

  // --- Variant 2: Constellation Render ---
  function renderConstellation(context: CanvasRenderingContext2D, now: number) {
    const isDark = props.inverted
    const light = mouse.alpha
    const timeSec = now * 0.001

    // Ambient spotlight
    if (light > 0.01) {
      const grad = context.createRadialGradient(
        mouse.x,
        mouse.y,
        0,
        mouse.x,
        mouse.y,
        240,
      )
      if (isDark) {
        grad.addColorStop(0, `rgba(255, 77, 20, ${0.22 * light})`)
        grad.addColorStop(0.5, `rgba(255, 77, 20, ${0.06 * light})`)
        grad.addColorStop(1, 'rgba(255, 77, 20, 0)')
      } else {
        grad.addColorStop(0, `rgba(255, 77, 20, ${0.12 * light})`)
        grad.addColorStop(0.5, `rgba(255, 77, 20, ${0.03 * light})`)
        grad.addColorStop(1, 'rgba(255, 77, 20, 0)')
      }
      context.fillStyle = grad
      context.beginPath()
      context.arc(mouse.x, mouse.y, 240, 0, Math.PI * 2)
      context.fill()
    }

    // Update particles physics
    for (let i = 0; i < particles.length; i++) {
      const p = particles[i]!
      p.x += p.vx
      p.y += p.vy

      const pad = 20
      if (p.x < pad) {
        p.x = pad
        p.vx *= -1
      } else if (p.x > width - pad) {
        p.x = width - pad
        p.vx *= -1
      }
      if (p.y < pad) {
        p.y = pad
        p.vy *= -1
      } else if (p.y > height - pad) {
        p.y = height - pad
        p.vy *= -1
      }

      // Cursor gravity interaction
      if (light > 0.01) {
        const dx = mouse.x - p.x
        const dy = mouse.y - p.y
        const dist = Math.hypot(dx, dy)

        if (dist < 250 && dist > 1) {
          const pull = (1 - dist / 250) * 0.48 * light
          p.vx += (dx / dist) * pull
          p.vy += (dy / dist) * pull

          if (dist < 32) {
            const repel = (1 - dist / 32) * 0.85
            p.vx -= (dx / dist) * repel
            p.vy -= (dy / dist) * repel
          }
        }
      }

      p.vx *= 0.965
      p.vy *= 0.965

      const speed = Math.hypot(p.vx, p.vy)
      if (speed < 0.28) {
        p.vx += Math.cos(p.phase + timeSec) * 0.06
        p.vy += Math.sin(p.phase + timeSec) * 0.06
      }
    }

    // Dynamic filaments
    for (let i = 0; i < particles.length; i++) {
      const p1 = particles[i]!
      for (let j = i + 1; j < particles.length; j++) {
        const p2 = particles[j]!
        const dx = p1.x - p2.x
        const dy = p1.y - p2.y
        const dist = Math.hypot(dx, dy)

        if (dist < CONNECT_DIST) {
          const midX = (p1.x + p2.x) / 2
          const midY = (p1.y + p2.y) / 2
          const distToCursor = Math.hypot(mouse.x - midX, mouse.y - midY)
          const connectionRatio = 1 - dist / CONNECT_DIST

          context.beginPath()
          context.moveTo(p1.x, p1.y)
          context.lineTo(p2.x, p2.y)

          if (distToCursor < 190 && light > 0.01) {
            const beamRatio = (1 - distToCursor / 190) * light
            const alpha = (0.25 + beamRatio * 0.75) * connectionRatio
            context.strokeStyle = `rgba(255, 77, 20, ${alpha})`
            context.lineWidth = 1 + beamRatio * 0.8
          } else {
            const alpha = connectionRatio * (isDark ? 0.14 : 0.10)
            context.strokeStyle = isDark ? `rgba(250, 248, 244, ${alpha})` : `rgba(11, 11, 11, ${alpha})`
            context.lineWidth = 0.9
          }
          context.stroke()
        }
      }
    }

    // Particle nodes
    for (let i = 0; i < particles.length; i++) {
      const p = particles[i]!
      const distToCursor = Math.hypot(mouse.x - p.x, mouse.y - p.y)
      const isNearCursor = distToCursor < 180 && light > 0.01

      context.beginPath()
      const radius = isNearCursor ? p.radius * 1.4 : p.radius
      context.arc(p.x, p.y, radius, 0, Math.PI * 2)

      if (p.isAccent || (isNearCursor && distToCursor < 90)) {
        context.fillStyle = `rgba(255, 77, 20, ${isNearCursor ? 0.95 : 0.80})`
      } else if (isDark) {
        context.fillStyle = isNearCursor ? 'rgba(250, 248, 244, 0.95)' : 'rgba(250, 248, 244, 0.35)'
      } else {
        context.fillStyle = isNearCursor ? 'rgba(11, 11, 11, 0.90)' : 'rgba(11, 11, 11, 0.30)'
      }
      context.fill()
    }
  }

  // --- Variant 3: Light Orbs Render ---
  function renderLightOrbs(context: CanvasRenderingContext2D, now: number, dt: number) {
    const isDark = props.inverted
    const timeSec = now * 0.001

    context.globalCompositeOperation = isDark ? 'screen' : 'source-over'

    for (let i = 0; i < orbs.length; i++) {
      const orb = orbs[i]!

      const idleRadius = 60 + i * 50
      const idleX = width / 2 + Math.cos(timeSec * 0.8 + orb.angle) * idleRadius
      const idleY = height / 2 + Math.sin(timeSec * 0.6 + orb.angle) * (idleRadius * 0.65)

      const targetX = mouse.active ? mouse.x + Math.cos(orb.angle + timeSec) * (30 * (i + 1)) : idleX
      const targetY = mouse.active ? mouse.y + Math.sin(orb.angle + timeSec) * (30 * (i + 1)) : idleY

      const fx = (targetX - orb.x) / orb.mass
      const fy = (targetY - orb.y) / orb.mass

      orb.vx = (orb.vx + fx * (dt * 60)) * 0.89
      orb.vy = (orb.vy + fy * (dt * 60)) * 0.89
      orb.x += orb.vx
      orb.y += orb.vy

      const grad = context.createRadialGradient(
        orb.x,
        orb.y,
        0,
        orb.x,
        orb.y,
        orb.radius,
      )

      const [r, g, b] = orb.colorRgb
      const maxA = orb.alphaMax

      if (isDark) {
        grad.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${maxA})`)
        grad.addColorStop(0.35, `rgba(${r}, ${g}, ${b}, ${maxA * 0.55})`)
        grad.addColorStop(0.75, `rgba(${r}, ${g}, ${b}, ${maxA * 0.18})`)
        grad.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`)
      } else {
        grad.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${maxA})`)
        grad.addColorStop(0.45, `rgba(${r}, ${g}, ${b}, ${maxA * 0.40})`)
        grad.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`)
      }

      context.fillStyle = grad
      context.beginPath()
      context.arc(orb.x, orb.y, orb.radius, 0, Math.PI * 2)
      context.fill()
    }

    context.globalCompositeOperation = 'source-over'
  }

  // Draw static baseline frame if user prefers reduced motion
  if (prefersReduced) {
    if (props.variant === 'dot-matrix') {
      renderDotMatrix(ctx, 0)
    } else if (props.variant === 'constellation') {
      renderConstellation(ctx, 0)
    } else if (props.variant === 'light-orbs') {
      renderLightOrbs(ctx, 0, 0.016)
    }
  } else {
    animId = requestAnimationFrame(loop)
  }

  onBeforeUnmount(() => {
    if (animId !== null) cancelAnimationFrame(animId)
    window.removeEventListener('pointermove', onPointerMove)
    document.removeEventListener('visibilitychange', onVisibilityChange)
    resizeObserver.disconnect()
    intersectionObserver.disconnect()
  })
})
</script>

<template>
  <div
    ref="containerRef"
    aria-hidden="true"
    class="pointer-events-none absolute inset-0 z-0 h-full w-full overflow-hidden"
  >
    <canvas ref="canvasRef" class="block h-full w-full" />
  </div>
</template>
