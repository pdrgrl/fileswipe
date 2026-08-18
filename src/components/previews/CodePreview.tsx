import { useState, useEffect } from 'react'
import { Code2, FileText } from 'lucide-react'
import type { FileItem } from '../../types'

interface CodePreviewProps {
  file: FileItem
}

export function CodePreview({ file }: CodePreviewProps) {
  const [content, setContent] = useState<string>(file.textSnippet || '')
  const [isLoading, setIsLoading] = useState(!file.textSnippet)

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
          setContent(snippet || '// File is empty or cannot be previewed')
          setIsLoading(false)
        }
      }).catch(() => {
        if (isMounted) {
          setContent('// Error reading file preview')
          setIsLoading(false)
        }
      })
    } else {
      setContent('// Code preview')
      setIsLoading(false)
    }

    return () => {
      isMounted = false
    }
  }, [file])

  const lines = (content || '// Empty').split('\n')

  return (
    <div className="w-full h-full flex flex-col bg-[#0d1117] text-slate-300 font-mono text-xs overflow-hidden border-t border-b border-border/50">
      {/* Top Header of Code Block */}
      <div className="flex items-center justify-between px-4 py-2 bg-[#161b22] border-b border-border/40 text-[11px] text-slate-400 shrink-0">
        <div className="flex items-center gap-2">
          {file.category === 'code' ? <Code2 className="w-3.5 h-3.5 text-blue-400" /> : <FileText className="w-3.5 h-3.5 text-emerald-400" />}
          <span className="font-semibold text-slate-200">{file.name}</span>
        </div>
        <div className="flex items-center gap-3 text-slate-500">
          <span>{isLoading ? 'Loading...' : `${lines.length} lines`}</span>
          <span className="uppercase font-semibold text-slate-400">{file.extension}</span>
        </div>
      </div>

      {/* Code Body with Line Numbers */}
      <div className="flex-1 overflow-auto p-4 select-text leading-relaxed">
        {isLoading ? (
          <div className="flex items-center justify-center h-full text-slate-500">
            Loading preview...
          </div>
        ) : (
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
    </div>
  )
}
