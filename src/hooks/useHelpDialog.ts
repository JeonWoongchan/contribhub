'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'

type UseHelpDialogState<TGuideId extends string> = {
  isOpen: boolean
  activeGuideId: TGuideId | null
  demoUpdatedAt: string
  openDialog: () => void
  closeDialog: () => void
  activateGuide: (guideId: TGuideId) => void
  clearActiveGuide: () => void
}

export function useHelpDialog<TGuideId extends string>(
  demoUpdatedOffsetMs: number
): UseHelpDialogState<TGuideId> {
  const [isOpen, setIsOpen] = useState(false)
  const [activeGuideId, setActiveGuideId] = useState<TGuideId | null>(null)
  const demoUpdatedAt = useMemo(
    () => new Date(Date.now() - demoUpdatedOffsetMs).toISOString(),
    [demoUpdatedOffsetMs]
  )

  const openDialog = useCallback(() => {
    setIsOpen(true)
  }, [])

  const closeDialog = useCallback(() => {
    setIsOpen(false)
    setActiveGuideId(null)
  }, [])

  const activateGuide = useCallback((guideId: TGuideId) => {
    setActiveGuideId(guideId)
  }, [])

  const clearActiveGuide = useCallback(() => {
    setActiveGuideId(null)
  }, [])

  useEffect(() => {
    if (!isOpen) {
      return
    }

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        closeDialog()
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [closeDialog, isOpen])

  return {
    isOpen,
    activeGuideId,
    demoUpdatedAt,
    openDialog,
    closeDialog,
    activateGuide,
    clearActiveGuide,
  }
}
