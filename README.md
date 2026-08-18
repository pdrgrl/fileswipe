# FileSwipe 🔥

> **Tinder for Files** — Fast, fluid, and gamified cross-platform file cleanup and decluttering for Windows, macOS, and Linux.

[![Platform](https://img.shields.io/badge/platform-Windows%20%7C%20macOS%20%7C%20Linux-blue.svg)](https://github.com/)
[![Built with Electron](https://img.shields.io/badge/built%20with-Electron%2034-47848F.svg)](https://www.electronjs.org/)
[![React 19](https://img.shields.io/badge/React-19-61DAFB.svg)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS%203-38B2AC.svg)](https://tailwindcss.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

---

## ⚡ Overview

Decluttering thousands of downloads, screenshots, recordings, and stale project files used to be tedious. **FileSwipe** turns folder cleaning into a fast, fluid, gamified card swiper:

- 💚 **Keep (Swipe Right / `→` / `D`)**: Retain the file and remove it from your queue.
- 🗑️ **Delete (Swipe Left / `←` / `A`)**: Safely stage the file for trash (with **instant physical `Ctrl+Z` Undo** back onto disk!).
- ⏳ **Skip (Swipe Down / `↓` / `Space`)**: Send the file to the back of the queue to decide later.

---

## ✨ Features

### 🃏 Tinder-Style Card Physics & Gestures
- Fluid drag gestures with velocity-based releases, rotational physics, dynamic stamp badges (`KEEP`, `DELETE`, `SKIP`), and stacked background card depth powered by **Framer Motion**.
- Automatic center reset (`dragSnapToOrigin`) if a drag is released below threshold.

### 👁️ Universal Multi-Format Preview Engine
- 🖼️ **Images & Animated GIFs**: High-resolution hardware-accelerated preview (JPG, PNG, GIF, WebP, SVG, AVIF, BMP, ICO).
- 🎬 **Video & Audio**: Built-in video player and audio visualizer with inline controls and waveform playback (MP4, WebM, MOV, MKV, MP3, WAV, FLAC, M4A, OGG).
- 📄 **PDF Documents**: Native Chromium PDF document viewer with external reader launch support.
- 📦 **ZIP & Archive Catalog Inspector**:
  - Live inspection of internal archive entries with folder trees and individual file byte sizes.
  - Quick stat badges for total files, directories, and uncompressed byte size.
  - In-card instant search through archive contents.
  - Supports `.zip`, `.rar`, `.7z`, `.tar`, `.gz`, `.bz2`, `.iso`.
- 📊 **CSV & TSV Spreadsheet Table Grid**:
  - Automatically parses `.csv` and `.tsv` files into an interactive spreadsheet grid with row indices and sticky headers.
  - Toggle between **Table Grid** and **Raw Text**.
- ✨ **Rendered Markdown Viewer**:
  - Automatically parses `.md` and `.mdx` files with typography, headings (`#`, `##`), bullet lists, code blocks, and formatted text.
  - Toggle between **Preview MD** and **Raw Markdown**.
- 💻 **Syntax Highlighted Code & Logs**:
  - Monospaced line numbers, line and character counters, language badge, and a one-click **Copy Snippet** button.
  - Supports JS, TS, Python, HTML, CSS, JSON (pretty-printed), YAML, SQL, C/C++, Rust, Go, Shell, Logs, and text.

### 🛡️ Physical Disk Undo & Safe Recycle Bin Staging
- **Instant Physical Undo (`Ctrl+Z` / `Z`)**: Files are staged in a drive-local buffer. Undoing instantly moves the file physically back to its exact folder and file path on disk in milliseconds.
- **Cross-Device EXDEV Protection**: Automatically handles multi-drive partitions (e.g. `C:`, `Y:`, external SSDs, USB drives) and network shares with atomic renames and fallback safety.
- **Flushed to OS Recycle Bin**: When quitting the app or completing a review session, all remaining staged files are safely sent to the native OS Recycle Bin (`shell.trashItem()`).

### ⚡ High-Performance Scanning Engine
- Asynchronous non-blocking directory scanner optimized to traverse **100,000+ files (340+ GB)** in seconds.
- Filter by file category (Images, Videos, Audio, Code, Docs, Archives).
- Filter by minimum file size (`> 10MB`, `> 100MB`, etc.).
- Sort by Largest first, Oldest first, Newest first, or Default.
- Configurable recursion depth and hidden files toggle.

### 🔊 Procedural Web Audio FX & Celebrations
- Synthesized Web Audio API sound effects for Keep, Delete, Skip, Undo, and Victory (toggleable with `M`).
- Session completion victory screen with confetti, space reclaimed metrics, and session summaries.

---

## ⌨️ Keyboard Shortcuts

| Shortcut | Action | Description |
|---|---|---|
| `→` or `D` | **Keep** | Keep file on disk, advance queue |
| `←` or `A` | **Delete** | Move file to safe deletion staging |
| `↓` or `S` or `Space` | **Skip** | Send file to the end of the queue |
| `Ctrl + Z` or `Z` | **Undo** | Physically restore file back onto disk |
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
- **Archive Engine**: JSZip
- **Iconography**: Lucide React
- **Celebrations**: Canvas Confetti
- **Audio Engine**: Web Audio API Synthesizers
- **Build Tooling**: Vite 6, `vite-plugin-electron`

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
