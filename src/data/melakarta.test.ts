import { describe, it, expect, beforeEach } from 'vitest'
import {
  getRagaByIndex,
  getRagaByCoords,
  getKeyIndicesForScale,
  getArohanamAvarohanam,
  getKeyIndicesInOrder,
  getFrequencyForKeyIndex,
  MELAKARTA,
  RG_LABELS,
  DN_LABELS,
  CHAKRA_NAMES,
} from '@/data/melakarta'

describe('melakarta data', () => {
  it('exports 72 ragas', () => {
    expect(MELAKARTA).toHaveLength(72)
  })

  it('getRagaByIndex returns raga by index 1-72', () => {
    expect(getRagaByIndex(1).name).toBe('Kanakangi')
    expect(getRagaByIndex(1).scale).toEqual(['S', 'R1', 'G1', 'M1', 'P', 'D1', 'N1'])
    expect(getRagaByIndex(72).name).toBe('Rasikapriya')
  })

  it('getRagaByCoords maps (rg,m,dn) to raga index', () => {
    const r1 = getRagaByCoords(0, 0, 0)
    expect(r1.index).toBe(1)
    expect(r1.name).toBe('Kanakangi')
    const r72 = getRagaByCoords(5, 1, 5)
    expect(r72.index).toBe(72)
  })

  it('getKeyIndicesForScale returns 7 unique sorted indices', () => {
    const scale = ['S', 'R1', 'G1', 'M1', 'P', 'D1', 'N1'] as const
    const indices = getKeyIndicesForScale(scale)
    expect(indices).toHaveLength(7)
    expect(indices).toEqual([0, 1, 2, 5, 7, 8, 9])
  })

  it('getArohanamAvarohanam returns ascending and descending', () => {
    const scale = ['S', 'R1', 'G1', 'M1', 'P', 'D1', 'N1'] as const
    const { arohanam, avarohanam } = getArohanamAvarohanam(scale)
    expect(arohanam).toEqual(scale)
    expect(avarohanam).toEqual([...scale].reverse())
  })

  it('getKeyIndicesInOrder preserves order', () => {
    const order = ['S', 'R1', 'G1', 'M1', 'P', 'D1', 'N1'] as const
    const indices = getKeyIndicesInOrder(order)
    expect(indices).toEqual([0, 1, 2, 5, 7, 8, 9])
  })

  it('getFrequencyForKeyIndex A4 = 440', () => {
    const a4Index = 9
    expect(getFrequencyForKeyIndex(a4Index, 4)).toBe(440)
  })

  it('RG_LABELS and DN_LABELS have 6 entries each', () => {
    expect(RG_LABELS).toHaveLength(6)
    expect(DN_LABELS).toHaveLength(6)
  })

  it('CHAKRA_NAMES has 12 entries', () => {
    expect(CHAKRA_NAMES).toHaveLength(12)
  })
})
