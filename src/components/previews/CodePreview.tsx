import { useState, useEffect, useMemo } from 'react'
import { Code2, FileText, Copy, Check, Table, Sparkles } from 'lucide-react'
import type { FileItem } from '../../types'

interface CodePreviewProps {
  file: FileItem
}

export function CodePreview({ file }: CodePreviewProps) {
  const [content, setContent] = useState<string>(file.textSnippet || '')
  const [isLoading, setIsLoading] = useState(!file.textSnippet)
  const [copied, setCopied] = useState(false)
  const [viewMode, setViewMode] = useState<'default' | 'rendered' | 'table'>('default')

  const ext = file.extension.toLowerCase()
  const isMarkdown = ext === 'md' || ext === 'mdx'
  const isCsv = ext === 'csv' || ext === 'tsv'
  const isJson = ext === 'json' || ext === 'json5'

  useEffect(() => {
    let isMounted = true
    if (file.textSnippet) {
      setContent(file.textSnippet)
      setIsLoading(false)
      return
    }

    if (window.api && typeof window.api.readTextSnippet === 'function') {
      setIsLoading(true)
      window.api.readTextSnippet(file.path).then((snippet) => {
        if (isMounted) {
          setContent(snippet || '')
          setIsLoading(false)
        }
      }).catch(() => {
        if (isMounted) {
          setContent('// Error reading file preview')
          setIsLoading(false)
        }
      })
    } else {
      setIsLoading(false)
    }

    return () => {
      isMounted = false
    }
  }, [file])

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (content) {
      navigator.clipboard.writeText(content)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  // Parse CSV into rows and columns
  const csvData = useMemo(() => {
    if (!isCsv || !content) return null
    const delimiter = ext === 'tsv' ? '\t' : ','
    const lines = content.split('\n').filter(l => l.trim().length > 0)
    return lines.map(line => {
      const row: string[] = []
      let inQuotes = false
      let current = ''
      for (let i = 0; i < line.length; i++) {
        const char = line[i]
        if (char === '"') {
          inQuotes = !inQuotes
        } else if (char === delimiter && !inQuotes) {
          row.push(current.trim())
          current = ''
        } else {
          current += char
        }
      }
      row.push(current.trim())
      return row
    })
  }, [content, isCsv, ext])

  // Pretty print JSON
  const formattedJson = useMemo(() => {
    if (!isJson || !content) return null
    try {
      const parsed = JSON.parse(content)
      return JSON.stringify(parsed, null, 2)
    } catch {
      return content
    }
  }, [content, isJson])

  const displayContent = formattedJson || content || '// File is empty'
  const lines = displayContent.split('\n')

  return (
    <div className="w-full h-full flex flex-col bg-[var(--bg-card)] text-[var(--text-main)] font-mono text-xs overflow-hidden select-none">
      {/* Top Header Toolbar */}
      <div className="flex items-center justify-between px-3.5 py-1.5 bg-[var(--bg-surface)] border-b border-[var(--border-app)] text-[11px] text-[var(--text-muted)] shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          {file.category === 'code' ? (
            <Code2 className="w-3.5 h-3.5 text-sky-400 shrink-0" />
          ) : (
            <FileText className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          )}
          <span className="font-bold uppercase tracking-wider text-[10px] text-[var(--text-muted)]">
            {isMarkdown ? 'Markdown Preview' : isCsv ? `Spreadsheet (${csvData?.length || 0} rows)` : isJson ? 'JSON Data' : file.extension ? `${file.extension.toUpperCase()} Source` : 'Plain Text'}
          </span>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {/* Markdown Toggle */}
          {isMarkdown && (
            <button
              onClick={() => setViewMode(viewMode === 'rendered' ? 'default' : 'rendered')}
              className={`px-2 py-0.5 rounded-md text-[10px] font-semibold border transition-all flex items-center gap-1 ${
                viewMode === 'rendered'
                  ? 'bg-sky-500/20 border-sky-500 text-sky-400'
                  : 'themed-button'
              }`}
            >
              <Sparkles className="w-3 h-3 text-amber-400" />
              <span>{viewMode === 'rendered' ? 'Raw Markdown' : 'Preview MD'}</span>
            </button>
          )}

          {/* CSV Table Toggle */}
          {isCsv && csvData && (
            <button
              onClick={() => setViewMode(viewMode === 'table' ? 'default' : 'table')}
              className={`px-2 py-0.5 rounded-md text-[10px] font-semibold border transition-all flex items-center gap-1 ${
                viewMode === 'table'
                  ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400'
                  : 'themed-button'
              }`}
            >
              <Table className="w-3 h-3 text-emerald-400" />
              <span>{viewMode === 'table' ? 'Raw Text' : 'Table Grid'}</span>
            </button>
          )}

          {/* Copy Snippet Button */}
          <button
            onClick={handleCopy}
            className="p-1 rounded-md themed-button flex items-center gap-1"
            title="Copy text snippet"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>

          <span className="uppercase font-bold px-2 py-0.5 rounded-md bg-[var(--button-bg)] border border-[var(--border-app)] text-[10px] text-[var(--text-muted)]">
            {file.extension}
          </span>
        </div>
      </div>

      {/* Content Stage */}
      <div className="flex-1 overflow-auto p-4 select-text leading-relaxed">
        {isLoading ? (
          <div className="flex items-center justify-center h-full text-[var(--text-subtle)] font-sans">
            Loading preview...
          </div>
        ) : viewMode === 'rendered' && isMarkdown ? (
          /* Rendered Markdown Mode */
          <div className="font-sans text-[var(--text-main)] prose prose-invert max-w-none text-xs space-y-3 p-2">
            {content.split('\n\n').map((block, i) => {
              const trimmed = block.trim()
              if (trimmed.startsWith('# ')) {
                return <h1 key={i} className="text-base font-black border-b border-[var(--border-app)] pb-1">{trimmed.substring(2)}</h1>
              }
              if (trimmed.startsWith('## ')) {
                return <h2 key={i} className="text-sm font-bold mt-2">{trimmed.substring(3)}</h2>
              }
              if (trimmed.startsWith('### ')) {
                return <h3 key={i} className="text-xs font-bold mt-1">{trimmed.substring(4)}</h3>
              }
              if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
                return (
                  <ul key={i} className="list-disc list-inside space-y-1 text-[var(--text-muted)]">
                    {trimmed.split('\n').map((li, idx) => (
                      <li key={idx}>{li.replace(/^[-*]\s+/, '')}</li>
                    ))}
                  </ul>
                )
              }
              if (trimmed.startsWith('```')) {
                return (
                  <pre key={i} className="p-3 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-app)] text-[11px] font-mono text-[var(--text-main)] overflow-x-auto">
                    {trimmed.replace(/^```[a-z]*\n/, '').replace(/\n```$/, '')}
                  </pre>
                )
              }
              return <p key={i} className="text-[var(--text-muted)] leading-normal">{trimmed}</p>
            })}
          </div>
        ) : viewMode === 'table' && isCsv && csvData ? (
          /* CSV Spreadsheet Table Mode */
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-[11px] font-mono text-[var(--text-main)]">
              <thead>
                {csvData.length > 0 && (
                  <tr className="bg-[var(--bg-surface)] border-b border-[var(--border-app)] text-left">
                    <th className="px-3 py-2 text-[var(--text-subtle)] font-bold border-r border-[var(--border-app)] w-8">#</th>
                    {csvData[0].map((header, hIdx) => (
                      <th key={hIdx} className="px-3 py-2 text-[var(--text-main)] font-bold border-r border-[var(--border-app)] truncate max-w-xs">
                        {header}
                      </th>
                    ))}
                  </tr>
                )}
              </thead>
              <tbody>
                {csvData.slice(1, 100).map((row, rIdx) => (
                  <tr key={rIdx} className="border-b border-[var(--border-subtle)] hover:bg-[var(--button-bg)]">
                    <td className="px-3 py-1.5 text-[var(--text-subtle)] select-none border-r border-[var(--border-app)]">{rIdx + 1}</td>
                    {row.map((cell, cIdx) => (
                      <td key={cIdx} className="px-3 py-1.5 border-r border-[var(--border-app)] truncate max-w-xs text-[var(--text-muted)]">
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          /* Code / Plain Text with Line Numbers */
          <table className="w-full border-collapse">
            <tbody>
              {lines.map((line, idx) => (
                <tr key={idx} className="hover:bg-[var(--button-bg)]">
                  <td className="pr-4 py-0.5 text-right text-[var(--text-subtle)] select-none w-10 align-top">
                    {idx + 1}
                  </td>
                  <td className="py-0.5 text-[var(--text-main)] whitespace-pre font-mono">
                    {line || ' '}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Footer Meta */}
      <div className="px-4 py-1.5 bg-[var(--bg-surface)] border-t border-[var(--border-app)] text-[10px] text-[var(--text-subtle)] flex items-center justify-between shrink-0">
        <span>{lines.length} lines</span>
        <span>{content.length} characters</span>
      </div>
    </div>
  )
}
