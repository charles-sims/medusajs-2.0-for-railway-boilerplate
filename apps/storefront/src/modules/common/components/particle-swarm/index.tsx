"use client"

import { useEffect, useRef } from "react"

/**
 * Particle swarm animation — autonomous dashes that drift organically
 * and scatter away from the user's cursor. Uses CaliLean brand palette.
 */
export default function ParticleSwarm() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // --- CaliLean palette with opacity variants for visual depth ---
    const palette = [
      "#7090AB",        // pacific (primary)
      "#7090AB",        // pacific — weighted heavier
      "#8BA3B8",        // pacific lightened
      "#9CA3A8",        // fog
      "#5A7A94",        // pacific darkened
      "#B8C4CC",        // fog lightened
      "#7090AB",        // pacific again for weight
    ]

    const PARTICLE_COUNT = 180
    const MOUSE_RADIUS = 140
    const BASE_SPEED = 0.9
    const DASH_MIN = 5
    const DASH_MAX = 16
    const THICKNESS_MIN = 1.2
    const THICKNESS_MAX = 2.4
    const WANDER_STRENGTH = 0.15
    const WANDER_PULL = 0.03
    const MOUSE_FORCE = 0.6
    const FRICTION = 0.96
    const SPEED_CAP = BASE_SPEED * 2.5

    let dpr = 1
    let particles: {
      x: number
      y: number
      vx: number
      vy: number
      angle: number
      color: string
      length: number
      thickness: number
      opacity: number
    }[] = []
    let animId = 0
    let mouse = { x: -9999, y: -9999 }

    const resize = () => {
      dpr = window.devicePixelRatio || 1
      canvas.width = window.innerWidth * dpr
      canvas.height = window.innerHeight * dpr
      canvas.style.width = `${window.innerWidth}px`
      canvas.style.height = `${window.innerHeight}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }

    const onMove = (e: MouseEvent) => {
      mouse.x = e.clientX
      mouse.y = e.clientY
    }
    const onTouch = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        mouse.x = e.touches[0].clientX
        mouse.y = e.touches[0].clientY
      }
    }
    const onLeave = () => {
      mouse.x = -9999
      mouse.y = -9999
    }

    resize()
    window.addEventListener("resize", resize)
    window.addEventListener("mousemove", onMove)
    window.addEventListener("touchmove", onTouch, { passive: true })
    window.addEventListener("mouseout", onLeave)

    // Seed particles
    const w = window.innerWidth
    const h = window.innerHeight
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const angle = Math.random() * Math.PI * 2
      particles.push({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: Math.cos(angle) * BASE_SPEED,
        vy: Math.sin(angle) * BASE_SPEED,
        angle,
        color: palette[Math.floor(Math.random() * palette.length)],
        length: DASH_MIN + Math.random() * (DASH_MAX - DASH_MIN),
        thickness: THICKNESS_MIN + Math.random() * (THICKNESS_MAX - THICKNESS_MIN),
        opacity: 0.25 + Math.random() * 0.45,
      })
    }

    const animate = () => {
      const cw = window.innerWidth
      const ch = window.innerHeight

      ctx.clearRect(0, 0, cw, ch)

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i]

        // Mouse repulsion
        const dx = p.x - mouse.x
        const dy = p.y - mouse.y
        const dist = Math.sqrt(dx * dx + dy * dy)
        if (dist < MOUSE_RADIUS && dist > 0) {
          const force = ((MOUSE_RADIUS - dist) / MOUSE_RADIUS) * MOUSE_FORCE
          p.vx += (dx / dist) * force
          p.vy += (dy / dist) * force
        }

        // Organic wander
        p.angle += (Math.random() - 0.5) * WANDER_STRENGTH
        p.vx += Math.cos(p.angle) * WANDER_PULL
        p.vy += Math.sin(p.angle) * WANDER_PULL

        // Speed cap + friction
        const speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy)
        if (speed > SPEED_CAP) {
          p.vx *= FRICTION
          p.vy *= FRICTION
        }

        // Position update
        p.x += p.vx
        p.y += p.vy

        // Screen wrap
        if (p.x < -20) p.x = cw + 20
        else if (p.x > cw + 20) p.x = -20
        if (p.y < -20) p.y = ch + 20
        else if (p.y > ch + 20) p.y = -20

        // Draw dash oriented to movement direction
        const moveAngle = Math.atan2(p.vy, p.vx)
        ctx.save()
        ctx.globalAlpha = p.opacity
        ctx.translate(p.x, p.y)
        ctx.rotate(moveAngle)

        // Rounded dash with lineCap
        ctx.beginPath()
        ctx.moveTo(-p.length / 2, 0)
        ctx.lineTo(p.length / 2, 0)
        ctx.strokeStyle = p.color
        ctx.lineWidth = p.thickness
        ctx.lineCap = "round"
        ctx.stroke()

        ctx.restore()
      }

      animId = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener("resize", resize)
      window.removeEventListener("mousemove", onMove)
      window.removeEventListener("touchmove", onTouch)
      window.removeEventListener("mouseout", onLeave)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none"
      aria-hidden="true"
    />
  )
}
