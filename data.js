/**
 * 72 Melakarta ragas: combinatorial structure and mappings.
 * ragaNumber = m * 36 + rg * 6 + dn + 1
 * (rg, m, dn) = (0,0,0) -> Kanakangi (raga 1).
 */

// Western note names for 12 keys (one octave chromatic)
const WESTERN_NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

// Carnatic swara to key index (0-11). S=C, P=G, R1=C#, R2=D, R3=D#, G1=D, G2=D#, G3=E, M1=F, M2=F#, D1=G#, D2=A, D3=A#, N1=A, N2=A#, N3=B.
const SWARA_TO_KEY_INDEX = {
  S: 0,
  R1: 1, R2: 2, R3: 3,
  G1: 2, G2: 3, G3: 4,
  M1: 5, M2: 6,
  P: 7,
  D1: 8, D2: 9, D3: 10,
  N1: 9, N2: 10, N3: 11
};

// Key index to Carnatic label (for reference; piano labels come from raga scale)
const KEY_INDEX_TO_CARNATIC = [
  'S', 'R1', 'R2/G1', 'R3/G2', 'G3', 'M1', 'M2', 'P', 'D1', 'D2/N1', 'D3/N2', 'N3'
];

// R–G axis labels (6 chakras in purvanga), hyphen between R and G
const RG_LABELS = ['R1-G1', 'R1-G2', 'R1-G3', 'R2-G2', 'R2-G3', 'R3-G3'];

// D–N axis labels (6 variants in uttaranga), hyphen between D and N
const DN_LABELS = ['D1-N1', 'D1-N2', 'D1-N3', 'D2-N2', 'D2-N3', 'D3-N3'];

// Western equivalents: M1=F, M2=F#
const WESTERN_FOR_M = ['F', 'F#'];

// Western equivalents for R–G chakras (R and G note names)
const RG_WESTERN = ['C# D', 'C# D#', 'C# E', 'D D#', 'D E', 'D# E'];

// Western equivalents for D–N pairs
const DN_WESTERN = ['G# A', 'G# A#', 'G# B', 'A A#', 'A B', 'A# B'];

// Chakra colors for the 6 columns (R–G indices 0..5)
const CHAKRA_COLORS = [
  '#1e3a5f', '#2d4a3e', '#5c3a2d', '#4a3d5c', '#3d5c4a', '#5c4a3d'
];

// Chakra names: first 6 for Suddha Madhyama (ragas 1–36), next 6 for Prati Madhyama (ragas 37–72).
// Index = m*6 + rg (0–5). So CHAKRA_NAMES[0..5] = Indu..Ritu, CHAKRA_NAMES[6..11] = Rishi..Aditya.
const CHAKRA_NAMES = [
  'Indu', 'Netra', 'Agni', 'Veda', 'Bana', 'Ritu',
  'Rishi', 'Vasu', 'Brahma', 'Disi', 'Rudra', 'Aditya'
];

/**
 * Get the 7 key indices (0-11) for a raga scale (array of swara names).
 * Returns sorted unique indices.
 */
function getKeyIndicesForScale(scale) {
  const indices = scale.map(swara => SWARA_TO_KEY_INDEX[swara]);
  return [...new Set(indices)].sort((a, b) => a - b);
}

/**
 * Return arohanam (ascending) and avarohanam (descending) from scale.
 * For melakarta: arohanam = scale, avarohanam = scale reversed.
 */
function getArohanamAvarohanam(scale) {
  if (!scale || !scale.length) return { arohanam: [], avarohanam: [] };
  return {
    arohanam: scale.slice(),
    avarohanam: scale.slice().reverse()
  };
}

/**
 * Map array of swara names to key indices in that order (no sorting).
 * Handles S, R1, G1, etc. Use for playback order (e.g. arohanam/avarohanam).
 */
function getKeyIndicesInOrder(swaraArray) {
  if (!swaraArray || !swaraArray.length) return [];
  return swaraArray.map(function (swara) {
    return SWARA_TO_KEY_INDEX[swara] != null ? SWARA_TO_KEY_INDEX[swara] : -1;
  }).filter(function (k) { return k >= 0; });
}

