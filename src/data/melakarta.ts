import type { MelakartaRaga, RagaInfo, SwaraName } from './types'

export const WESTERN_NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'] as const

const SWARA_TO_KEY_INDEX: Record<SwaraName, number> = {
  S: 0,
  R1: 1, R2: 2, R3: 3,
  G1: 2, G2: 3, G3: 4,
  M1: 5, M2: 6,
  P: 7,
  D1: 8, D2: 9, D3: 10,
  N1: 9, N2: 10, N3: 11,
}

export const RG_LABELS = ['R1-G1', 'R1-G2', 'R1-G3', 'R2-G2', 'R2-G3', 'R3-G3'] as const
export const DN_LABELS = ['D1-N1', 'D1-N2', 'D1-N3', 'D2-N2', 'D2-N3', 'D3-N3'] as const
export const CHAKRA_NAMES = [
  'Indu', 'Netra', 'Agni', 'Veda', 'Bana', 'Ritu',
  'Rishi', 'Vasu', 'Brahma', 'Disi', 'Rudra', 'Aditya',
] as const

export const WESTERN_SHARP = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'] as const

export function getKeyIndicesForScale(scale: SwaraName[]): number[] {
  const indices = scale.map((swara) => SWARA_TO_KEY_INDEX[swara])
  return [...new Set(indices)].sort((a, b) => a - b)
}

export function getArohanamAvarohanam(scale: SwaraName[]) {
  if (!scale?.length) return { arohanam: [], avarohanam: [] }
  return {
    arohanam: scale.slice(),
    avarohanam: scale.slice().reverse(),
  }
}

export function getKeyIndicesInOrder(swaraArray: SwaraName[]): number[] {
  if (!swaraArray?.length) return []
  return swaraArray
    .map((swara) => (SWARA_TO_KEY_INDEX[swara] != null ? SWARA_TO_KEY_INDEX[swara] : -1))
    .filter((k) => k >= 0)
}

export function westernNoteForDisplay(name: string): string {
  if (!name) return name
  return name.replace(/b/g, '\u1D47')
}

