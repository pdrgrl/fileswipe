import { useState } from 'react'
import { X, Check, ArrowUpDown, Filter, Layers, Eye } from 'lucide-react'
import type { ScanFilterOptions, FileCategory, SortOption } from '../types'

interface FilterModalProps {
  isOpen: boolean
  onClose: () => void
  currentOptions: ScanFilterOptions
  onApply: (options: ScanFilterOptions) => void
}

const ALL_CATEGORIES: { id: FileCategory; label: string }[] = [
  { id: 'image', label: 'Images' },
  { id: 'video', label: 'Videos' },
  { id: 'audio', label: 'Audio' },
  { id: 'code', label: 'Code & Dev' },
  { id: 'document', label: 'Documents' },
  { id: 'archive', label: 'Archives' },
  { id: 'other', label: 'Other' },
]

const SIZE_PRESETS = [
  { label: 'Any Size', bytes: 0 },
  { label: '> 1 MB', bytes: 1024 * 1024 },
  { label: '> 10 MB', bytes: 10 * 1024 * 1024 },
  { label: '> 50 MB', bytes: 50 * 1024 * 1024 },
  { label: '> 100 MB', bytes: 100 * 1024 * 1024 },
  { label: '> 500 MB', bytes: 500 * 1024 * 1024 },
]

const SORT_OPTIONS: { id: SortOption; label: string }[] = [
  { id: 'default', label: 'Folder Default' },
  { id: 'size-desc', label: 'Largest Files First' },
  { id: 'size-asc', label: 'Smallest Files First' },
  { id: 'date-desc', label: 'Newest First' },
  { id: 'date-asc', label: 'Oldest First' },
  { id: 'name-asc', label: 'Name (A to Z)' },
  { id: 'random', label: 'Shuffle / Random' },
]

export function FilterModal({
  isOpen,
  onClose,
  currentOptions,
  onApply
}: FilterModalProps) {
  const [options, setOptions] = useState<ScanFilterOptions>(currentOptions)

  if (!isOpen) return null

  const toggleCategory = (cat: FileCategory) => {
    setOptions(prev => {
      const exists = prev.categories.includes(cat)
      const newCats = exists
        ? prev.categories.filter(c => c !== cat)
        : [...prev.categories, cat]
      return { ...prev, categories: newCats }
    })
  }

  const selectAllCategories = () => {
    setOptions(prev => ({
      ...prev,
      categories: ALL_CATEGORIES.map(c => c.id)
    }))
  }

  const handleSave = () => {
    onApply(options)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in select-none">
      <div className="w-full max-w-lg themed-panel rounded-2xl p-6 shadow-2xl flex flex-col gap-6 text-[var(--text-main)] max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[var(--border-app)] pb-4">
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-sky-400" />
            <h2 className="text-base font-bold text-[var(--text-main)]">Scan Filters & Sort</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg themed-button"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Sort Order */}
        <div className="flex flex-col gap-2.5">
          <label className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider flex items-center gap-1.5">
            <ArrowUpDown className="w-3.5 h-3.5 text-sky-400" />
            Sort Queue By
          </label>
          <div className="grid grid-cols-2 gap-2">
            {SORT_OPTIONS.map(sort => (
              <button
                key={sort.id}
                onClick={() => setOptions({ ...options, sortBy: sort.id })}
                className={`px-3 py-2 rounded-xl text-xs font-medium border text-left transition-all flex items-center justify-between ${
                  options.sortBy === sort.id
                    ? 'bg-sky-500/15 border-sky-500 text-sky-400 shadow-sm'
                    : 'bg-[var(--button-bg)] border-[var(--border-app)] text-[var(--text-muted)] hover:text-[var(--text-main)]'
                }`}
              >
                <span>{sort.label}</span>
                {options.sortBy === sort.id && <Check className="w-3.5 h-3.5 text-sky-400" />}
              </button>
            ))}
          </div>
        </div>

        {/* Categories */}
        <div className="flex flex-col gap-2.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-emerald-400" />
              File Types Included
            </label>
            <button
              onClick={selectAllCategories}
              className="text-[11px] text-sky-400 hover:underline"
            >
              Select All
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {ALL_CATEGORIES.map(cat => {
              const isSelected = options.categories.includes(cat.id)
              return (
                <button
                  key={cat.id}
                  onClick={() => toggleCategory(cat.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-emerald-500/15 border-emerald-500 text-emerald-400'
                      : 'bg-[var(--button-bg)] border-[var(--border-app)] text-[var(--text-muted)] hover:text-[var(--text-main)]'
                  }`}
                >
                  {isSelected && <Check className="w-3 h-3 text-emerald-400" />}
                  <span>{cat.label}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Minimum Size Presets */}
        <div className="flex flex-col gap-2.5">
          <label className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">
            Minimum File Size
          </label>
          <div className="grid grid-cols-3 gap-2">
            {SIZE_PRESETS.map(preset => (
              <button
                key={preset.bytes}
                onClick={() => setOptions({ ...options, minSizeBytes: preset.bytes })}
                className={`px-3 py-2 rounded-xl text-xs font-medium border text-center transition-all ${
                  options.minSizeBytes === preset.bytes
                    ? 'bg-amber-500/15 border-amber-500 text-amber-400'
                    : 'bg-[var(--button-bg)] border-[var(--border-app)] text-[var(--text-muted)] hover:text-[var(--text-main)]'
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>

        {/* Scan Depth & Hidden Files Toggles */}
        <div className="flex flex-col gap-3 pt-2 border-t border-[var(--border-app)]">
          <label className="flex items-center justify-between p-3 rounded-xl bg-[var(--button-bg)] border border-[var(--border-app)] cursor-pointer">
            <div className="flex flex-col">
              <span className="text-xs font-semibold text-[var(--text-main)]">Include Subdirectories</span>
              <span className="text-[11px] text-[var(--text-muted)]">Scan folders recursively</span>
            </div>
            <input
              type="checkbox"
              checked={options.recursive}
              onChange={e => setOptions({ ...options, recursive: e.target.checked })}
              className="w-4 h-4 rounded text-sky-600 focus:ring-0 accent-sky-500"
            />
          </label>

          <label className="flex items-center justify-between p-3 rounded-xl bg-[var(--button-bg)] border border-[var(--border-app)] cursor-pointer">
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-[var(--text-subtle)]" />
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-[var(--text-main)]">Include Hidden Files</span>
                <span className="text-[11px] text-[var(--text-muted)]">Files starting with a dot (.)</span>
              </div>
            </div>
            <input
              type="checkbox"
              checked={options.includeHidden}
              onChange={e => setOptions({ ...options, includeHidden: e.target.checked })}
              className="w-4 h-4 rounded text-sky-600 focus:ring-0 accent-sky-500"
            />
          </label>
        </div>

        {/* Action Footer */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-[var(--border-app)]">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-medium text-[var(--text-muted)] hover:text-[var(--text-main)]"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold shadow-lg shadow-sky-500/25 transition-all active:scale-95"
          >
            Apply & Re-scan
          </button>
        </div>
      </div>
    </div>
  )
}