// Western spellings: flat and sharp, so we can pick one per scale note and use each letter once
const WESTERN_FLAT = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];
const WESTERN_SHARP = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

/** Return Western note string with flat 'b' as superscript (ᵇ) for display. */
function westernNoteForDisplay(name) {
  if (!name) return name;
  return name.replace(/b/g, '\u1D47');
}

/**
 * Return Western note names for the 7 key indices so each letter (C,D,E,F,G,A,B) appears exactly once.
 * Prefer sharp notation when it yields unique letters (e.g. C D# E F G A B).
 */
function getWesternSpellingForKeyIndices(keyIndices) {
  const letterOf = (name) => name.charAt(0);
  const used = new Set();
  const result = [];
  for (let i = 0; i < keyIndices.length; i++) {
    const k = keyIndices[i];
    const flat = WESTERN_FLAT[k];
    const sharp = WESTERN_SHARP[k];
    const letterF = letterOf(flat);
    const letterS = letterOf(sharp);
    if (!used.has(letterS)) {
      result.push(sharp);
      used.add(letterS);
    } else if (!used.has(letterF)) {
      result.push(flat);
      used.add(letterF);
    } else {
      result.push(sharp);
    }
  }
  return result;
}

/**
 * Return Western scale as a space-separated string (e.g. "C Dᵇ E F G A B") for display.
 * Flat 'b' is shown as superscript ᵇ.
 */
function getWesternScaleString(scale) {
  const keyIndices = getKeyIndicesForScale(scale);
  return getWesternSpellingForKeyIndices(keyIndices).map(westernNoteForDisplay).join(' ');
}

/**
 * Frequency for key index in 12-TET. A4 = 440 Hz. keyIndex 0 = C, 9 = A (A4).
 * Octave 4: C4..B4. keyIndex 9 is A4 = 440.
 */
function getFrequencyForKeyIndex(keyIndex, octave = 4) {
  const A4_INDEX = 9;
  const semitonesFromA4 = keyIndex - A4_INDEX + (octave - 4) * 12;
  return 440 * Math.pow(2, semitonesFromA4 / 12);
}

