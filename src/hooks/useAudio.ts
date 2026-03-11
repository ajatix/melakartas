import { useRef, useCallback } from 'react'
import {
  getArohanamAvarohanam,
  getKeyIndicesInOrder,
  getFrequencyForKeyIndex,
} from '@/data/melakarta'
import type { Instrument } from '@/data/types'
import type { MelakartaRaga } from '@/data/types'

const whiteOffsets = [0, 2, 4, 5, 7, 9, 11, 12, 14, 16, 17, 19, 21, 23]
const blackOffsets = [1, 3, 6, 8, 10, 13, 15, 18, 20, 22]
const blackPositionMap: Record<number, number> = {
  1: 1, 3: 2, 6: 3, 8: 4, 10: 5, 13: 6, 15: 7, 18: 8, 20: 9, 22: 10,
}

export { whiteOffsets, blackOffsets, blackPositionMap }

function scheduleInstrumentNote(
  ctx: AudioContext,
  freq: number,
  durationSeconds: number,
  instrument: Instrument,
  reverbAmt: number,
  dryGain: GainNode,
  reverbGain: GainNode,
  reverbConvolver: ConvolverNode | null
) {
  const now = ctx.currentTime
  const gain = ctx.createGain()
  gain.gain.setValueAtTime(0, now)

  const connectToDestination = (src: AudioNode) => {
    src.connect(gain)
    gain.connect(dryGain)
    if (reverbConvolver) src.connect(reverbConvolver)
    dryGain.gain.setValueAtTime(1 - reverbAmt, now)
    reverbGain.gain.setValueAtTime(reverbAmt, now)
  }

  if (instrument === 'piano') {
    const osc = ctx.createOscillator()
    osc.type = 'triangle'
    osc.frequency.value = freq
    const osc2 = ctx.createOscillator()
    osc2.type = 'sine'
    osc2.frequency.value = freq * 2.5
    const gain2 = ctx.createGain()
    gain2.gain.setValueAtTime(0.15, now)
    osc.connect(gain)
    osc2.connect(gain2)
    gain2.connect(gain)
    gain.gain.setValueAtTime(0.25, now)
    gain.gain.exponentialRampToValueAtTime(0.01, now + durationSeconds * 0.9)
    osc.start(now)
    osc.stop(now + durationSeconds)
    osc2.start(now)
    osc2.stop(now + durationSeconds * 0.4)
    connectToDestination(gain)
    return
  }

  if (instrument === 'guitar') {
    const decay = Math.min(0.4, durationSeconds * 1.2)
    const osc = ctx.createOscillator()
    osc.type = 'triangle'
    osc.frequency.value = freq
    const filter = ctx.createBiquadFilter()
    filter.type = 'lowpass'
    filter.frequency.setValueAtTime(2000, now)
    filter.frequency.exponentialRampToValueAtTime(400, now + decay * 0.3)
    filter.Q.value = 2
    gain.gain.setValueAtTime(0.35, now)
    gain.gain.exponentialRampToValueAtTime(0.01, now + decay)
    osc.connect(filter)
    filter.connect(gain)
    osc.start(now)
    osc.stop(now + decay)
    connectToDestination(gain)
    return
  }

  if (instrument === 'veena') {
    const attack = 0.02
    const release = Math.min(0.8, durationSeconds * 1.5)
    const osc = ctx.createOscillator()
    osc.type = 'sine'
    osc.frequency.value = freq
    const osc2 = ctx.createOscillator()
    osc2.type = 'sine'
    osc2.frequency.value = freq * 0.5
    const gain2 = ctx.createGain()
    gain2.gain.setValueAtTime(0.12, now)
    osc.connect(gain)
    osc2.connect(gain2)
    gain2.connect(gain)
    gain.gain.setValueAtTime(0, now)
    gain.gain.linearRampToValueAtTime(0.22, now + attack)
    gain.gain.exponentialRampToValueAtTime(0.01, now + release)
    osc.start(now)
    osc.stop(now + release)
    osc2.start(now)
    osc2.stop(now + release)
    connectToDestination(gain)
    return
  }

  if (instrument === 'violin') {
    const attack = 0.05
    const release = Math.min(0.6, durationSeconds * 1.2)
    const osc = ctx.createOscillator()
    osc.type = 'sawtooth'
    osc.frequency.value = freq
    const filter = ctx.createBiquadFilter()
    filter.type = 'lowpass'
    filter.frequency.value = 2800
    filter.Q.value = 1
    const vibrato = ctx.createOscillator()
    vibrato.type = 'sine'
    vibrato.frequency.value = 5
    vibrato.start(now)
    vibrato.stop(now + release)
    const vibGain = ctx.createGain()
    vibGain.gain.value = freq * 0.008
    vibrato.connect(vibGain)
    vibGain.connect(osc.frequency)
    gain.gain.setValueAtTime(0, now)
    gain.gain.linearRampToValueAtTime(0.12, now + attack)
    gain.gain.exponentialRampToValueAtTime(0.01, now + release)
    osc.connect(filter)
    filter.connect(gain)
    osc.start(now)
    osc.stop(now + release)
    connectToDestination(gain)
    return
  }

  const osc = ctx.createOscillator()
  osc.type = 'sine'
  osc.frequency.value = freq
  gain.gain.setValueAtTime(0.2, now)
  gain.gain.exponentialRampToValueAtTime(0.01, now + durationSeconds)
  osc.connect(gain)
  osc.start(now)
  osc.stop(now + durationSeconds)
  connectToDestination(gain)
}

