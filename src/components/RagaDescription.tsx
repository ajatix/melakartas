import { useState, useMemo } from 'react'
import {
  getArohanamAvarohanam,
  getRagaInfo,
  getKeyIndicesForScale,
  CHAKRA_NAMES,
} from '@/data/melakarta'
import { useRagaStore } from '@/store/ragaStore'
import { useSettingsStore } from '@/store/settingsStore'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Sheet } from '@/components/ui/sheet'
import { SamePitchSetMatches, useGrahaBhedamMatches } from '@/components/GrahaBhedam'
import { Info } from 'lucide-react'

function base6Format(m: number, rg: number, dn: number): string {
  return `${m}${rg}${dn}₆`
}

function base6Value(m: number, rg: number, dn: number): number {
  return m * 36 + rg * 6 + dn
}

export function RagaDescription() {
  const { currentRaga } = useRagaStore()
  const { rootNote } = useSettingsStore()
  const [detailsOpen, setDetailsOpen] = useState(false)

  const aa = getArohanamAvarohanam(currentRaga.scale)
  const info = getRagaInfo(currentRaga.index)
  const chakraIndex = currentRaga.m * 6 + currentRaga.rg
  const chakraName = CHAKRA_NAMES[chakraIndex] ?? ''

  const arohanamText = aa.arohanam.join(' ') + ' Ṡ'
  const avarohanamText = 'Ṡ ' + aa.avarohanam.join(' ')

  const transposedKeyIndices = useMemo(
    () =>
      getKeyIndicesForScale(currentRaga.scale).map((k) => (k + rootNote) % 12),
    [currentRaga.scale, rootNote]
  )
  const grahaBhedamMatches = useGrahaBhedamMatches(
    currentRaga,
    rootNote,
    transposedKeyIndices
  )
  const hasGrahaBhedam = grahaBhedamMatches.length > 0

  const base6Display = base6Format(currentRaga.m, currentRaga.rg, currentRaga.dn)
  const base6Val = base6Value(currentRaga.m, currentRaga.rg, currentRaga.dn)

  const detailRows = [
    { label: 'Chakra', value: chakraName, mono: false as const },
    { label: 'Base6', value: `${base6Display} (${base6Val})`, mono: true as const },
    { label: 'Arohanam', value: arohanamText, mono: true as const },
    { label: 'Avarohanam', value: avarohanamText, mono: true as const },
    ...(info.phrase ? [{ label: 'Description', value: info.phrase, mono: false as const }] : []),
    ...(info.hindustani != null ? [{ label: 'Hindustani', value: info.hindustani, mono: false as const }] : []),
    { label: 'Origin', value: info.composerYear, mono: false as const },
    { label: 'Time', value: info.timeOfDay, mono: false as const },
  ]

  return (
    <>
      <Card className="flex-1 flex flex-col min-h-0">
        <CardHeader className="flex flex-row items-center justify-between gap-4 py-3">
          <div className="flex flex-col gap-0.5 min-w-0">
            <CardTitle className="text-xl">{currentRaga.name}</CardTitle>
            <span className="text-sm text-muted-foreground">Raga {currentRaga.index}</span>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => setDetailsOpen(true)}
            aria-label="View raga details"
          >
            <Info className="h-4 w-4 mr-1" />
          </Button>
        </CardHeader>
        <CardContent className="pt-0">
          {hasGrahaBhedam && (
            <div className="w-full">
              <p className="text-sm font-medium text-muted-foreground mb-2 border-t pt-2">Graha Bhedam</p>
              <SamePitchSetMatches
                currentRaga={currentRaga}
                rootNote={rootNote}
                transposedKeyIndices={transposedKeyIndices}
              />
            </div>
          )}
        </CardContent>
      </Card>

      <Sheet
        open={detailsOpen}
        onOpenChange={setDetailsOpen}
        side="right"
        title={currentRaga.name}
        className="border-none bg-transparent"
      >
        <dl className="space-y-3 text-sm">
          {detailRows.map(({ label, value, mono }) => (
            <div key={label} className="flex gap-2">
              <dt className="text-muted-foreground shrink-0 w-28">{label}:</dt>
              <dd className={mono ? 'font-mono text-muted-foreground' : 'text-muted-foreground/90'}>
                {value}
              </dd>
            </div>
          ))}
        </dl>
      </Sheet>
    </>
  )
}
