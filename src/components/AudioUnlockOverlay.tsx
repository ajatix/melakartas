import { useUIStore } from '@/store/uiStore'
import { useAudio } from '@/hooks/useAudio'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

export function AudioUnlockOverlay() {
  const { audioUnlocked, setAudioUnlocked } = useUIStore()
  const { ensureContext } = useAudio()

  const unlock = () => {
    ensureContext()
    setAudioUnlocked(true)
  }

  return (
    <Dialog open={!audioUnlocked} onOpenChange={(open) => { if (!open) unlock() }}>
      <DialogContent
        onPointerDownOutside={unlock}
        onEscapeKeyDown={unlock}
        onClose={unlock}
        className="sm:max-w-md"
      >
        <DialogHeader>
          <DialogTitle>Enable sound</DialogTitle>
          <DialogDescription>
            Required for piano and playback on this device. Tap the button or anywhere outside to continue.
          </DialogDescription>
        </DialogHeader>
        <Button
          type="button"
          onClick={unlock}
          onTouchEnd={(e) => {
            e.preventDefault()
            unlock()
          }}
          className="w-full mt-2"
        >
          Tap to enable sound
        </Button>
      </DialogContent>
    </Dialog>
  )
}
