import * as React from 'react'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from './button'

interface SheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  children: React.ReactNode
  side?: 'left' | 'right'
  title?: string
  className?: string
  zIndex?: number
}

function Sheet({ open, onOpenChange, children, side = 'right', title, className, zIndex = 50 }: SheetProps) {
  React.useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  if (!open) return null

  return (
    <>
      <div
        className="fixed inset-0 bg-black"
        style={{ zIndex }}
        aria-hidden
        onClick={() => onOpenChange(false)}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title ?? 'Sheet'}
        className={cn(
          'fixed flex flex-col gap-4 bg-background p-6 shadow-lg transition ease-in-out data-[state=open]:animate-in data-[state=closed]:animate-out',
          side === 'right' && 'inset-y-0 right-0 h-full w-full max-w-sm border-l border-border',
          side === 'left' && 'inset-y-0 left-0 h-full w-full max-w-sm border-r border-border',
          className
        )}
        style={{ zIndex }}
      >
        <div className="flex items-center justify-between">
          {title && <h2 className="text-lg font-semibold">{title}</h2>}
          <Button
            variant="ghost"
            size="icon"
            aria-label="Close"
            onClick={() => onOpenChange(false)}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
        <div className="flex-1 overflow-auto">{children}</div>
      </div>
    </>
  )
}

export { Sheet }
