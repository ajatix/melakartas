import { create } from 'zustand'

export interface UIState {
  settingsOpen: boolean
  audioUnlocked: boolean
  setSettingsOpen: (open: boolean) => void
  setAudioUnlocked: (unlocked: boolean) => void
}

export const useUIStore = create<UIState>((set) => ({
  settingsOpen: false,
  audioUnlocked: false,
  setSettingsOpen: (open) => set({ settingsOpen: open }),
  setAudioUnlocked: (unlocked) => set({ audioUnlocked: unlocked }),
}))
