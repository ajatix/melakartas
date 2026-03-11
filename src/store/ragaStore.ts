import { create } from 'zustand'
import { getRagaByCoords, getRagaByIndex } from '@/data/melakarta'
import type { MelakartaRaga } from '@/data/types'

export interface RagaState {
  rg: number
  m: number
  dn: number
  currentRaga: MelakartaRaga
  setRagaByCoords: (rg: number, m: number, dn: number) => void
  setRagaByIndex: (index: number) => void
  prevRaga: () => void
  nextRaga: () => void
  randomRaga: () => void
}

function clampRg(rg: number) {
  return Math.max(0, Math.min(5, rg))
}
function clampM(m: number) {
  return Math.max(0, Math.min(1, m))
}
function clampDn(dn: number) {
  return Math.max(0, Math.min(5, dn))
}

export const useRagaStore = create<RagaState>((set) => {
  const getRaga = (rg: number, m: number, dn: number) =>
    getRagaByCoords(clampRg(rg), clampM(m), clampDn(dn))

  return {
    rg: 0,
    m: 0,
    dn: 0,
    currentRaga: getRagaByIndex(1),
    setRagaByCoords: (rg, m, dn) =>
      set((state) => {
        const newRg = clampRg(rg)
        const newM = clampM(m)
        const newDn = clampDn(dn)
        return {
          rg: newRg,
          m: newM,
          dn: newDn,
          currentRaga: getRaga(newRg, newM, newDn),
        }
      }),
    setRagaByIndex: (index) =>
      set(() => {
        const raga = getRagaByIndex(index)
        return {
          rg: raga.rg,
          m: raga.m,
          dn: raga.dn,
          currentRaga: raga,
        }
      }),
    prevRaga: () =>
      set((state) => {
        const nextIndex = state.currentRaga.index === 1 ? 72 : state.currentRaga.index - 1
        const raga = getRagaByIndex(nextIndex)
        return {
          rg: raga.rg,
          m: raga.m,
          dn: raga.dn,
          currentRaga: raga,
        }
      }),
    nextRaga: () =>
      set((state) => {
        const nextIndex = state.currentRaga.index === 72 ? 1 : state.currentRaga.index + 1
        const raga = getRagaByIndex(nextIndex)
        return {
          rg: raga.rg,
          m: raga.m,
          dn: raga.dn,
          currentRaga: raga,
        }
      }),
    randomRaga: () =>
      set(() => {
        const index = Math.floor(Math.random() * 72) + 1
        const raga = getRagaByIndex(index)
        return {
          rg: raga.rg,
          m: raga.m,
          dn: raga.dn,
          currentRaga: raga,
        }
      }),
  }
})
