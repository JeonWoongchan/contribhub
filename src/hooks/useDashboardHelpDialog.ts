'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { DASHBOARD_HELP_DEMO_UPDATED_OFFSET_MS } from '@/constants/dashboard-help'
import type { DashboardHelpGuideId } from '@/constants/dashboard-help'

type UseDashboardHelpDialogState = {
  isOpen: boolean
  activeGuideId: DashboardHelpGuideId | null
  demoUpdatedAt: string
  openDialog: () => void
  closeDialog: () => void
  activateGuide: (guideId: DashboardHelpGuideId) => void
  clearActiveGuide: () => void
}

export function useDashboardHelpDialog(): UseDashboardHelpDialogState {
  const [isOpen, setIsOpen] = useState(false)
  const [activeGuideId, setActiveGuideId] = useState<DashboardHelpGuideId | null>(null)
  const demoUpdatedAt = useMemo(
    () => new Date(Date.now() - DASHBOARD_HELP_DEMO_UPDATED_OFFSET_MS).toISOString(),
    []
  )

  const openDialog = useCallback(() => {
    setIsOpen(true)
  }, [])

  const closeDialog = useCallback(() => {
    setIsOpen(false)
    setActiveGuideId(null)
  }, [])

  const activateGuide = useCallback((guideId: DashboardHelpGuideId) => {
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
