import * as React from 'react'
import { cn } from '@/lib/utils'

const PopoverContext = React.createContext<{
  open: boolean
  setOpen: (open: boolean) => void
  triggerRef: React.RefObject<HTMLButtonElement | null>
  wrapperRef: React.RefObject<HTMLDivElement | null>
} | null>(null)

interface PopoverProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  children: React.ReactNode
}

function Popover({ open: controlledOpen, onOpenChange, children }: PopoverProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(false)
  const wrapperRef = React.useRef<HTMLDivElement>(null)
  const triggerRef = React.useRef<HTMLButtonElement | null>(null)
  const isControlled = controlledOpen !== undefined
  const open = isControlled ? controlledOpen : uncontrolledOpen
  const setOpen = React.useCallback(
    (next: boolean) => {
      if (!isControlled) setUncontrolledOpen(next)
      onOpenChange?.(next)
    },
    [isControlled, onOpenChange]
  )
  return (
    <PopoverContext.Provider value={{ open, setOpen, triggerRef, wrapperRef }}>
      <div ref={wrapperRef} className="relative">
        {children}
      </div>
    </PopoverContext.Provider>
  )
}

interface PopoverTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean
}

const PopoverTrigger = React.forwardRef<HTMLButtonElement, PopoverTriggerProps>(
  ({ className, asChild, children, ...props }, ref) => {
    const ctx = React.useContext(PopoverContext)
    if (!ctx) throw new Error('PopoverTrigger must be used within Popover')
    const { open, setOpen, triggerRef } = ctx
    const mergedRef = (el: HTMLButtonElement | null) => {
      (triggerRef as React.MutableRefObject<HTMLButtonElement | null>).current = el
      if (typeof ref === 'function') ref(el)
      else if (ref) (ref as React.MutableRefObject<HTMLButtonElement | null>).current = el
    }
    if (asChild && React.isValidElement(children)) {
      return React.cloneElement(children as React.ReactElement<{ ref?: React.Ref<unknown>; onClick?: () => void }>, {
        ref: mergedRef,
        onClick: (e: React.MouseEvent) => {
          setOpen(!open)
          ;(children as React.ReactElement<{ onClick?: (e: React.MouseEvent) => void }>).props?.onClick?.(e)
        },
      })
    }
    return (
      <button
        ref={mergedRef}
        type="button"
        aria-expanded={open}
        aria-haspopup="listbox"
        className={cn(className)}
        onClick={() => setOpen(!open)}
        {...props}
      >
        {children}
      </button>
    )
  }
)
PopoverTrigger.displayName = 'PopoverTrigger'

interface PopoverContentProps extends React.HTMLAttributes<HTMLDivElement> {
  onCloseAutoFocus?: (e: Event) => void
  align?: 'start' | 'center' | 'end'
  sideOffset?: number
}

const PopoverContent = React.forwardRef<HTMLDivElement, PopoverContentProps>(
  ({ className, align = 'start', sideOffset = 4, children, ...props }, ref) => {
    const ctx = React.useContext(PopoverContext)
    const contentRef = React.useRef<HTMLDivElement>(null)
    const mergedRef = (el: HTMLDivElement | null) => {
      (contentRef as React.MutableRefObject<HTMLDivElement | null>).current = el
      if (typeof ref === 'function') ref(el)
      else if (ref) (ref as React.MutableRefObject<HTMLDivElement | null>).current = el
    }
    if (!ctx) throw new Error('PopoverContent must be used within Popover')
    const { open, setOpen, wrapperRef } = ctx

    React.useEffect(() => {
      if (!open) return
      const handle = (e: KeyboardEvent) => {
        if (e.key === 'Escape') setOpen(false)
      }
      document.addEventListener('keydown', handle)
      return () => document.removeEventListener('keydown', handle)
    }, [open, setOpen])

    React.useEffect(() => {
      if (!open) return
      const handle = (e: MouseEvent) => {
        const target = e.target as Node
        if (wrapperRef.current && !wrapperRef.current.contains(target)) setOpen(false)
      }
      document.addEventListener('mousedown', handle)
      return () => document.removeEventListener('mousedown', handle)
    }, [open, setOpen, wrapperRef])

    if (!open) return null
    return (
      <div
        ref={mergedRef}
        role="presentation"
        className={cn(
          'absolute z-50 mt-1 w-full min-w-[8rem] overflow-hidden rounded-md border border-border bg-popover p-1 text-popover-foreground shadow-md',
          align === 'start' && 'left-0',
          align === 'center' && 'left-1/2 -translate-x-1/2',
          align === 'end' && 'right-0',
          className
        )}
        style={{ top: '100%', marginTop: sideOffset }}
        {...props}
      >
        {children}
      </div>
    )
  }
)
PopoverContent.displayName = 'PopoverContent'

export { Popover, PopoverTrigger, PopoverContent }
