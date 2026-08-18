import path from 'node:path'
import type { FileCategory } from '../../src/types'

const EXTENSION_CATEGORIES: Record<string, FileCategory> = {
  // Images
  jpg: 'image', jpeg: 'image', png: 'image', gif: 'image', webp: 'image',
  svg: 'image', avif: 'image', bmp: 'image', ico: 'image', tiff: 'image',
  heic: 'image', psd: 'image', raw: 'image',

  // Videos
  mp4: 'video', mkv: 'video', mov: 'video', webm: 'video', avi: 'video',
  flv: 'video', wmv: 'video', m4v: 'video', '3gp': 'video',

  // Audio
  mp3: 'audio', wav: 'audio', ogg: 'audio', flac: 'audio', m4a: 'audio',
  aac: 'audio', wma: 'audio', opus: 'audio', aiff: 'audio',

  // Documents
  pdf: 'document', doc: 'document', docx: 'document', xls: 'document',
  xlsx: 'document', ppt: 'document', pptx: 'document', txt: 'document',
  rtf: 'document', odt: 'document', ods: 'document', odp: 'document',
  csv: 'document', tsv: 'document', epub: 'document',

  // Code & Markup
  js: 'code', jsx: 'code', ts: 'code', tsx: 'code', py: 'code',
  java: 'code', c: 'code', cpp: 'code', cs: 'code', h: 'code', hpp: 'code',
  rs: 'code', go: 'code', rb: 'code', php: 'code', html: 'code', htm: 'code',
  css: 'code', scss: 'code', sass: 'code', less: 'code', json: 'code',
  json5: 'code', xml: 'code', yaml: 'code', yml: 'code', toml: 'code',
  md: 'code', mdx: 'code', sh: 'code', bash: 'code', zsh: 'code', ps1: 'code',
  bat: 'code', cmd: 'code', sql: 'code', graphql: 'code', lua: 'code',
  swift: 'code', kt: 'code', kts: 'code', vue: 'code', svelte: 'code',

  // Archives
  zip: 'archive', rar: 'archive', '7z': 'archive', tar: 'archive',
  gz: 'archive', bz2: 'archive', xz: 'archive', iso: 'archive', dmg: 'archive'
}

const MIME_MAP: Record<string, string> = {
  jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png', gif: 'image/gif',
  webp: 'image/webp', svg: 'image/svg+xml', avif: 'image/avif', bmp: 'image/bmp',
  ico: 'image/x-icon', mp4: 'video/mp4', webm: 'video/webm', mkv: 'video/x-matroska',
  mov: 'video/quicktime', mp3: 'audio/mpeg', wav: 'audio/wav', ogg: 'audio/ogg',
  flac: 'audio/flac', m4a: 'audio/mp4', pdf: 'application/pdf', json: 'application/json',
  txt: 'text/plain', md: 'text/markdown', html: 'text/html', css: 'text/css',
  js: 'text/javascript', ts: 'text/typescript'
}

export function classifyFile(filePath: string): { category: FileCategory; extension: string; mimeType: string } {
  const ext = path.extname(filePath).toLowerCase().replace(/^\./, '')
  const category = EXTENSION_CATEGORIES[ext] || 'other'
  const mimeType = MIME_MAP[ext] || 'application/octet-stream'

  return { category, extension: ext, mimeType }
}
