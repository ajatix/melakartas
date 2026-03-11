export type SwaraName =
  | 'S'
  | 'R1' | 'R2' | 'R3'
  | 'G1' | 'G2' | 'G3'
  | 'M1' | 'M2'
  | 'P'
  | 'D1' | 'D2' | 'D3'
  | 'N1' | 'N2' | 'N3'

export interface MelakartaRaga {
  index: number
  name: string
  scale: SwaraName[]
  rg: number
  m: number
  dn: number
}

export interface RagaInfo {
  phrase: string
  composerYear: string
  timeOfDay: string
  hindustani: string | null
  western: string | null
}

export type Instrument = 'piano' | 'guitar' | 'veena' | 'violin'