function buildReverb(ctx: AudioContext) {
  const sampleRate = ctx.sampleRate
  const length = Math.min(2 * sampleRate, 88200)
  const impulse = ctx.createBuffer(2, length, sampleRate)
  const left = impulse.getChannelData(0)
  const right = impulse.getChannelData(1)
  const decay = 2.5
  for (let i = 0; i < length; i++) {
    const t = i / sampleRate
    const d = Math.exp(-t * decay)
    left[i] = (Math.random() * 2 - 1) * d
    right[i] = (Math.random() * 2 - 1) * d
  }
  const convolver = ctx.createConvolver()
  convolver.buffer = impulse
  convolver.normalize = true
  const reverbGain = ctx.createGain()
  reverbGain.gain.value = 0
  const dryGain = ctx.createGain()
  dryGain.gain.value = 1
  convolver.connect(reverbGain)
  reverbGain.connect(ctx.destination)
  dryGain.connect(ctx.destination)
  return { convolver, reverbGain, dryGain }
}

export function useAudio() {
  const ctxRef = useRef<AudioContext | null>(null)
  const reverbRef = useRef<ReturnType<typeof buildReverb> | null>(null)
  const playbackTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const ensureContext = useCallback((): AudioContext => {
    if (!ctxRef.current) {
      const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
      ctxRef.current = new Ctx()
      reverbRef.current = buildReverb(ctxRef.current)
    }
    const ctx = ctxRef.current
    if (ctx.state === 'suspended') {
      ctx.resume()
    }
    return ctx
  }, [])

  const playNote = useCallback(
    (
      pitchIndex: number,
      durationSeconds: number,
      instrument: Instrument,
      reverbPct: number,
      rootNote: number,
      onKeyLit?: (keyIndex: number, durationMs: number) => void,
      octave = 4
    ) => {
      const ctx = ensureContext()
      const reverb = reverbRef.current
      const reverbAmt = Math.max(0, Math.min(1, reverbPct / 100))
      const freq = getFrequencyForKeyIndex(pitchIndex, octave)
      scheduleInstrumentNote(
        ctx,
        freq,
        durationSeconds,
        instrument,
        reverbAmt,
        reverb!.dryGain,
        reverb!.reverbGain,
        reverb!.convolver
      )
      const keyToHighlight = octave >= 5 ? 12 + pitchIndex : pitchIndex
      onKeyLit?.(keyToHighlight, durationSeconds * 1000)
    },
    [ensureContext]
  )

  const playScale = useCallback(
    (
      ascending: boolean,
      raga: MelakartaRaga,
      bpm: number,
      rootNote: number,
      instrument: Instrument,
      reverbPct: number,
      setKeyPlaying: (keyIndex: number, durationMs: number) => void
    ) => {
      const aa = getArohanamAvarohanam(raga.scale)
      const arohanamKeys = getKeyIndicesInOrder(aa.arohanam)
      const noteDuration = 60 / Math.max(40, Math.min(240, bpm))
      const noteMs = noteDuration * 1000

      const sequence: { pitchIndex: number; octave: number }[] = []
      for (let i = 0; i < arohanamKeys.length; i++) {
        const pitchIndex = (arohanamKeys[i] + rootNote) % 12
        sequence.push({ pitchIndex, octave: 4 })
      }
      sequence.push({ pitchIndex: rootNote, octave: 5 })
      for (let i = 1; i < sequence.length; i++) {
        const prev = sequence[i - 1]
        const curr = sequence[i]
        const prevMidi = prev.octave * 12 + prev.pitchIndex
        const currMidi = curr.octave * 12 + curr.pitchIndex
        if (currMidi <= prevMidi) sequence[i].octave = 5
      }

      const order = ascending ? sequence : [...sequence].reverse()

      const playNext = (idx: number) => {
        if (idx >= order.length) return
        const step = order[idx]
        playNote(
          step.pitchIndex,
          noteDuration * 0.9,
          instrument,
          reverbPct,
          rootNote,
          (keyIndex, durationMs) => setKeyPlaying(keyIndex, durationMs),
          step.octave
        )
        playbackTimeoutRef.current = setTimeout(() => playNext(idx + 1), noteMs)
      }

      if (playbackTimeoutRef.current) {
        clearTimeout(playbackTimeoutRef.current)
        playbackTimeoutRef.current = null
      }
      playNext(0)
    },
    [playNote]
  )

  const stopPlayback = useCallback(() => {
    if (playbackTimeoutRef.current) {
      clearTimeout(playbackTimeoutRef.current)
      playbackTimeoutRef.current = null
    }
  }, [])

  return { ensureContext, playNote, playScale, stopPlayback }
}