// 72 Melakarta ragas: index 1-72, name, scale (7 swaras), rg (0-5), m (0-1), dn (0-5)
// Order: m=0 first (1-36), then m=1 (37-72). Within each: rg 0..5, for each rg dn 0..5.
const MELAKARTA = [
  { index: 1,  name: 'Kanakangi',     scale: ['S','R1','G1','M1','P','D1','N1'], rg: 0, m: 0, dn: 0 },
  { index: 2,  name: 'Ratnangi',      scale: ['S','R1','G1','M1','P','D1','N2'], rg: 0, m: 0, dn: 1 },
  { index: 3,  name: 'Ganamurti',     scale: ['S','R1','G1','M1','P','D1','N3'], rg: 0, m: 0, dn: 2 },
  { index: 4,  name: 'Vanaspati',     scale: ['S','R1','G1','M1','P','D2','N2'], rg: 0, m: 0, dn: 3 },
  { index: 5,  name: 'Manavati',      scale: ['S','R1','G1','M1','P','D2','N3'], rg: 0, m: 0, dn: 4 },
  { index: 6,  name: 'Tanarupi',      scale: ['S','R1','G1','M1','P','D3','N3'], rg: 0, m: 0, dn: 5 },
  { index: 7,  name: 'Senavati',      scale: ['S','R1','G2','M1','P','D1','N1'], rg: 1, m: 0, dn: 0 },
  { index: 8,  name: 'Hanumatodi',    scale: ['S','R1','G2','M1','P','D1','N2'], rg: 1, m: 0, dn: 1 },
  { index: 9,  name: 'Dhenuka',       scale: ['S','R1','G2','M1','P','D1','N3'], rg: 1, m: 0, dn: 2 },
  { index: 10, name: 'Natakapriya',   scale: ['S','R1','G2','M1','P','D2','N2'], rg: 1, m: 0, dn: 3 },
  { index: 11, name: 'Kokilapriya',   scale: ['S','R1','G2','M1','P','D2','N3'], rg: 1, m: 0, dn: 4 },
  { index: 12, name: 'Rupavati',      scale: ['S','R1','G2','M1','P','D3','N3'], rg: 1, m: 0, dn: 5 },
  { index: 13, name: 'Gayakapriya',   scale: ['S','R1','G3','M1','P','D1','N1'], rg: 2, m: 0, dn: 0 },
  { index: 14, name: 'Vakulabharanam',scale: ['S','R1','G3','M1','P','D1','N2'], rg: 2, m: 0, dn: 1 },
  { index: 15, name: 'Mayamalavagowla',scale: ['S','R1','G3','M1','P','D1','N3'], rg: 2, m: 0, dn: 2 },
  { index: 16, name: 'Chakravakam',   scale: ['S','R1','G3','M1','P','D2','N2'], rg: 2, m: 0, dn: 3 },
  { index: 17, name: 'Suryakantam',   scale: ['S','R1','G3','M1','P','D2','N3'], rg: 2, m: 0, dn: 4 },
  { index: 18, name: 'Hatakambari',   scale: ['S','R1','G3','M1','P','D3','N3'], rg: 2, m: 0, dn: 5 },
  { index: 19, name: 'Jhankaradhwani',scale: ['S','R2','G2','M1','P','D1','N1'], rg: 3, m: 0, dn: 0 },
  { index: 20, name: 'Natabhairavi',  scale: ['S','R2','G2','M1','P','D1','N2'], rg: 3, m: 0, dn: 1 },
  { index: 21, name: 'Keeravani',     scale: ['S','R2','G2','M1','P','D1','N3'], rg: 3, m: 0, dn: 2 },
  { index: 22, name: 'Kharaharapriya',scale: ['S','R2','G2','M1','P','D2','N2'], rg: 3, m: 0, dn: 3 },
  { index: 23, name: 'Gourimanohari', scale: ['S','R2','G2','M1','P','D2','N3'], rg: 3, m: 0, dn: 4 },
  { index: 24, name: 'Varunapriya',   scale: ['S','R2','G2','M1','P','D3','N3'], rg: 3, m: 0, dn: 5 },
  { index: 25, name: 'Mararanjani',   scale: ['S','R2','G3','M1','P','D1','N1'], rg: 4, m: 0, dn: 0 },
  { index: 26, name: 'Charukesi',     scale: ['S','R2','G3','M1','P','D1','N2'], rg: 4, m: 0, dn: 1 },
  { index: 27, name: 'Sarasangi',     scale: ['S','R2','G3','M1','P','D1','N3'], rg: 4, m: 0, dn: 2 },
  { index: 28, name: 'Harikambhoji',  scale: ['S','R2','G3','M1','P','D2','N2'], rg: 4, m: 0, dn: 3 },
  { index: 29, name: 'Dheerasankarabharanam', scale: ['S','R2','G3','M1','P','D2','N3'], rg: 4, m: 0, dn: 4 },
  { index: 30, name: 'Naganandini',   scale: ['S','R2','G3','M1','P','D3','N3'], rg: 4, m: 0, dn: 5 },
  { index: 31, name: 'Yagapriya',     scale: ['S','R3','G3','M1','P','D1','N1'], rg: 5, m: 0, dn: 0 },
  { index: 32, name: 'Ragavardhini',  scale: ['S','R3','G3','M1','P','D1','N2'], rg: 5, m: 0, dn: 1 },
  { index: 33, name: 'Gangeyabhushani', scale: ['S','R3','G3','M1','P','D1','N3'], rg: 5, m: 0, dn: 2 },
  { index: 34, name: 'Vagadheeswari', scale: ['S','R3','G3','M1','P','D2','N2'], rg: 5, m: 0, dn: 3 },
  { index: 35, name: 'Shulini',      scale: ['S','R3','G3','M1','P','D2','N3'], rg: 5, m: 0, dn: 4 },
  { index: 36, name: 'Chalanata',     scale: ['S','R3','G3','M1','P','D3','N3'], rg: 5, m: 0, dn: 5 },
  { index: 37, name: 'Salagam',       scale: ['S','R1','G1','M2','P','D1','N1'], rg: 0, m: 1, dn: 0 },
  { index: 38, name: 'Jalarnavam',   scale: ['S','R1','G1','M2','P','D1','N2'], rg: 0, m: 1, dn: 1 },
  { index: 39, name: 'Jhalavarali',   scale: ['S','R1','G1','M2','P','D1','N3'], rg: 0, m: 1, dn: 2 },
  { index: 40, name: 'Navaneetam',   scale: ['S','R1','G1','M2','P','D2','N2'], rg: 0, m: 1, dn: 3 },
  { index: 41, name: 'Pavani',       scale: ['S','R1','G1','M2','P','D2','N3'], rg: 0, m: 1, dn: 4 },
  { index: 42, name: 'Raghupriya',   scale: ['S','R1','G1','M2','P','D3','N3'], rg: 0, m: 1, dn: 5 },
  { index: 43, name: 'Gavambhodi',   scale: ['S','R1','G2','M2','P','D1','N1'], rg: 1, m: 1, dn: 0 },
  { index: 44, name: 'Bhavapriya',   scale: ['S','R1','G2','M2','P','D1','N2'], rg: 1, m: 1, dn: 1 },
  { index: 45, name: 'Shubhapantuvarali', scale: ['S','R1','G2','M2','P','D1','N3'], rg: 1, m: 1, dn: 2 },
  { index: 46, name: 'Shadvidamargini', scale: ['S','R1','G2','M2','P','D2','N2'], rg: 1, m: 1, dn: 3 },
  { index: 47, name: 'Suvarnangi',   scale: ['S','R1','G2','M2','P','D2','N3'], rg: 1, m: 1, dn: 4 },
  { index: 48, name: 'Divyamani',    scale: ['S','R1','G2','M2','P','D3','N3'], rg: 1, m: 1, dn: 5 },
  { index: 49, name: 'Dhavalambari', scale: ['S','R1','G3','M2','P','D1','N1'], rg: 2, m: 1, dn: 0 },
  { index: 50, name: 'Namanarayani', scale: ['S','R1','G3','M2','P','D1','N2'], rg: 2, m: 1, dn: 1 },
  { index: 51, name: 'Kamavardhini', scale: ['S','R1','G3','M2','P','D1','N3'], rg: 2, m: 1, dn: 2 },
  { index: 52, name: 'Ramapriya',    scale: ['S','R1','G3','M2','P','D2','N2'], rg: 2, m: 1, dn: 3 },
  { index: 53, name: 'Gamanashrama', scale: ['S','R1','G3','M2','P','D2','N3'], rg: 2, m: 1, dn: 4 },
  { index: 54, name: 'Vishwambari',  scale: ['S','R1','G3','M2','P','D3','N3'], rg: 2, m: 1, dn: 5 },
  { index: 55, name: 'Shamalangi',   scale: ['S','R2','G2','M2','P','D1','N1'], rg: 3, m: 1, dn: 0 },
  { index: 56, name: 'Shanmukhapriya', scale: ['S','R2','G2','M2','P','D1','N2'], rg: 3, m: 1, dn: 1 },
  { index: 57, name: 'Simhendramadhyamam', scale: ['S','R2','G2','M2','P','D1','N3'], rg: 3, m: 1, dn: 2 },
  { index: 58, name: 'Hemavati',     scale: ['S','R2','G2','M2','P','D2','N2'], rg: 3, m: 1, dn: 3 },
  { index: 59, name: 'Dharmavati',   scale: ['S','R2','G2','M2','P','D2','N3'], rg: 3, m: 1, dn: 4 },
  { index: 60, name: 'Neetimati',    scale: ['S','R2','G2','M2','P','D3','N3'], rg: 3, m: 1, dn: 5 },
  { index: 61, name: 'Kantamani',    scale: ['S','R2','G3','M2','P','D1','N1'], rg: 4, m: 1, dn: 0 },
  { index: 62, name: 'Rishabhapriya', scale: ['S','R2','G3','M2','P','D1','N2'], rg: 4, m: 1, dn: 1 },
  { index: 63, name: 'Latangi',      scale: ['S','R2','G3','M2','P','D1','N3'], rg: 4, m: 1, dn: 2 },
  { index: 64, name: 'Vachaspati',   scale: ['S','R2','G3','M2','P','D2','N2'], rg: 4, m: 1, dn: 3 },
  { index: 65, name: 'Mechakalyani', scale: ['S','R2','G3','M2','P','D2','N3'], rg: 4, m: 1, dn: 4 },
  { index: 66, name: 'Chitrambari',  scale: ['S','R2','G3','M2','P','D3','N3'], rg: 4, m: 1, dn: 5 },
  { index: 67, name: 'Sucharita',    scale: ['S','R3','G3','M2','P','D1','N1'], rg: 5, m: 1, dn: 0 },
  { index: 68, name: 'Jyotisvarupini', scale: ['S','R3','G3','M2','P','D1','N2'], rg: 5, m: 1, dn: 1 },
  { index: 69, name: 'Dhatuvardani', scale: ['S','R3','G3','M2','P','D1','N3'], rg: 5, m: 1, dn: 2 },
  { index: 70, name: 'Nasikabhushani', scale: ['S','R3','G3','M2','P','D2','N2'], rg: 5, m: 1, dn: 3 },
  { index: 71, name: 'Kosalam',      scale: ['S','R3','G3','M2','P','D2','N3'], rg: 5, m: 1, dn: 4 },
  { index: 72, name: 'Rasikapriya',  scale: ['S','R3','G3','M2','P','D3','N3'], rg: 5, m: 1, dn: 5 },
];

