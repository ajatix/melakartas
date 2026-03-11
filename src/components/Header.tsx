import { Settings } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useUIStore } from '@/store/uiStore'

export function Header() {
  const setSettingsOpen = useUIStore((s) => s.setSettingsOpen)

  return (
    <header className="flex-none px-4 py-3 bg-blue-950 flex items-center justify-between gap-4">
      <h1 className="m-0 text-lg font-semibold">Melakartas in Carnatic Music</h1>
      <Button
        type="button"
        variant="secondary"
        size="sm"
        aria-label="Open settings"
        onClick={() => setSettingsOpen(true)}
      >
        <Settings className="h-4 w-4" />
        Settings
      </Button>
    </header>
  )
}