export function westernNoteForDisplayHTML(name: string): string {
  if (!name) return name
  return name.replace(/#/g, '<sup>#</sup>').replace(/b/g, '<sup>b</sup>')
}

export function getFrequencyForKeyIndex(keyIndex: number, octave = 4): number {
  const A4_INDEX = 9
  const semitonesFromA4 = keyIndex - A4_INDEX + (octave - 4) * 12
  return 440 * Math.pow(2, semitonesFromA4 / 12)
}

export const MELAKARTA: MelakartaRaga[] = [
  { index: 1, name: 'Kanakangi', scale: ['S', 'R1', 'G1', 'M1', 'P', 'D1', 'N1'], rg: 0, m: 0, dn: 0 },
  { index: 2, name: 'Ratnangi', scale: ['S', 'R1', 'G1', 'M1', 'P', 'D1', 'N2'], rg: 0, m: 0, dn: 1 },
  { index: 3, name: 'Ganamurti', scale: ['S', 'R1', 'G1', 'M1', 'P', 'D1', 'N3'], rg: 0, m: 0, dn: 2 },
  { index: 4, name: 'Vanaspati', scale: ['S', 'R1', 'G1', 'M1', 'P', 'D2', 'N2'], rg: 0, m: 0, dn: 3 },
  { index: 5, name: 'Manavati', scale: ['S', 'R1', 'G1', 'M1', 'P', 'D2', 'N3'], rg: 0, m: 0, dn: 4 },
  { index: 6, name: 'Tanarupi', scale: ['S', 'R1', 'G1', 'M1', 'P', 'D3', 'N3'], rg: 0, m: 0, dn: 5 },
  { index: 7, name: 'Senavati', scale: ['S', 'R1', 'G2', 'M1', 'P', 'D1', 'N1'], rg: 1, m: 0, dn: 0 },
  { index: 8, name: 'Hanumatodi', scale: ['S', 'R1', 'G2', 'M1', 'P', 'D1', 'N2'], rg: 1, m: 0, dn: 1 },
  { index: 9, name: 'Dhenuka', scale: ['S', 'R1', 'G2', 'M1', 'P', 'D1', 'N3'], rg: 1, m: 0, dn: 2 },
  { index: 10, name: 'Natakapriya', scale: ['S', 'R1', 'G2', 'M1', 'P', 'D2', 'N2'], rg: 1, m: 0, dn: 3 },
  { index: 11, name: 'Kokilapriya', scale: ['S', 'R1', 'G2', 'M1', 'P', 'D2', 'N3'], rg: 1, m: 0, dn: 4 },
  { index: 12, name: 'Rupavati', scale: ['S', 'R1', 'G2', 'M1', 'P', 'D3', 'N3'], rg: 1, m: 0, dn: 5 },
  { index: 13, name: 'Gayakapriya', scale: ['S', 'R1', 'G3', 'M1', 'P', 'D1', 'N1'], rg: 2, m: 0, dn: 0 },
  { index: 14, name: 'Vakulabharanam', scale: ['S', 'R1', 'G3', 'M1', 'P', 'D1', 'N2'], rg: 2, m: 0, dn: 1 },
  { index: 15, name: 'Mayamalavagowla', scale: ['S', 'R1', 'G3', 'M1', 'P', 'D1', 'N3'], rg: 2, m: 0, dn: 2 },
  { index: 16, name: 'Chakravakam', scale: ['S', 'R1', 'G3', 'M1', 'P', 'D2', 'N2'], rg: 2, m: 0, dn: 3 },
  { index: 17, name: 'Suryakantam', scale: ['S', 'R1', 'G3', 'M1', 'P', 'D2', 'N3'], rg: 2, m: 0, dn: 4 },
  { index: 18, name: 'Hatakambari', scale: ['S', 'R1', 'G3', 'M1', 'P', 'D3', 'N3'], rg: 2, m: 0, dn: 5 },
  { index: 19, name: 'Jhankaradhwani', scale: ['S', 'R2', 'G2', 'M1', 'P', 'D1', 'N1'], rg: 3, m: 0, dn: 0 },
  { index: 20, name: 'Natabhairavi', scale: ['S', 'R2', 'G2', 'M1', 'P', 'D1', 'N2'], rg: 3, m: 0, dn: 1 },
  { index: 21, name: 'Keeravani', scale: ['S', 'R2', 'G2', 'M1', 'P', 'D1', 'N3'], rg: 3, m: 0, dn: 2 },
  { index: 22, name: 'Kharaharapriya', scale: ['S', 'R2', 'G2', 'M1', 'P', 'D2', 'N2'], rg: 3, m: 0, dn: 3 },
  { index: 23, name: 'Gourimanohari', scale: ['S', 'R2', 'G2', 'M1', 'P', 'D2', 'N3'], rg: 3, m: 0, dn: 4 },
  { index: 24, name: 'Varunapriya', scale: ['S', 'R2', 'G2', 'M1', 'P', 'D3', 'N3'], rg: 3, m: 0, dn: 5 },
  { index: 25, name: 'Mararanjani', scale: ['S', 'R2', 'G3', 'M1', 'P', 'D1', 'N1'], rg: 4, m: 0, dn: 0 },
  { index: 26, name: 'Charukesi', scale: ['S', 'R2', 'G3', 'M1', 'P', 'D1', 'N2'], rg: 4, m: 0, dn: 1 },
  { index: 27, name: 'Sarasangi', scale: ['S', 'R2', 'G3', 'M1', 'P', 'D1', 'N3'], rg: 4, m: 0, dn: 2 },
  { index: 28, name: 'Harikambhoji', scale: ['S', 'R2', 'G3', 'M1', 'P', 'D2', 'N2'], rg: 4, m: 0, dn: 3 },
  { index: 29, name: 'Dheerasankarabharanam', scale: ['S', 'R2', 'G3', 'M1', 'P', 'D2', 'N3'], rg: 4, m: 0, dn: 4 },
  { index: 30, name: 'Naganandini', scale: ['S', 'R2', 'G3', 'M1', 'P', 'D3', 'N3'], rg: 4, m: 0, dn: 5 },
  { index: 31, name: 'Yagapriya', scale: ['S', 'R3', 'G3', 'M1', 'P', 'D1', 'N1'], rg: 5, m: 0, dn: 0 },
  { index: 32, name: 'Ragavardhini', scale: ['S', 'R3', 'G3', 'M1', 'P', 'D1', 'N2'], rg: 5, m: 0, dn: 1 },
  { index: 33, name: 'Gangeyabhushani', scale: ['S', 'R3', 'G3', 'M1', 'P', 'D1', 'N3'], rg: 5, m: 0, dn: 2 },
  { index: 34, name: 'Vagadheeswari', scale: ['S', 'R3', 'G3', 'M1', 'P', 'D2', 'N2'], rg: 5, m: 0, dn: 3 },
  { index: 35, name: 'Shulini', scale: ['S', 'R3', 'G3', 'M1', 'P', 'D2', 'N3'], rg: 5, m: 0, dn: 4 },
  { index: 36, name: 'Chalanata', scale: ['S', 'R3', 'G3', 'M1', 'P', 'D3', 'N3'], rg: 5, m: 0, dn: 5 },
  { index: 37, name: 'Salagam', scale: ['S', 'R1', 'G1', 'M2', 'P', 'D1', 'N1'], rg: 0, m: 1, dn: 0 },
  { index: 38, name: 'Jalarnavam', scale: ['S', 'R1', 'G1', 'M2', 'P', 'D1', 'N2'], rg: 0, m: 1, dn: 1 },
  { index: 39, name: 'Jhalavarali', scale: ['S', 'R1', 'G1', 'M2', 'P', 'D1', 'N3'], rg: 0, m: 1, dn: 2 },
  { index: 40, name: 'Navaneetam', scale: ['S', 'R1', 'G1', 'M2', 'P', 'D2', 'N2'], rg: 0, m: 1, dn: 3 },
  { index: 41, name: 'Pavani', scale: ['S', 'R1', 'G1', 'M2', 'P', 'D2', 'N3'], rg: 0, m: 1, dn: 4 },
  { index: 42, name: 'Raghupriya', scale: ['S', 'R1', 'G1', 'M2', 'P', 'D3', 'N3'], rg: 0, m: 1, dn: 5 },
  { index: 43, name: 'Gavambhodi', scale: ['S', 'R1', 'G2', 'M2', 'P', 'D1', 'N1'], rg: 1, m: 1, dn: 0 },
  { index: 44, name: 'Bhavapriya', scale: ['S', 'R1', 'G2', 'M2', 'P', 'D1', 'N2'], rg: 1, m: 1, dn: 1 },
  { index: 45, name: 'Shubhapantuvarali', scale: ['S', 'R1', 'G2', 'M2', 'P', 'D1', 'N3'], rg: 1, m: 1, dn: 2 },
  { index: 46, name: 'Shadvidamargini', scale: ['S', 'R1', 'G2', 'M2', 'P', 'D2', 'N2'], rg: 1, m: 1, dn: 3 },
  { index: 47, name: 'Suvarnangi', scale: ['S', 'R1', 'G2', 'M2', 'P', 'D2', 'N3'], rg: 1, m: 1, dn: 4 },
  { index: 48, name: 'Divyamani', scale: ['S', 'R1', 'G2', 'M2', 'P', 'D3', 'N3'], rg: 1, m: 1, dn: 5 },
  { index: 49, name: 'Dhavalambari', scale: ['S', 'R1', 'G3', 'M2', 'P', 'D1', 'N1'], rg: 2, m: 1, dn: 0 },
  { index: 50, name: 'Namanarayani', scale: ['S', 'R1', 'G3', 'M2', 'P', 'D1', 'N2'], rg: 2, m: 1, dn: 1 },
  { index: 51, name: 'Kamavardhini', scale: ['S', 'R1', 'G3', 'M2', 'P', 'D1', 'N3'], rg: 2, m: 1, dn: 2 },
  { index: 52, name: 'Ramapriya', scale: ['S', 'R1', 'G3', 'M2', 'P', 'D2', 'N2'], rg: 2, m: 1, dn: 3 },
  { index: 53, name: 'Gamanashrama', scale: ['S', 'R1', 'G3', 'M2', 'P', 'D2', 'N3'], rg: 2, m: 1, dn: 4 },
  { index: 54, name: 'Vishwambari', scale: ['S', 'R1', 'G3', 'M2', 'P', 'D3', 'N3'], rg: 2, m: 1, dn: 5 },
  { index: 55, name: 'Shamalangi', scale: ['S', 'R2', 'G2', 'M2', 'P', 'D1', 'N1'], rg: 3, m: 1, dn: 0 },
  { index: 56, name: 'Shanmukhapriya', scale: ['S', 'R2', 'G2', 'M2', 'P', 'D1', 'N2'], rg: 3, m: 1, dn: 1 },
  { index: 57, name: 'Simhendramadhyamam', scale: ['S', 'R2', 'G2', 'M2', 'P', 'D1', 'N3'], rg: 3, m: 1, dn: 2 },
  { index: 58, name: 'Hemavati', scale: ['S', 'R2', 'G2', 'M2', 'P', 'D2', 'N2'], rg: 3, m: 1, dn: 3 },
  { index: 59, name: 'Dharmavati', scale: ['S', 'R2', 'G2', 'M2', 'P', 'D2', 'N3'], rg: 3, m: 1, dn: 4 },
  { index: 60, name: 'Neetimati', scale: ['S', 'R2', 'G2', 'M2', 'P', 'D3', 'N3'], rg: 3, m: 1, dn: 5 },
  { index: 61, name: 'Kantamani', scale: ['S', 'R2', 'G3', 'M2', 'P', 'D1', 'N1'], rg: 4, m: 1, dn: 0 },
  { index: 62, name: 'Rishabhapriya', scale: ['S', 'R2', 'G3', 'M2', 'P', 'D1', 'N2'], rg: 4, m: 1, dn: 1 },
  { index: 63, name: 'Latangi', scale: ['S', 'R2', 'G3', 'M2', 'P', 'D1', 'N3'], rg: 4, m: 1, dn: 2 },
  { index: 64, name: 'Vachaspati', scale: ['S', 'R2', 'G3', 'M2', 'P', 'D2', 'N2'], rg: 4, m: 1, dn: 3 },
  { index: 65, name: 'Mechakalyani', scale: ['S', 'R2', 'G3', 'M2', 'P', 'D2', 'N3'], rg: 4, m: 1, dn: 4 },
  { index: 66, name: 'Chitrambari', scale: ['S', 'R2', 'G3', 'M2', 'P', 'D3', 'N3'], rg: 4, m: 1, dn: 5 },
  { index: 67, name: 'Sucharita', scale: ['S', 'R3', 'G3', 'M2', 'P', 'D1', 'N1'], rg: 5, m: 1, dn: 0 },
  { index: 68, name: 'Jyotisvarupini', scale: ['S', 'R3', 'G3', 'M2', 'P', 'D1', 'N2'], rg: 5, m: 1, dn: 1 },
  { index: 69, name: 'Dhatuvardani', scale: ['S', 'R3', 'G3', 'M2', 'P', 'D1', 'N3'], rg: 5, m: 1, dn: 2 },
  { index: 70, name: 'Nasikabhushani', scale: ['S', 'R3', 'G3', 'M2', 'P', 'D2', 'N2'], rg: 5, m: 1, dn: 3 },
  { index: 71, name: 'Kosalam', scale: ['S', 'R3', 'G3', 'M2', 'P', 'D2', 'N3'], rg: 5, m: 1, dn: 4 },
  { index: 72, name: 'Rasikapriya', scale: ['S', 'R3', 'G3', 'M2', 'P', 'D3', 'N3'], rg: 5, m: 1, dn: 5 },
]

export function getRagaByIndex(ragaNumber: number): MelakartaRaga {
  return MELAKARTA.find((r) => r.index === ragaNumber) ?? MELAKARTA[0]
}

export function getRagaByCoords(rg: number, m: number, dn: number): MelakartaRaga {
  const index = m * 36 + rg * 6 + dn + 1
  return getRagaByIndex(index)
}

export function ragaNumberFromCoords(rg: number, m: number, dn: number): number {
  return m * 36 + rg * 6 + dn + 1
}

const RAGA_EQUIVALENTS: Record<number, { hindustani?: string; western?: string }> = {
  2: { hindustani: 'Bairagi Bhairav (janya Revati)' },
  8: { hindustani: 'Bhairavi (thaat) / Sindhu Bhairavi', western: 'Phrygian' },
  10: { hindustani: 'Sindhu Bhairavi' },
  14: { hindustani: 'Basant Mukhari / Vibhavari' },
  15: { hindustani: 'Bhairav', western: 'Double harmonic major' },
  16: { hindustani: 'Ahir Bhairav', western: 'Chromatic (C Db E F G A Bb)' },
  17: { hindustani: 'Girija / Vasant / Saurastra Bhairav' },
  20: { hindustani: 'Asavari (thaat) / Natabhairavi', western: 'Natural minor' },
  21: { hindustani: 'Chandrakauns (janya Kadaram)' },
  22: { hindustani: 'Kafi (thaat)', western: 'Dorian' },
  23: { hindustani: 'Suryakauns (janya Kamala)' },
  27: { hindustani: 'Nat Bhairav / Kamalamanohari' },
  28: { hindustani: 'Khamaj (thaat)', western: 'Mixolydian' },
  29: { hindustani: 'Bilawal (thaat) / Shankarabharanam', western: 'Major' },
  30: { hindustani: 'Tilang' },
  45: { hindustani: 'Todi (thaat) / Subhapantuvarali', western: 'Phrygian dominant' },
  51: { hindustani: 'Purvi (thaat) / Deepak / Kamavardhini' },
  52: { hindustani: 'Varati (janya Patalambari)' },
  53: { hindustani: 'Marva (thaat) / Gamanashrama' },
  59: { hindustani: 'Dharmavati / Ambika / Madhuvanti' },
  64: { hindustani: 'Sarasvati / Shree Kalyani (janya)' },
  65: { hindustani: 'Yaman / Kalyani (thaat)', western: 'Lydian' },
}

const RAGA_INFO: Record<number, { phrase?: string; composerYear?: string; timeOfDay?: string }> = {}
for (let i = 1; i <= 72; i++) {
  RAGA_INFO[i] = {
    phrase: 'A melakarta parent scale.',
    composerYear: 'Melakarta system: Venkatamakhi, c. 1660',
    timeOfDay: 'Anytime',
  }
}
Object.assign(RAGA_INFO, {
  1: { phrase: 'First melakarta; solemn and foundational.', composerYear: 'Traditional; system by Venkatamakhi, c. 1660', timeOfDay: 'Morning' },
  2: { phrase: 'Jewel-like; gentle and lyrical.', composerYear: 'Traditional; system by Venkatamakhi, c. 1660', timeOfDay: 'Morning' },
  15: { phrase: 'Mayamalavagowla; foundational teaching raga, bhakti.', composerYear: 'Traditional; system by Venkatamakhi, c. 1660', timeOfDay: 'Morning' },
  22: { phrase: 'Kharaharapriya; very popular, noble and lyrical.', composerYear: 'Traditional; system by Venkatamakhi, c. 1660', timeOfDay: 'Morning' },
  28: { phrase: 'Harikambhoji; joyful, used in dance and kritis.', composerYear: 'Traditional; system by Venkatamakhi, c. 1660', timeOfDay: 'Afternoon / Evening' },
  29: { phrase: 'Dheerasankarabharanam (Shankarabharanam); majestic, equivalent to major.', composerYear: 'Traditional; system by Venkatamakhi, c. 1660', timeOfDay: 'Morning' },
  65: { phrase: 'Mechakalyani (Kalyani); queen of evening ragas, grand and joyous.', composerYear: 'Traditional; system by Venkatamakhi, c. 1660', timeOfDay: 'Evening' },
  72: { phrase: 'Rasikapriya; connoisseur delight; last melakarta.', composerYear: 'Traditional; system by Venkatamakhi, c. 1660', timeOfDay: 'Night' },
})

export function getRagaInfo(ragaIndex: number): RagaInfo {
  const info = RAGA_INFO[ragaIndex] ?? {}
  const equiv = RAGA_EQUIVALENTS[ragaIndex]
  return {
    phrase: info.phrase ?? 'A melakarta parent scale.',
    composerYear: info.composerYear ?? 'Melakarta system: Venkatamakhi, c. 1660',
    timeOfDay: info.timeOfDay ?? 'Anytime',
    hindustani: equiv?.hindustani ?? null,
    western: equiv?.western ?? null,
  }
}
