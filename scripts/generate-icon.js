import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const rootDir = path.resolve(__dirname, '..')

const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <!-- Outer squircle gradient -->
    <linearGradient id="borderGrad" x1="0%" y1="100%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#f43f5e" />
      <stop offset="50%" stop-color="#f59e0b" />
      <stop offset="100%" stop-color="#34d399" />
    </linearGradient>

    <!-- Inner dark background gradient -->
    <linearGradient id="innerBg" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#181c28" />
      <stop offset="100%" stop-color="#0a0c12" />
    </linearGradient>

    <!-- Flame gradient -->
    <linearGradient id="flameGrad" x1="0%" y1="100%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#f59e0b" />
      <stop offset="50%" stop-color="#fbbf24" />
      <stop offset="100%" stop-color="#fef08a" />
    </linearGradient>
  </defs>

  <!-- Outer Gradient Border Squircle -->
  <rect x="16" y="16" width="480" height="480" rx="115" fill="url(#borderGrad)" />

  <!-- Inner Dark Squircle -->
  <rect x="30" y="30" width="452" height="452" rx="102" fill="url(#innerBg)" />

  <!-- Lucide Flame Vector (Scaled & Centered) -->
  <g transform="translate(136, 126) scale(10)" fill="url(#flameGrad)" stroke="#fbbf24" stroke-width="0.8" stroke-linecap="round" stroke-linejoin="round">
    <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
  </g>
</svg>`

fs.writeFileSync(path.join(rootDir, 'build/icon.svg'), svgContent)
fs.writeFileSync(path.join(rootDir, 'public/icon.svg'), svgContent)
console.log('Saved SVG icons.')
