'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'

const HELP_DIALOG_LOCK_ATTRIBUTE = 'data-help-dialog-locked'
const HELP_DIALOG_SCROLL_BAR_SIZE_VARIABLE = '--help-scroll-bar-size'

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

    const scrollBarWidth = Math.max(
      0,
      window.innerWidth - document.documentElement.clientWidth
    )
    const previousOverflow = document.body.style.overflow
    const previousPaddingRight = document.body.style.paddingRight
    const previousScrollBarSize = document.body.style.getPropertyValue(
      HELP_DIALOG_SCROLL_BAR_SIZE_VARIABLE
    )
    const previousLockAttribute = document.body.getAttribute(HELP_DIALOG_LOCK_ATTRIBUTE)

    document.body.style.overflow = 'hidden'
    if (scrollBarWidth > 0) {
      document.body.style.paddingRight = `${scrollBarWidth}px`
    }
    document.body.style.setProperty(HELP_DIALOG_SCROLL_BAR_SIZE_VARIABLE, `${scrollBarWidth}px`)
    document.body.setAttribute(HELP_DIALOG_LOCK_ATTRIBUTE, 'true')

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        closeDialog()
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => {
      document.body.style.overflow = previousOverflow
      document.body.style.paddingRight = previousPaddingRight
      if (previousScrollBarSize) {
        document.body.style.setProperty(
          HELP_DIALOG_SCROLL_BAR_SIZE_VARIABLE,
          previousScrollBarSize
        )
      } else {
        document.body.style.removeProperty(HELP_DIALOG_SCROLL_BAR_SIZE_VARIABLE)
      }
      if (previousLockAttribute === null) {
        document.body.removeAttribute(HELP_DIALOG_LOCK_ATTRIBUTE)
      } else {
        document.body.setAttribute(HELP_DIALOG_LOCK_ATTRIBUTE, previousLockAttribute)
      }
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
