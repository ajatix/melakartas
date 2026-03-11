import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Instrument } from '@/data/types'

const SETTINGS_KEY = 'melakartaSettings'

export interface SettingsState {
  bpm: number
  reverb: number
  rootNote: number
  instrument: Instrument
  setBpm: (bpm: number) => void
  setReverb: (reverb: number) => void
  setRootNote: (rootNote: number) => void
  setInstrument: (instrument: Instrument) => void
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      bpm: 80,
      reverb: 0,
      rootNote: 0,
      instrument: 'piano',
      setBpm: (bpm) => set({ bpm: Math.max(40, Math.min(240, bpm)) }),
      setReverb: (reverb) => set({ reverb: Math.max(0, Math.min(100, reverb)) }),
      setRootNote: (rootNote) => set({ rootNote: Math.max(0, Math.min(11, rootNote)) }),
      setInstrument: (instrument) => set({ instrument }),
    }),
    { name: SETTINGS_KEY }
  )
)
