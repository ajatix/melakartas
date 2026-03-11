import { Dices } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useRagaStore } from '@/store/ragaStore'

export function RandomRagaButton() {
  const randomRaga = useRagaStore((s) => s.randomRaga)

  return (
    <Button
      type="button"
      variant="default"
      size="icon"
      onClick={randomRaga}
      aria-label="Random raga"
      className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg z-40 bg-amber-500 hover:bg-amber-600 text-amber-950"
    >
      <Dices className="h-6 w-6" />
    </Button>
  )
}
