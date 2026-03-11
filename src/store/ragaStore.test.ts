import { describe, it, expect, beforeEach } from 'vitest'
import { useRagaStore } from '@/store/ragaStore'

describe('ragaStore', () => {
  beforeEach(() => {
    useRagaStore.getState().setRagaByIndex(1)
  })

  it('setRagaByCoords updates rg, m, dn and currentRaga', () => {
    useRagaStore.getState().setRagaByCoords(2, 1, 3)
    const state = useRagaStore.getState()
    expect(state.rg).toBe(2)
    expect(state.m).toBe(1)
    expect(state.dn).toBe(3)
    expect(state.currentRaga.index).toBe(1 * 36 + 2 * 6 + 3 + 1)
  })

  it('setRagaByIndex updates to correct raga', () => {
    useRagaStore.getState().setRagaByIndex(29)
    const state = useRagaStore.getState()
    expect(state.currentRaga.index).toBe(29)
    expect(state.currentRaga.name).toBe('Dheerasankarabharanam')
  })

  it('prevRaga wraps from 1 to 72', () => {
    useRagaStore.getState().setRagaByIndex(1)
    useRagaStore.getState().prevRaga()
    expect(useRagaStore.getState().currentRaga.index).toBe(72)
  })

  it('nextRaga wraps from 72 to 1', () => {
    useRagaStore.getState().setRagaByIndex(72)
    useRagaStore.getState().nextRaga()
    expect(useRagaStore.getState().currentRaga.index).toBe(1)
  })

  it('randomRaga sets a raga with index 1-72', () => {
    useRagaStore.getState().randomRaga()
    const index = useRagaStore.getState().currentRaga.index
    expect(index).toBeGreaterThanOrEqual(1)
    expect(index).toBeLessThanOrEqual(72)
  })
})
