import * as React from 'react'
import { cn } from '@/lib/utils'

interface DialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  children: React.ReactNode
}

function Dialog({ open, onOpenChange, children }: DialogProps) {
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

  return <>{children}</>
}

function DialogPortal({ children }: { children: React.ReactNode }) {
  return children
}

function DialogOverlay({
  className,
  onClick,
  ...props
}: React.ComponentProps<'div'>) {
  return (
    <div
      className={cn(
        'fixed inset-0 z-50 bg-black/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
        className
      )}
      onClick={onClick}
      aria-hidden
      {...props}
    />
  )
}

interface DialogContentProps extends React.ComponentProps<'div'> {
  onClose?: () => void
  onPointerDownOutside?: () => void
  onEscapeKeyDown?: () => void
}

function DialogContent({
  className,
  children,
  onClose,
  onPointerDownOutside,
  onEscapeKeyDown,
  ...props
}: DialogContentProps) {
  const handleKeyDown = React.useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Escape') {
        onEscapeKeyDown?.()
        onClose?.()
      }
    },
    [onClose, onEscapeKeyDown]
  )

  React.useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onEscapeKeyDown?.()
        onClose?.()
      }
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [onClose, onEscapeKeyDown])

  return (
    <DialogPortal>
      <DialogOverlay onClick={onPointerDownOutside ?? onClose} />
      <div
        role="dialog"
        aria-modal="true"
        className={cn(
          'fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg',
          className
        )}
        onKeyDown={handleKeyDown}
        {...props}
      >
        {children}
      </div>
    </DialogPortal>
  )
}

function DialogHeader({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      className={cn('flex flex-col space-y-1.5 text-center sm:text-left', className)}
      {...props}
    />
  )
}

function DialogTitle({ className, ...props }: React.ComponentProps<'h2'>) {
  return (
    <h2
      className={cn('text-lg font-semibold leading-none tracking-tight', className)}
      {...props}
    />
  )
}

function DialogDescription({ className, ...props }: React.ComponentProps<'p'>) {
  return (
    <p className={cn('text-sm text-muted-foreground', className)} {...props} />
  )
}

export {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
}
