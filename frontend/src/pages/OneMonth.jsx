import { useEffect, useRef } from 'react'

const OneMonth = () => {
  const canvasRef = useRef(null)
  const particlesRef = useRef([])
  const rotationRef = useRef(0)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    let animationId

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    // Generate volumetric heart with strong outline
    const generateHeartParticles = () => {
      const particles = []
      
      // Red/pink color palette like the image
      const colors = [
        [255, 0, 60],     // bright red
        [255, 20, 80],    // red-pink
        [255, 40, 100],   // pink
        [255, 60, 120],   // light pink
        [220, 20, 60],    // crimson
        [255, 80, 140],   // salmon pink
        [200, 0, 40],     // dark red
        [255, 100, 150],  // lighter pink
      ]

      // Generate outline particles (more dense)
      const outlinePoints = 80
      const depthLayers = 25
      
      for (let i = 0; i < outlinePoints; i++) {
        for (let j = 0; j < depthLayers; j++) {
          const t = (i / outlinePoints) * Math.PI * 2
          const depth = (j / depthLayers - 0.5) * 2
          
          // Heart parametric equation
          const scale = 1 - Math.abs(depth) * 0.15
          const x = 16 * Math.pow(Math.sin(t), 3) * scale
          const y = -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t)) * scale
          const z = depth * 10
          
          const color = colors[Math.floor(Math.random() * colors.length)]
          
          particles.push({
            x, y, z,
            size: 1.2 + Math.random() * 0.8,
            color,
            alpha: 0.9 + Math.random() * 0.1,
            isOutline: true
          })
        }
      }

      // Fill interior with less dense particles
      const interiorParticles = 800
      let added = 0
      let attempts = 0
      
      while (added < interiorParticles && attempts < interiorParticles * 5) {
        attempts++
        
        const x = (Math.random() - 0.5) * 30
        const y = (Math.random() - 0.5) * 30
        const z = (Math.random() - 0.5) * 18
        
        // Check if inside heart
        const theta = Math.atan2(z, x)
        const r = Math.sqrt(x * x + z * z)
        
        const zScale = 1 - Math.abs(z) / 10 * 0.15
        const heartX = 16 * Math.pow(Math.sin(theta), 3) * zScale
        const heartY = -(13 * Math.cos(theta) - 5 * Math.cos(2 * theta) - 2 * Math.cos(3 * theta) - Math.cos(4 * theta)) * zScale
        const maxR = Math.abs(heartX) * 0.85 // Slightly smaller to avoid edge
        const maxY = Math.abs(heartY) * 0.85
        
        if (r <= maxR && Math.abs(y) <= maxY) {
          const color = colors[Math.floor(Math.random() * colors.length)]
          
          particles.push({
            x, y, z,
            size: 0.9 + Math.random() * 0.6,
            color,
            alpha: 0.7 + Math.random() * 0.2,
            isOutline: false
          })
          added++
        }
      }
      
      return particles
    }

    particlesRef.current = generateHeartParticles()

    // Animation
    const animate = () => {
      const width = canvas.width
      const height = canvas.height

      // Clear
      ctx.fillStyle = 'rgb(0, 0, 0)'
      ctx.fillRect(0, 0, width, height)

      // Continuous auto-rotation
      rotationRef.current += 0.02

      // Process and sort by depth
      const sorted = particlesRef.current.map(p => {
        // Rotate
        const cosY = Math.cos(rotationRef.current)
        const sinY = Math.sin(rotationRef.current)
        
        const rotatedX = p.x * cosY - p.z * sinY
        const rotatedZ = p.x * sinY + p.z * cosY
        const rotatedY = p.y

        // 3D projection
        const perspective = 800
        const distance = 120
        const scale = perspective / (perspective + rotatedZ + distance)
        
        const screenX = width / 2 + rotatedX * scale * 8
        const screenY = height / 2 + rotatedY * scale * 8

        return {
          ...p,
          rotatedZ,
          screenX,
          screenY,
          scale,
          brightness: scale
        }
      }).sort((a, b) => a.rotatedZ - b.rotatedZ)

      // Draw particles
      sorted.forEach(p => {
        if (p.scale <= 0) return

        const size = p.size * p.scale * (p.isOutline ? 3 : 2.5)
        const glowIntensity = p.isOutline ? 0.5 : 0.3

        // Glow
        const glowSize = size * (p.isOutline ? 8 : 10)
        const gradient = ctx.createRadialGradient(
          p.screenX, p.screenY, 0,
          p.screenX, p.screenY, glowSize
        )
        
        const glowAlpha = p.brightness * glowIntensity
        gradient.addColorStop(0, `rgba(${p.color[0]}, ${p.color[1]}, ${p.color[2]}, ${glowAlpha})`)
        gradient.addColorStop(0.4, `rgba(${p.color[0]}, ${p.color[1]}, ${p.color[2]}, ${glowAlpha * 0.3})`)
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0)')
        
        ctx.fillStyle = gradient
        ctx.beginPath()
        ctx.arc(p.screenX, p.screenY, glowSize, 0, Math.PI * 2)
        ctx.fill()

        // Core
        ctx.fillStyle = `rgba(${p.color[0]}, ${p.color[1]}, ${p.color[2]}, ${p.alpha})`
        ctx.beginPath()
        ctx.arc(p.screenX, p.screenY, size, 0, Math.PI * 2)
        ctx.fill()

        // Bright center (stronger for outline)
        const highlightAlpha = p.isOutline ? 0.8 : 0.5
        ctx.fillStyle = `rgba(255, 200, 200, ${highlightAlpha})`
        ctx.beginPath()
        ctx.arc(p.screenX, p.screenY, size * 0.4, 0, Math.PI * 2)
        ctx.fill()
      })

      animationId = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      cancelAnimationFrame(animationId)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-black">
      <canvas ref={canvasRef} className="absolute inset-0" />
    </div>
  )
}

export default OneMonth
