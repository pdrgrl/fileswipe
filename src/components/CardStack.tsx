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

function ActiveCard({
  file,
  onKeep,
  onDelete,
  onSkip,
  onReveal
}: {
  file: FileItem
  onKeep: (file: FileItem) => void
  onDelete: (file: FileItem) => void
  onSkip: (file: FileItem) => void
  onReveal?: (filePath: string) => void
}) {
  const [exitDirection, setExitDirection] = useState<'left' | 'right' | 'down' | null>(null)
  
  // Independent motion values per active card
  const x = useMotionValue(0)
  const y = useMotionValue(0)

  // Dynamic transforms based on local drag
  const rotate = useTransform(x, [-300, 0, 300], [-18, 0, 18])
  const keepOpacity = useTransform(x, [30, 110], [0, 1])
  const deleteOpacity = useTransform(x, [-30, -110], [0, 1])
  const skipOpacity = useTransform(y, [30, 90], [0, 1])

  const handleDragEnd = (_: unknown, info: { offset: { x: number; y: number }; velocity: { x: number; y: number } }) => {
    const { offset, velocity } = info
    const swipeXThreshold = 85
    const swipeYThreshold = 75
    const velocityThreshold = 250

    if (offset.x > swipeXThreshold || velocity.x > velocityThreshold) {
      setExitDirection('right')
      onKeep(file)
    } else if (offset.x < -swipeXThreshold || velocity.x < -velocityThreshold) {
      setExitDirection('left')
      onDelete(file)
    } else if (offset.y > swipeYThreshold || velocity.y > velocityThreshold) {
      setExitDirection('down')
      onSkip(file)
    }
  }

  return (
    <motion.div
      key={file.id}
      style={{
        x,
        y,
        rotate,
        zIndex: 30
      }}
      drag
      dragSnapToOrigin={true}
      dragElastic={0.65}
      onDragEnd={handleDragEnd}
      initial={{ scale: 0.95, opacity: 0, y: 15 }}
      animate={{ scale: 1, opacity: 1, y: 0 }}
      exit={{
        x: exitDirection === 'left' ? -650 : exitDirection === 'right' ? 650 : 0,
        y: exitDirection === 'down' ? 550 : 0,
        opacity: 0,
        rotate: exitDirection === 'left' ? -25 : exitDirection === 'right' ? 25 : 0,
        transition: { duration: 0.22, ease: 'easeOut' }
      }}
      className="absolute inset-0 cursor-grab active:cursor-grabbing touch-none select-none"
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
        file={file}
        isFront={true}
        onReveal={onReveal}
      />
    </motion.div>
  )
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
          <ActiveCard
            key={activeFile.id}
            file={activeFile}
            onKeep={onKeep}
            onDelete={onDelete}
            onSkip={onSkip}
            onReveal={onReveal}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
