import * as React from 'react'
import { cn } from '@/lib/utils'

export interface SliderProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  value?: number
  onValueChange?: (value: number) => void
  min?: number
  max?: number
  step?: number
}

const Slider = React.forwardRef<HTMLInputElement, SliderProps>(
  ({ className, value = 0, onValueChange, min = 0, max = 100, step = 1, ...props }, ref) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const v = Number(e.target.value)
      onValueChange?.(v)
    }
    return (
      <input
        type="range"
        ref={ref}
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={handleChange}
        className={cn(
          'w-full h-2 rounded-full appearance-none cursor-pointer bg-secondary accent-primary',
          className
        )}
        {...props}
      />
    )
  }
)
Slider.displayName = 'Slider'

export { Slider }
