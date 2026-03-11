import { useMemo, useCallback, useState, useEffect } from 'react'
import { ChevronDown } from 'lucide-react'
import { MELAKARTA } from '@/data/melakarta'
import { useRagaStore } from '@/store/ragaStore'
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export function RagaCombobox() {
  const { currentRaga, setRagaByIndex } = useRagaStore()
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')

  const filtered = useMemo(() => {
    const q = (search ?? '').trim().toLowerCase()
    if (!q) return MELAKARTA
    return MELAKARTA.filter(
      (r) =>
        (r.name && r.name.toLowerCase().includes(q)) || String(r.index).includes(q)
    )
  }, [search])

  const handleSelect = useCallback(
    (index: number) => {
      setRagaByIndex(index)
      setOpen(false)
      setSearch('')
    },
    [setRagaByIndex]
  )

  useEffect(() => {
    if (!open) setSearch('')
  }, [open])

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          aria-label="Select raga"
          className="w-full justify-between font-normal"
        >
          <span className="truncate">
            {currentRaga.index}. {currentRaga.name}
          </span>
          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-full p-0">
        <div className="p-1 border-b border-border">
          <Input
            placeholder="Search ragas..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            autoComplete="off"
            aria-label="Search ragas"
            className="h-8 border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0"
          />
        </div>
        <ul
          className="max-h-[200px] overflow-y-auto py-1"
          role="listbox"
          aria-label="Raga list"
        >
          {filtered.map((r) => (
            <li
              key={r.index}
              role="option"
              aria-selected={r.index === currentRaga.index}
              className={cn(
                'cursor-pointer px-2 py-1.5 text-sm outline-none',
                'hover:bg-accent hover:text-accent-foreground',
                r.index === currentRaga.index && 'bg-accent text-accent-foreground'
              )}
              onClick={() => handleSelect(r.index)}
            >
              {r.index}. {r.name}
            </li>
          ))}
        </ul>
      </PopoverContent>
    </Popover>
  )
}
