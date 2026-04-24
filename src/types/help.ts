export type HelpGuideInteractionProps<TGuideId extends string> = {
  activeGuideId: TGuideId | null
  onActivateGuide: (guideId: TGuideId) => void
  onClearGuide: () => void
}

export type HelpGuideItem<TGuideId extends string> = {
  id: TGuideId
  title: string
  description: string
}
