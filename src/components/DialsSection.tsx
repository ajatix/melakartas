import { useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { useRagaStore } from '@/store/ragaStore'
import { RG_LABELS, DN_LABELS } from '@/data/melakarta'
import { cn } from '@/lib/utils'

export function DialsSection() {
  const { rg, m, dn, setRagaByCoords } = useRagaStore()

  const handleMUp = useCallback(() => {
    setRagaByCoords(rg, m === 1 ? 0 : 1, dn)
  }, [rg, m, dn, setRagaByCoords])

  const handleMDown = useCallback(() => {
    setRagaByCoords(rg, m === 0 ? 1 : 0, dn)
  }, [rg, m, dn, setRagaByCoords])

  const handleRgUp = useCallback(() => {
    if (rg === 5) {
      setRagaByCoords(0, m === 1 ? 0 : 1, dn)
    } else {
      setRagaByCoords(rg + 1, m, dn)
    }
  }, [rg, m, dn, setRagaByCoords])

  const handleRgDown = useCallback(() => {
    if (rg === 0) {
      setRagaByCoords(5, m === 0 ? 1 : 0, dn)
    } else {
      setRagaByCoords(rg - 1, m, dn)
    }
  }, [rg, m, dn, setRagaByCoords])

  const handleDnUp = useCallback(() => {
    if (dn === 5) {
      if (rg === 5) {
        setRagaByCoords(0, m === 1 ? 0 : 1, 0)
      } else {
        setRagaByCoords(rg + 1, m, 0)
      }
    } else {
      setRagaByCoords(rg, m, dn + 1)
    }
  }, [rg, m, dn, setRagaByCoords])

  const handleDnDown = useCallback(() => {
    if (dn === 0) {
      if (rg === 0) {
        setRagaByCoords(5, m === 0 ? 1 : 0, 5)
      } else {
        setRagaByCoords(rg - 1, m, 5)
      }
    } else {
      setRagaByCoords(rg, m, dn - 1)
    }
  }, [rg, m, dn, setRagaByCoords])

  return (
    <section className="flex-none" aria-label="Raga selector dials">
      <div className="flex flex-wrap items-start justify-between gap-2 py-2 px-2">
        <div className={cn('flex flex-col items-center gap-1 [--dial-color:theme(colors.sky.500)]')}>
          <div className="flex flex-col items-center gap-0.5">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label="Increase M"
              className="text-[var(--dial-color)]"
              onClick={handleMUp}
            >
              ▲
            </Button>
            <div className="flex items-center justify-center min-w-[3rem]">
              <span className="text-lg font-bold text-center text-[var(--dial-color)]">
                {m === 0 ? 'M1' : 'M2'}
              </span>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label="Decrease M"
              className="text-[var(--dial-color)]"
              onClick={handleMDown}
            >
              ▼
            </Button>
          </div>
          <span className="text-xs text-center text-[var(--dial-color)]">Madhyamam</span>
        </div>

        <div className={cn('flex flex-col items-center gap-1 [--dial-color:theme(colors.emerald.500)]')}>
          <div className="flex flex-col items-center gap-0.5">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label="Increase R-G"
              className="text-[var(--dial-color)]"
              onClick={handleRgUp}
            >
              ▲
            </Button>
            <div className="flex items-center justify-center min-w-[3rem]">
              <span className="text-lg font-bold text-center text-[var(--dial-color)]">
                {RG_LABELS[rg]}
              </span>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label="Decrease R-G"
              className="text-[var(--dial-color)]"
              onClick={handleRgDown}
            >
              ▼
            </Button>
          </div>
          <span className="text-xs text-center text-[var(--dial-color)] flex flex-col leading-tight">
            <span>Rishabham</span>
            <span>Gandharam</span>
          </span>
        </div>

        <div className={cn('flex flex-col items-center gap-1 [--dial-color:theme(colors.violet.500)]')}>
          <div className="flex flex-col items-center gap-0.5">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label="Increase D-N"
              className="text-[var(--dial-color)]"
              onClick={handleDnUp}
            >
              ▲
            </Button>
            <span className="text-lg font-bold text-[var(--dial-color)]">{DN_LABELS[dn]}</span>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label="Decrease D-N"
              className="text-[var(--dial-color)]"
              onClick={handleDnDown}
            >
              ▼
            </Button>
          </div>
          <span className="text-xs text-center text-[var(--dial-color)] flex flex-col leading-tight">
            <span>Dhaivatam</span>
            <span>Nishadam</span>
          </span>
        </div>
      </div>
    </section>
  )
}
