import { useMemo, useCallback } from 'react'
import {
  getKeyIndicesForScale,
  MELAKARTA,
  WESTERN_NOTES,
} from '@/data/melakarta'
import type { MelakartaRaga } from '@/data/types'
import { useRagaStore } from '@/store/ragaStore'
import { useSettingsStore } from '@/store/settingsStore'
import { cn } from '@/lib/utils'

function getScaleClass(scaleIndex: number): string {
  if (scaleIndex === 0 || scaleIndex === 7) return 'scale-s'
  if (scaleIndex === 1 || scaleIndex === 2) return 'scale-rg'
  if (scaleIndex === 3) return 'scale-m'
  if (scaleIndex === 4) return 'scale-p'
  return 'scale-dn'
}

function samePitchSet(a: Set<number>, b: Set<number>): boolean {
  if (a.size !== b.size) return false
  for (const p of a) if (!b.has(p)) return false
  return true
}

function pitchSetForRagaRoot(raga: MelakartaRaga, root: number): Set<number> {
  const keyIndices = getKeyIndicesForScale(raga.scale)
  return new Set(keyIndices.map((k) => (k + root) % 12))
}

function findSamePitchSetMatches(
  currentSet: Set<number>,
  currentRaga: MelakartaRaga,
  currentRoot: number
): { raga: MelakartaRaga; root: number }[] {
  const matches: { raga: MelakartaRaga; root: number }[] = []
  for (const raga of MELAKARTA) {
    for (let root = 0; root < 12; root++) {
      if (raga.index === currentRaga.index && root === currentRoot) continue
      const otherSet = pitchSetForRagaRoot(raga, root)
      if (samePitchSet(currentSet, otherSet)) matches.push({ raga, root })
    }
  }
  return matches
}

export function ScaleDots({
  transposedKeyIndices,
}: {
  transposedKeyIndices: number[]
}) {
  return (
    <div
      className="w-full flex gap-0.5 items-center justify-stretch py-1"
      aria-label="Scale in 12-note octave"
    >
      {Array.from({ length: 12 }, (_, p) => {
        const scaleIndex = transposedKeyIndices.indexOf(p)
        const inScale = scaleIndex >= 0
        const scaleClass = inScale ? getScaleClass(scaleIndex) : ''
        return (
          <div
            key={p}
            className="flex-1 min-w-0 flex justify-center"
            title={inScale ? `Scale degree ${scaleIndex + 1}` : 'Not in scale'}
          >
            <span
              className={cn(
                'block aspect-square w-full max-w-4 rounded-full',
                inScale && scaleClass === 'scale-s' && 'bg-amber-400',
                inScale && scaleClass === 'scale-rg' && 'bg-emerald-400',
                inScale && scaleClass === 'scale-m' && 'bg-sky-400',
                inScale && scaleClass === 'scale-p' && 'bg-amber-400',
                inScale && scaleClass === 'scale-dn' && 'bg-violet-400',
                !inScale && 'bg-white/25'
              )}
            />
          </div>
        )
      })}
    </div>
  )
}

export function useGrahaBhedamMatches(
  currentRaga: MelakartaRaga,
  rootNote: number,
  transposedKeyIndices: number[]
): { raga: MelakartaRaga; root: number }[] {
  const currentSet = useMemo(
    () => new Set(transposedKeyIndices),
    [transposedKeyIndices]
  )
  return useMemo(
    () => findSamePitchSetMatches(currentSet, currentRaga, rootNote),
    [currentSet, currentRaga, rootNote]
  )
}

export function SamePitchSetMatches({
  currentRaga,
  rootNote,
  transposedKeyIndices,
}: {
  currentRaga: MelakartaRaga
  rootNote: number
  transposedKeyIndices: number[]
}) {
  const currentSet = useMemo(
    () => new Set(transposedKeyIndices),
    [transposedKeyIndices]
  )
  const matches = useMemo(
    () => findSamePitchSetMatches(currentSet, currentRaga, rootNote),
    [currentSet, currentRaga, rootNote]
  )
  const setRagaByIndex = useRagaStore((s) => s.setRagaByIndex)
  const setRootNote = useSettingsStore((s) => s.setRootNote)

  const handleSelectMatch = useCallback(
    (raga: MelakartaRaga, root: number) => {
      setRagaByIndex(raga.index)
      setRootNote(root)
    },
    [setRagaByIndex, setRootNote]
  )

  if (matches.length === 0) return null
  const rootName = WESTERN_NOTES[rootNote] ?? `#${rootNote}`

  return (
    <div className="w-full space-y-2">
      <div className="flex flex-col gap-2">
        {/* Parent / current raga dots as first entry */}
        <div className="flex flex-col gap-0.5">
          <ScaleDots transposedKeyIndices={transposedKeyIndices} />
          <span className="text-xs text-muted-foreground truncate">
            {currentRaga.name} in {rootName}
          </span>
        </div>
        {matches.map(({ raga, root }) => {
          const matchTransposed = getKeyIndicesForScale(raga.scale).map((k) => (k + root) % 12)
          return (
            <button
              key={`${raga.index}-${root}`}
              type="button"
              onClick={() => handleSelectMatch(raga, root)}
              className="flex flex-col gap-0.5 text-left rounded-md hover:bg-accent/50 focus:bg-accent/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring cursor-pointer transition-colors"
              aria-label={`Switch to ${raga.name} in ${WESTERN_NOTES[root] ?? root}`}
            >
              <ScaleDots transposedKeyIndices={matchTransposed} />
              <span className="text-xs text-muted-foreground truncate" title={`${raga.name} in ${WESTERN_NOTES[root]}`}>
                {raga.name} in {WESTERN_NOTES[root] ?? `#${root}`}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
