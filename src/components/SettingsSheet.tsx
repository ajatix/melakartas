import { Piano, Guitar, Music, KeyboardMusic } from 'lucide-react'
import { Sheet } from '@/components/ui/sheet'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Slider } from '@/components/ui/slider'
import { Button } from '@/components/ui/button'
import { useUIStore } from '@/store/uiStore'
import { useSettingsStore } from '@/store/settingsStore'
import { WESTERN_NOTES } from '@/data/melakarta'
import type { Instrument } from '@/data/types'

const INSTRUMENTS: { id: Instrument; label: string; icon: React.ReactNode }[] = [
  { id: 'piano', label: 'Piano', icon: <Piano className="h-5 w-5" /> },
  { id: 'guitar', label: 'Guitar', icon: <Guitar className="h-5 w-5" /> },
  { id: 'veena', label: 'Veena', icon: <Music className="h-5 w-5" /> },
  { id: 'violin', label: 'Violin', icon: <KeyboardMusic className="h-5 w-5" /> },
]

export function SettingsSheet() {
  const { settingsOpen, setSettingsOpen } = useUIStore()
  const { bpm, reverb, rootNote, instrument, setBpm, setReverb, setRootNote, setInstrument } =
    useSettingsStore()

  return (
    <Sheet
      open={settingsOpen}
      onOpenChange={setSettingsOpen}
      side="right"
      title="Settings"
      className="border-none"
    >
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="bpm">Tempo (BPM)</Label>
          <Input
            id="bpm"
            type="number"
            min={40}
            max={240}
            value={bpm}
            onChange={(e) => setBpm(Number(e.target.value) || 80)}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label>Reverb</Label>
          <div className="flex items-center gap-2">
            <Slider
              min={0}
              max={100}
              value={reverb}
              onValueChange={setReverb}
              aria-label="Reverb amount"
              className="flex-1"
            />
            <span className="text-sm text-muted-foreground w-10">{reverb}%</span>
          </div>
        </div>
        <div className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-muted-foreground">
            Transpose Starting Sa
          </span>
          <div className="flex flex-wrap gap-1.5" role="radiogroup" aria-label="Root note">
            {WESTERN_NOTES.map((note, i) => (
              <Button
                key={note}
                type="button"
                variant={rootNote === i ? 'default' : 'outline'}
                size="sm"
                className="min-w-[2.25rem]"
                aria-label={`Starting Sa: ${note}`}
                onClick={() => setRootNote(i)}
              >
                {note}
              </Button>
            ))}
          </div>
        </div>
        <div className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-muted-foreground">Instrument</span>
          <div className="flex flex-wrap gap-2" role="group" aria-label="Instrument sound">
            {INSTRUMENTS.map(({ id, label, icon }) => (
              <Button
                key={id}
                type="button"
                variant={instrument === id ? 'default' : 'outline'}
                size="icon"
                className="h-11 w-11"
                aria-label={label}
                title={label}
                onClick={() => setInstrument(id)}
              >
                {icon}
              </Button>
            ))}
          </div>
        </div>
      </div>
    </Sheet>
  )
}
