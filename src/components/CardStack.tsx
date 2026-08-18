import { useState } from 'react'
import { motion, useMotionValue, useTransform, AnimatePresence } from 'framer-motion'
import { Check, Trash2, Clock } from 'lucide-react'
import type { FileItem } from '../types'
import { SwipeCard } from './SwipeCard'

interface CardStackProps {
  activeFile: FileItem | null
  nextFile: FileItem | null
  thirdFile: FileItem | null
  onKeep: (file: FileItem) => void
  onDelete: (file: FileItem) => void
  onSkip: (file: FileItem) => void
  onReveal?: (filePath: string) => void
}

export function CardStack({
  activeFile,
  nextFile,
  thirdFile,
  onKeep,
  onDelete,
  onSkip,
  onReveal
}: CardStackProps) {
  const [exitDirection, setExitDirection] = useState<'left' | 'right' | 'down' | null>(null)

  // Motion values for drag physics
  const x = useMotionValue(0)
  const y = useMotionValue(0)

  // Dynamic transforms based on drag
  const rotate = useTransform(x, [-300, 0, 300], [-18, 0, 18])
  const keepOpacity = useTransform(x, [20, 120], [0, 1])
  const deleteOpacity = useTransform(x, [-20, -120], [0, 1])
  const skipOpacity = useTransform(y, [20, 100], [0, 1])

  const handleDragEnd = (_: unknown, info: { offset: { x: number; y: number }; velocity: { x: number; y: number } }) => {
    const { offset, velocity } = info
    const swipeThreshold = 100
    const velocityThreshold = 350

    if (offset.x > swipeThreshold || velocity.x > velocityThreshold) {
      setExitDirection('right')
      if (activeFile) onKeep(activeFile)
    } else if (offset.x < -swipeThreshold || velocity.x < -velocityThreshold) {
      setExitDirection('left')
      if (activeFile) onDelete(activeFile)
    } else if (offset.y > swipeThreshold || velocity.y > velocityThreshold) {
      setExitDirection('down')
      if (activeFile) onSkip(activeFile)
    }
  }

  return (
    <div className="relative w-full max-w-[500px] h-[580px] mx-auto flex items-center justify-center">
      {/* 3rd Card in Stack (deepest background) */}
      {thirdFile && (
        <div
          className="absolute inset-0 transition-all duration-300 pointer-events-none"
          style={{
            transform: 'translateY(28px) scale(0.90)',
            opacity: 0.4,
            filter: 'blur(1px)',
            zIndex: 10
          }}
        >
          <SwipeCard file={thirdFile} isFront={false} />
        </div>
      )}

      {/* 2nd Card in Stack (middle background) */}
      {nextFile && (
        <div
          className="absolute inset-0 transition-all duration-300 pointer-events-none"
          style={{
            transform: 'translateY(14px) scale(0.95)',
            opacity: 0.75,
            zIndex: 20
          }}
        >
          <SwipeCard file={nextFile} isFront={false} />
        </div>
      )}

      {/* Top Active Interactive Card */}
      <AnimatePresence mode="popLayout">
        {activeFile && (
          <motion.div
            key={activeFile.id}
            style={{
              x,
              y,
              rotate,
              zIndex: 30
            }}
            drag
            dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
            dragElastic={0.8}
            onDragEnd={handleDragEnd}
            initial={{ scale: 0.95, opacity: 0, y: 15 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{
              x: exitDirection === 'left' ? -600 : exitDirection === 'right' ? 600 : 0,
              y: exitDirection === 'down' ? 500 : 0,
              opacity: 0,
              rotate: exitDirection === 'left' ? -25 : exitDirection === 'right' ? 25 : 0,
              transition: { duration: 0.22, ease: 'easeOut' }
            }}
            className="absolute inset-0 cursor-grab active:cursor-grabbing touch-none"
          >
            {/* Dynamic Stamp Badges */}
            {/* KEEP STAMP */}
            <motion.div
              style={{ opacity: keepOpacity }}
              className="stamp-badge absolute top-8 left-8 border-emerald-500 text-emerald-400 bg-emerald-950/80 -rotate-12 flex items-center gap-2"
            >
              <Check className="w-6 h-6 stroke-[3]" />
              <span>KEEP</span>
            </motion.div>

            {/* DELETE STAMP */}
            <motion.div
              style={{ opacity: deleteOpacity }}
              className="stamp-badge absolute top-8 right-8 border-rose-500 text-rose-400 bg-rose-950/80 rotate-12 flex items-center gap-2"
            >
              <Trash2 className="w-6 h-6 stroke-[3]" />
              <span>DELETE</span>
            </motion.div>

            {/* SKIP STAMP */}
            <motion.div
              style={{ opacity: skipOpacity }}
              className="stamp-badge absolute bottom-28 inset-x-0 mx-auto w-fit border-amber-500 text-amber-400 bg-amber-950/80 flex items-center gap-2"
            >
              <Clock className="w-6 h-6 stroke-[3]" />
              <span>SKIP</span>
            </motion.div>

            <SwipeCard
              file={activeFile}
              isFront={true}
              onReveal={onReveal}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
