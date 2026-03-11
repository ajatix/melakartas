import { useState, useCallback, useMemo } from 'react'
import { ArrowUp, ArrowDown } from 'lucide-react'
import {
  getKeyIndicesForScale,
  WESTERN_NOTES,
  WESTERN_SHARP,
  westernNoteForDisplayHTML,
} from '@/data/melakarta'
import { useRagaStore } from '@/store/ragaStore'
import { useSettingsStore } from '@/store/settingsStore'
import { useUIStore } from '@/store/uiStore'
import { useAudio } from '@/hooks/useAudio'
import { whiteOffsets, blackOffsets, blackPositionMap } from '@/hooks/useAudio'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

function getScaleClass(scaleIndex: number): string {
  if (scaleIndex === 0 || scaleIndex === 7) return 'scale-s'
  if (scaleIndex === 1 || scaleIndex === 2) return 'scale-rg'
  if (scaleIndex === 3) return 'scale-m'
  if (scaleIndex === 4) return 'scale-p'
  return 'scale-dn'
}

export function PianoSection() {
  const { currentRaga } = useRagaStore()
  const { rootNote, instrument, reverb, bpm } = useSettingsStore()
  const audioUnlocked = useUIStore((s) => s.audioUnlocked)
  const [playingKey, setPlayingKey] = useState<number | null>(null)
  const { ensureContext, playNote, playScale, stopPlayback } = useAudio()

  const keyIndices = useMemo(() => getKeyIndicesForScale(currentRaga.scale), [currentRaga.scale])
  const transposedKeyIndices = useMemo(
    () => keyIndices.map((k) => (k + rootNote) % 12),
    [keyIndices, rootNote]
  )

  const setKeyPlaying = useCallback((keyIndex: number, durationMs: number) => {
    setPlayingKey(keyIndex)
    const t = setTimeout(() => setPlayingKey(null), durationMs)
    return () => clearTimeout(t)
  }, [])

  const handleKeyClick = useCallback(
    (keyIndex: number) => {
      if (!audioUnlocked) return
      ensureContext()
      const pitch = keyIndex % 12
      const octave = 4 + Math.floor(keyIndex / 12)
      playNote(
        pitch,
        0.3,
        instrument,
        reverb,
        rootNote,
        (k, durationMs) => setKeyPlaying(k, durationMs),
        octave
      )
    },
    [audioUnlocked, ensureContext, instrument, reverb, rootNote, playNote]
  )

  const handlePlayAsc = useCallback(() => {
    if (!audioUnlocked) return
    ensureContext()
    playScale(true, currentRaga, bpm, rootNote, instrument, reverb, (keyIndex, durationMs) =>
      setKeyPlaying(keyIndex, durationMs)
    )
  }, [audioUnlocked, ensureContext, playScale, currentRaga, bpm, rootNote, instrument, reverb])

  const handlePlayDesc = useCallback(() => {
    if (!audioUnlocked) return
    ensureContext()
    playScale(false, currentRaga, bpm, rootNote, instrument, reverb, (keyIndex, durationMs) =>
      setKeyPlaying(keyIndex, durationMs)
    )
  }, [audioUnlocked, ensureContext, playScale, currentRaga, bpm, rootNote, instrument, reverb])

  const rootNoteName = WESTERN_NOTES[rootNote] ?? 'C'

  return (
    <section className="flex-none flex flex-col gap-2">
      <div className="w-full flex-1 min-h-[200px] flex items-stretch justify-stretch py-2 px-2">
        <div className="flex items-stretch flex-1 w-full relative bg-background min-h-[180px] piano">
          {whiteOffsets.map((i) => {
            const pitchClass = i % 12
            const octave = 4 + Math.floor(i / 12)
            const inScale =
              transposedKeyIndices.includes(pitchClass) &&
              i >= rootNote &&
              i <= rootNote + 12
            const keyIndex = i
            const scaleIndex =
              keyIndex === 12 + rootNote ? 7 : transposedKeyIndices.indexOf(pitchClass)
            const scaleClass = inScale ? getScaleClass(scaleIndex) : ''
            const carnaticLabel = scaleIndex === 7 ? 'Ṡ' : (currentRaga.scale[scaleIndex] ?? '')
            const westernName = WESTERN_SHARP[pitchClass]
            const westernDisplay =
              octave >= 5
                ? westernNoteForDisplayHTML(westernName + "'")
                : westernNoteForDisplayHTML(westernName)

            return (
              <div
                key={`w-${i}`}
                data-key-index={i}
                className={cn(
                  'piano-key white flex-1 min-w-0 relative flex flex-col justify-start items-stretch py-2 px-1 rounded-b-md cursor-default transition-all select-none h-full bg-white text-black z-0 mr-px',
                  inScale && 'highlighted cursor-pointer',
                  !inScale && 'dimmed',
                  scaleClass,
                  playingKey === i && 'playing'
                )}
                onClick={() => inScale && handleKeyClick(i)}
              >
                <span className="key-labels flex flex-row justify-between items-center mt-auto w-full min-w-0 p-1 gap-1 overflow-hidden">
                  <span className="carnatic text-xs font-bold hidden" aria-hidden>
                    {carnaticLabel}
                  </span>
                  <span
                    className="western text-[0.55rem] font-bold text-center"
                    dangerouslySetInnerHTML={{ __html: inScale ? westernDisplay : '' }}
                  />
                </span>
              </div>
            )
          })}
          {blackOffsets.map((i) => {
            const pitchClass = i % 12
            const octave = 4 + Math.floor(i / 12)
            const inScale =
              transposedKeyIndices.includes(pitchClass) &&
              i >= rootNote &&
              i <= rootNote + 12
            const scaleIndex = i === 12 + rootNote ? 7 : transposedKeyIndices.indexOf(pitchClass)
            const scaleClass = inScale ? getScaleClass(scaleIndex) : ''
            const carnaticLabel = scaleIndex === 7 ? 'Ṡ' : (currentRaga.scale[scaleIndex] ?? '')
            const westernName = WESTERN_SHARP[pitchClass]
            const westernDisplay =
              octave >= 5
                ? westernNoteForDisplayHTML(westernName + "'")
                : westernNoteForDisplayHTML(westernName)
            const pos = blackPositionMap[i]

            return (
              <div
                key={`b-${i}`}
                data-key-index={i}
                data-black-index={pos}
                className={cn(
                  'piano-key black absolute w-[6%] h-[62%] top-0 flex flex-col justify-start items-stretch py-2 px-1 rounded-b-md cursor-default transition-all select-none bg-gray-800 text-gray-200 z-[2]',
                  inScale && 'highlighted cursor-pointer',
                  !inScale && 'dimmed',
                  scaleClass,
                  playingKey === i && 'playing'
                )}
                style={{
                  left: pos === 1 ? '4.14%' : pos === 2 ? '11.28%' : pos === 3 ? '25.57%' : pos === 4 ? '32.71%' : pos === 5 ? '39.86%' : pos === 6 ? '54.14%' : pos === 7 ? '61.28%' : pos === 8 ? '75.57%' : pos === 9 ? '82.71%' : '89.86%',
                }}
                onClick={() => inScale && handleKeyClick(i)}
              >
                <span className="key-labels flex flex-row justify-between items-center mt-auto w-full min-w-0 p-1 gap-1 overflow-hidden">
                  <span className="carnatic text-[0.5rem] font-bold hidden" aria-hidden>
                    {carnaticLabel}
                  </span>
                  <span
                    className="western text-[0.5rem] font-bold text-white"
                    dangerouslySetInnerHTML={{ __html: inScale ? westernDisplay : '' }}
                  />
                </span>
              </div>
            )
          })}
        </div>
      </div>
      <div className="flex gap-2 justify-between items-center">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={handlePlayAsc}
          disabled={!audioUnlocked}
          aria-label="Play Arohanam"
        >
          <ArrowUp className="h-4 w-4" />
        </Button>
        <div className="flex items-center gap-1">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            aria-label="Previous transpose"
            onClick={() => useSettingsStore.getState().setRootNote((rootNote + 11) % 12)}
          >
            ◀
          </Button>
          <span className="text-sm font-bold text-foreground whitespace-nowrap" aria-live="polite">
            {rootNoteName}
          </span>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            aria-label="Next transpose"
            onClick={() => useSettingsStore.getState().setRootNote((rootNote + 1) % 12)}
          >
            ▶
          </Button>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={handlePlayDesc}
          disabled={!audioUnlocked}
          aria-label="Play Avarohanam"
        >
          <ArrowDown className="h-4 w-4" />
        </Button>
      </div>
    </section>
  )
}