function getRagaByIndex(ragaNumber) {
  return MELAKARTA.find(r => r.index === ragaNumber) || MELAKARTA[0];
}

function getRagaByCoords(rg, m, dn) {
  const index = m * 36 + rg * 6 + dn + 1;
  return getRagaByIndex(index);
}

function ragaNumberFromCoords(rg, m, dn) {
  return m * 36 + rg * 6 + dn + 1;
}

// Raga metadata: phrase, composer & year, time of day. Index 1–72.
const RAGA_INFO = {
  1: { phrase: 'First melakarta; solemn and foundational.', composerYear: 'Traditional; system by Venkatamakhi, c. 1660', timeOfDay: 'Morning' },
  2: { phrase: 'Jewel-like; gentle and lyrical.', composerYear: 'Traditional; system by Venkatamakhi, c. 1660', timeOfDay: 'Morning' },
  3: { phrase: 'Devotional, suited to kriti and varnam.', composerYear: 'Traditional; system by Venkatamakhi, c. 1660', timeOfDay: 'Morning' },
  4: { phrase: 'Forest-born; calm and reflective.', composerYear: 'Traditional; system by Venkatamakhi, c. 1660', timeOfDay: 'Late morning' },
  5: { phrase: 'Graceful and dignified.', composerYear: 'Traditional; system by Venkatamakhi, c. 1660', timeOfDay: 'Morning' },
  6: { phrase: 'Rarely performed; subtle and introspective.', composerYear: 'Traditional; system by Venkatamakhi, c. 1660', timeOfDay: 'Anytime' },
  7: { phrase: 'Redolent of Senavati janya; flowing and sweet.', composerYear: 'Traditional; system by Venkatamakhi, c. 1660', timeOfDay: 'Evening' },
  8: { phrase: 'Hanumatodi (Todi); profound, devotional morning raga.', composerYear: 'Traditional; system by Venkatamakhi, c. 1660', timeOfDay: 'Morning (6–10)' },
  9: { phrase: 'Dhenuka; pastoral and tender.', composerYear: 'Traditional; system by Venkatamakhi, c. 1660', timeOfDay: 'Evening' },
  10: { phrase: 'Dramatic and expressive; theatre-inspired.', composerYear: 'Traditional; system by Venkatamakhi, c. 1660', timeOfDay: 'Evening' },
  11: { phrase: 'Kokila (cuckoo); lyrical and romantic.', composerYear: 'Traditional; system by Venkatamakhi, c. 1660', timeOfDay: 'Evening' },
  12: { phrase: 'Beautiful form; elegant and pleasing.', composerYear: 'Traditional; system by Venkatamakhi, c. 1660', timeOfDay: 'Evening' },
  13: { phrase: 'Singer delight; gayaki-oriented.', composerYear: 'Traditional; system by Venkatamakhi, c. 1660', timeOfDay: 'Morning' },
  14: { phrase: 'Vakulabharanam; serene and meditative.', composerYear: 'Traditional; system by Venkatamakhi, c. 1660', timeOfDay: 'Morning' },
  15: { phrase: 'Mayamalavagowla; foundational teaching raga, bhakti.', composerYear: 'Traditional; system by Venkatamakhi, c. 1660', timeOfDay: 'Morning' },
  16: { phrase: 'Chakravakam; sunrise, hopeful and warm.', composerYear: 'Traditional; system by Venkatamakhi, c. 1660', timeOfDay: 'Morning' },
  17: { phrase: 'Suryakantam; solar, bright and majestic.', composerYear: 'Traditional; system by Venkatamakhi, c. 1660', timeOfDay: 'Morning' },
  18: { phrase: 'Golden; radiant and celebratory.', composerYear: 'Traditional; system by Venkatamakhi, c. 1660', timeOfDay: 'Morning' },
  19: { phrase: 'Jhankaradhwani; bell-like, resonant.', composerYear: 'Traditional; system by Venkatamakhi, c. 1660', timeOfDay: 'Evening' },
  20: { phrase: 'Natabhairavi; queen of melody, pathos and devotion.', composerYear: 'Traditional; system by Venkatamakhi, c. 1660', timeOfDay: 'Evening' },
  21: { phrase: 'Keeravani; sweet and poignant.', composerYear: 'Traditional; system by Venkatamakhi, c. 1660', timeOfDay: 'Night' },
  22: { phrase: 'Kharaharapriya; very popular, noble and lyrical.', composerYear: 'Traditional; system by Venkatamakhi, c. 1660', timeOfDay: 'Morning' },
  23: { phrase: 'Gourimanohari; captivating, romantic.', composerYear: 'Traditional; system by Venkatamakhi, c. 1660', timeOfDay: 'Evening' },
  24: { phrase: 'Varunapriya; rain deity, fresh and flowing.', composerYear: 'Traditional; system by Venkatamakhi, c. 1660', timeOfDay: 'Evening' },
  25: { phrase: 'Mararanjani; enchanting and melodious.', composerYear: 'Traditional; system by Venkatamakhi, c. 1660', timeOfDay: 'Evening' },
  26: { phrase: 'Charukesi; haunting beauty, devotion.', composerYear: 'Traditional; system by Venkatamakhi, c. 1660', timeOfDay: 'Evening' },
  27: { phrase: 'Sarasangi; essence of beauty; graceful.', composerYear: 'Traditional; system by Venkatamakhi, c. 1660', timeOfDay: 'Evening' },
  28: { phrase: 'Harikambhoji; joyful, used in dance and kritis.', composerYear: 'Traditional; system by Venkatamakhi, c. 1660', timeOfDay: 'Afternoon / Evening' },
  29: { phrase: 'Dheerasankarabharanam (Shankarabharanam); majestic, equivalent to major.', composerYear: 'Traditional; system by Venkatamakhi, c. 1660', timeOfDay: 'Morning' },
  30: { phrase: 'Naganandini; serpent melody, sinuous and subtle.', composerYear: 'Traditional; system by Venkatamakhi, c. 1660', timeOfDay: 'Evening' },
  31: { phrase: 'Yagapriya; sacrificial fire; intense and focused.', composerYear: 'Traditional; system by Venkatamakhi, c. 1660', timeOfDay: 'Evening' },
  32: { phrase: 'Ragavardhini; raga that enhances; exploratory.', composerYear: 'Traditional; system by Venkatamakhi, c. 1660', timeOfDay: 'Evening' },
  33: { phrase: 'Gangeyabhushani; Ganga-adorned; flowing and pure.', composerYear: 'Traditional; system by Venkatamakhi, c. 1660', timeOfDay: 'Evening' },
  34: { phrase: 'Vagadheeswari; goddess of speech; eloquent.', composerYear: 'Traditional; system by Venkatamakhi, c. 1660', timeOfDay: 'Evening' },
  35: { phrase: 'Shulini; fierce and powerful.', composerYear: 'Traditional; system by Venkatamakhi, c. 1660', timeOfDay: 'Night' },
  36: { phrase: 'Chalanata; movement; dynamic and lively.', composerYear: 'Traditional; system by Venkatamakhi, c. 1660', timeOfDay: 'Evening' },
  37: { phrase: 'Salagam; deep and resonant.', composerYear: 'Traditional; system by Venkatamakhi, c. 1660', timeOfDay: 'Night' },
  38: { phrase: 'Jalarnavam; ocean of water; vast and calm.', composerYear: 'Traditional; system by Venkatamakhi, c. 1660', timeOfDay: 'Night' },
  39: { phrase: 'Jhalavarali; dewdrop; delicate and crisp.', composerYear: 'Traditional; system by Venkatamakhi, c. 1660', timeOfDay: 'Night' },
  40: { phrase: 'Navaneetam; fresh butter; soft and sweet.', composerYear: 'Traditional; system by Venkatamakhi, c. 1660', timeOfDay: 'Night' },
  41: { phrase: 'Pavani; purifying; clear and flowing.', composerYear: 'Traditional; system by Venkatamakhi, c. 1660', timeOfDay: 'Night' },
  42: { phrase: 'Raghupriya; beloved of Rama; devotional.', composerYear: 'Traditional; system by Venkatamakhi, c. 1660', timeOfDay: 'Night' },
  43: { phrase: 'Gavambhodi; deep and contemplative.', composerYear: 'Traditional; system by Venkatamakhi, c. 1660', timeOfDay: 'Night' },
  44: { phrase: 'Bhavapriya; devotion; emotional and tender.', composerYear: 'Traditional; system by Venkatamakhi, c. 1660', timeOfDay: 'Night' },
  45: { phrase: 'Shubhapantuvarali; auspicious; gravitas and depth.', composerYear: 'Traditional; system by Venkatamakhi, c. 1660', timeOfDay: 'Night' },
  46: { phrase: 'Shadvidamargini; six paths; philosophical.', composerYear: 'Traditional; system by Venkatamakhi, c. 1660', timeOfDay: 'Night' },
  47: { phrase: 'Suvarnangi; golden-bodied; lustrous.', composerYear: 'Traditional; system by Venkatamakhi, c. 1660', timeOfDay: 'Night' },
  48: { phrase: 'Divyamani; divine jewel; radiant.', composerYear: 'Traditional; system by Venkatamakhi, c. 1660', timeOfDay: 'Night' },
  49: { phrase: 'Dhavalambari; white; pure and bright.', composerYear: 'Traditional; system by Venkatamakhi, c. 1660', timeOfDay: 'Night' },
  50: { phrase: 'Namanarayani; bowing to Narayana; reverent.', composerYear: 'Traditional; system by Venkatamakhi, c. 1660', timeOfDay: 'Night' },
  51: { phrase: 'Kamavardhini; desire-enhancing; romantic.', composerYear: 'Traditional; system by Venkatamakhi, c. 1660', timeOfDay: 'Night' },
  52: { phrase: 'Ramapriya; beloved of Rama; devotional.', composerYear: 'Traditional; system by Venkatamakhi, c. 1660', timeOfDay: 'Night' },
  53: { phrase: 'Gamanashrama; journey rest; calm and resolved.', composerYear: 'Traditional; system by Venkatamakhi, c. 1660', timeOfDay: 'Night' },
  54: { phrase: 'Vishwambari; universal mother; nurturing.', composerYear: 'Traditional; system by Venkatamakhi, c. 1660', timeOfDay: 'Night' },
  55: { phrase: 'Shamalangi; peace-giving; serene.', composerYear: 'Traditional; system by Venkatamakhi, c. 1660', timeOfDay: 'Night' },
  56: { phrase: 'Shanmukhapriya; beloved of Shanmukha; vigorous.', composerYear: 'Traditional; system by Venkatamakhi, c. 1660', timeOfDay: 'Night' },
  57: { phrase: 'Simhendramadhyamam; lion pride; majestic.', composerYear: 'Traditional; system by Venkatamakhi, c. 1660', timeOfDay: 'Night' },
  58: { phrase: 'Hemavati; golden; warm and noble.', composerYear: 'Traditional; system by Venkatamakhi, c. 1660', timeOfDay: 'Night' },
  59: { phrase: 'Dharmavati; righteous; dignified and clear.', composerYear: 'Traditional; system by Venkatamakhi, c. 1660', timeOfDay: 'Night' },
  60: { phrase: 'Neetimati; justice; firm and balanced.', composerYear: 'Traditional; system by Venkatamakhi, c. 1660', timeOfDay: 'Night' },
  61: { phrase: 'Kantamani; desirable; charming.', composerYear: 'Traditional; system by Venkatamakhi, c. 1660', timeOfDay: 'Night' },
  62: { phrase: 'Rishabhapriya; beloved of Rishabha; steadfast.', composerYear: 'Traditional; system by Venkatamakhi, c. 1660', timeOfDay: 'Night' },
  63: { phrase: 'Latangi; creeping vine; delicate and winding.', composerYear: 'Traditional; system by Venkatamakhi, c. 1660', timeOfDay: 'Night' },
  64: { phrase: 'Vachaspati; lord of speech; eloquent.', composerYear: 'Traditional; system by Venkatamakhi, c. 1660', timeOfDay: 'Night' },
  65: { phrase: 'Mechakalyani (Kalyani); queen of evening ragas, grand and joyous.', composerYear: 'Traditional; system by Venkatamakhi, c. 1660', timeOfDay: 'Evening' },
  66: { phrase: 'Chitrambari; varied picture; colourful.', composerYear: 'Traditional; system by Venkatamakhi, c. 1660', timeOfDay: 'Night' },
  67: { phrase: 'Sucharita; good conduct; virtuous and sweet.', composerYear: 'Traditional; system by Venkatamakhi, c. 1660', timeOfDay: 'Night' },
  68: { phrase: 'Jyotisvarupini; form of light; luminous.', composerYear: 'Traditional; system by Venkatamakhi, c. 1660', timeOfDay: 'Night' },
  69: { phrase: 'Dhatuvardani; element-enhancing; primal.', composerYear: 'Traditional; system by Venkatamakhi, c. 1660', timeOfDay: 'Night' },
  70: { phrase: 'Nasikabhushani; Nasika-adorned; ornate.', composerYear: 'Traditional; system by Venkatamakhi, c. 1660', timeOfDay: 'Night' },
  71: { phrase: 'Kosalam; from Kosala; regal.', composerYear: 'Traditional; system by Venkatamakhi, c. 1660', timeOfDay: 'Night' },
  72: { phrase: 'Rasikapriya; connoisseur delight; last melakarta.', composerYear: 'Traditional; system by Venkatamakhi, c. 1660', timeOfDay: 'Night' }
};

function getRagaInfo(ragaIndex) {
  var info = RAGA_INFO[ragaIndex];
  return info || { phrase: 'A melakarta parent scale.', composerYear: 'Melakarta system: Venkatamakhi, c. 1660', timeOfDay: 'Anytime' };
}
