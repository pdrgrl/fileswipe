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
      // Basic CSV parser handling quoted strings
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
    <div className="w-full h-full flex flex-col bg-[#0d1117] text-slate-300 font-mono text-xs overflow-hidden select-none">
      {/* Top Header Bar */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-[#161b22] border-b border-border/40 text-[11px] text-slate-400 shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          {file.category === 'code' ? (
            <Code2 className="w-4 h-4 text-blue-400 shrink-0" />
          ) : (
            <FileText className="w-4 h-4 text-emerald-400 shrink-0" />
          )}
          <span className="font-bold text-slate-100 truncate">{file.name}</span>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {/* Markdown Toggle */}
          {isMarkdown && (
            <button
              onClick={() => setViewMode(viewMode === 'rendered' ? 'default' : 'rendered')}
              className={`px-2 py-0.5 rounded-md text-[10px] font-semibold border transition-all flex items-center gap-1 ${
                viewMode === 'rendered'
                  ? 'bg-blue-600/30 border-blue-500 text-blue-300'
                  : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
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
                  ? 'bg-emerald-600/30 border-emerald-500 text-emerald-300'
                  : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
              }`}
            >
              <Table className="w-3 h-3 text-emerald-400" />
              <span>{viewMode === 'table' ? 'Raw Text' : 'Table Grid'}</span>
            </button>
          )}

          {/* Copy Snippet Button */}
          <button
            onClick={handleCopy}
            className="p-1 rounded-md glass-button text-slate-400 hover:text-white flex items-center gap-1"
            title="Copy text snippet"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>

          <span className="uppercase font-bold px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-[10px] text-slate-300">
            {file.extension}
          </span>
        </div>
      </div>

      {/* Content Stage */}
      <div className="flex-1 overflow-auto p-4 select-text leading-relaxed">
        {isLoading ? (
          <div className="flex items-center justify-center h-full text-slate-500 font-sans">
            Loading preview...
          </div>
        ) : viewMode === 'rendered' && isMarkdown ? (
          /* Rendered Markdown Mode */
          <div className="font-sans text-slate-200 prose prose-invert max-w-none text-xs space-y-3 p-2">
            {content.split('\n\n').map((block, i) => {
              const trimmed = block.trim()
              if (trimmed.startsWith('# ')) {
                return <h1 key={i} className="text-base font-black text-white border-b border-white/10 pb-1">{trimmed.substring(2)}</h1>
              }
              if (trimmed.startsWith('## ')) {
                return <h2 key={i} className="text-sm font-bold text-slate-100 mt-2">{trimmed.substring(3)}</h2>
              }
              if (trimmed.startsWith('### ')) {
                return <h3 key={i} className="text-xs font-bold text-slate-200 mt-1">{trimmed.substring(4)}</h3>
              }
              if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
                return (
                  <ul key={i} className="list-disc list-inside space-y-1 text-slate-300">
                    {trimmed.split('\n').map((li, idx) => (
                      <li key={idx}>{li.replace(/^[-*]\s+/, '')}</li>
                    ))}
                  </ul>
                )
              }
              if (trimmed.startsWith('```')) {
                return (
                  <pre key={i} className="p-3 rounded-xl bg-black/50 border border-white/10 text-[11px] font-mono text-slate-300 overflow-x-auto">
                    {trimmed.replace(/^```[a-z]*\n/, '').replace(/\n```$/, '')}
                  </pre>
                )
              }
              return <p key={i} className="text-slate-300 leading-normal">{trimmed}</p>
            })}
          </div>
        ) : viewMode === 'table' && isCsv && csvData ? (
          /* CSV Spreadsheet Table Mode */
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-[11px] font-mono text-slate-300">
              <thead>
                {csvData.length > 0 && (
                  <tr className="bg-surface-elevated border-b border-white/15 text-left">
                    <th className="px-3 py-2 text-slate-500 font-bold border-r border-white/10 w-8">#</th>
                    {csvData[0].map((header, hIdx) => (
                      <th key={hIdx} className="px-3 py-2 text-slate-200 font-bold border-r border-white/10 truncate max-w-xs">
                        {header}
                      </th>
                    ))}
                  </tr>
                )}
              </thead>
              <tbody>
                {csvData.slice(1, 100).map((row, rIdx) => (
                  <tr key={rIdx} className="border-b border-white/5 hover:bg-white/[0.03]">
                    <td className="px-3 py-1.5 text-slate-600 select-none border-r border-white/10">{rIdx + 1}</td>
                    {row.map((cell, cIdx) => (
                      <td key={cIdx} className="px-3 py-1.5 border-r border-white/10 truncate max-w-xs text-slate-300">
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
                <tr key={idx} className="hover:bg-white/[0.03]">
                  <td className="pr-4 py-0.5 text-right text-slate-600 select-none w-10 align-top">
                    {idx + 1}
                  </td>
                  <td className="py-0.5 text-slate-300 whitespace-pre font-mono">
                    {line || ' '}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Footer Meta */}
      <div className="px-4 py-1.5 bg-[#161b22] border-t border-border/30 text-[10px] text-slate-500 flex items-center justify-between shrink-0">
        <span>{lines.length} lines</span>
        <span>{content.length} characters</span>
      </div>
    </div>
  )
}
