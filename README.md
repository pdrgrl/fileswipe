# FileSwipe 🔥

> **Tinder for Files** — Gamified cross-platform file cleanup and decluttering for Windows, macOS, and Linux.

[![Platform](https://img.shields.io/badge/platform-Windows%20%7C%20macOS%20%7C%20Linux-blue.svg)](https://github.com/)
[![Built with Electron](https://img.shields.io/badge/built%20with-Electron%2034-47848F.svg)](https://www.electronjs.org/)
[![React 19](https://img.shields.io/badge/React-19-61DAFB.svg)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS%203-38B2AC.svg)](https://tailwindcss.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

---

## ⚡ Overview

Decluttering thousands of downloads, screenshots, recordings, and stale project files used to be tedious. **FileSwipe** turns folder cleaning into a fast, fluid, gamified card swiper:

- 💚 **Keep (Swipe Right / `→` / `D`)**: Retain the file and remove it from your queue.
- 🗑️ **Delete (Swipe Left / `←` / `A`)**: Safely move the file to your OS **Recycle Bin / Trash** (with instant `Ctrl+Z` Undo support!).
- ⏳ **Skip (Swipe Down / `↓` / `Space`)**: Send the file to the back of the queue to decide later.

---

## ✨ Features

- 🃏 **Tinder-Style Card Physics**: Fluid drag gestures with inertia, rotational physics, dynamic stamp badges (`KEEP`, `DELETE`, `SKIP`), and stacked background card depth powered by **Framer Motion**.
- 🛡️ **Safe OS Trash Integration**: Files are moved to the OS Recycle Bin (`shell.trashItem()`), never permanently destroyed without notice.
- ↩️ **Instant Undo Support**: Made a quick swipe mistake? Hit `Ctrl+Z` or `Z` to restore the last action immediately.
- 👁️ **Universal Multi-Format Previews**:
  - **Images**: High-res rendering with zoom/pan inspector (JPG, PNG, GIF, WebP, SVG, AVIF, BMP, ICO).
  - **Audio & Video**: Built-in video player & audio visualizer with inline controls (MP4, WebM, MOV, MP3, WAV, FLAC, M4A).
  - **Code & Documents**: Syntax-highlighted code viewer with line numbers (JS, TS, Python, HTML, CSS, JSON, Markdown, YAML, SQL, etc.).
  - **Archives & Binaries**: Metadata breakdown with exact file size, permissions, and timestamps.
- 📊 **Real-Time Storage Meter**: Live counter tracking reclaimed disk space (`🔥 +1.8 GB Reclaimed`).
- 🔍 **Smart Filters & Sorting**:
  - Filter by file category (Images, Videos, Audio, Code, Docs, Archives).
  - Filter by minimum file size (`> 10MB`, `> 100MB`, etc.).
  - Sort by Largest first, Oldest first, Newest first, or Shuffle/Random.
  - Subdirectory recursion and hidden files toggle.
- 🔊 **Synthesized Web Audio FX**: Crisp, responsive sound effects for Keep, Delete, Skip, Undo, and Victory (toggleable with `M`).
- 🎉 **Session Completion Victory Screen**: Confetti celebration, full session activity breakdown, and space reclaimed metrics.

---

## ⌨️ Keyboard Shortcuts

| Shortcut | Action | Description |
|---|---|---|
| `→` or `D` | **Keep** | Keep file on disk, advance queue |
| `←` or `A` | **Delete** | Move file safely to OS Recycle Bin |
| `↓` or `S` or `Space` | **Skip** | Send file to end of queue |
| `Ctrl + Z` or `Z` | **Undo** | Undo the previous swipe action |
| `O` | **Reveal** | Open & highlight file in Explorer / Finder |
| `M` | **Audio** | Toggle sound effects on/off |
| `Esc` | **Close** | Close open modals or menus |

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- `npm` or `pnpm` or `yarn`

### Installation

1. Clone the repository:
```bash
git clone https://github.com/your-username/fileswipe.git
cd fileswipe
```

2. Install dependencies:
```bash
npm install
```

3. Launch development mode:
```bash
npm run dev
```

### Packaging & Production Builds

To package FileSwipe into a standalone desktop executable for your operating system:

```bash
npm run build
```

The compiled binaries will be output into the `dist/` and `release/` directories:
- **Windows**: `.exe` installer / portable
- **macOS**: `.dmg` / `.app`
- **Linux**: `.AppImage` / `.deb`

---

## 🛠️ Tech Stack

- **Desktop Framework**: Electron 34
- **UI & Components**: React 19, TypeScript
- **Styling**: Tailwind CSS 3, Modern Glassmorphism
- **Motion & Gestures**: Framer Motion 12
- **Iconography**: Lucide React
- **Celebrations**: Canvas Confetti
- **Build Tooling**: Vite 6, `vite-plugin-electron`

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
