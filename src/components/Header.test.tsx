import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Header } from '@/components/Header'
import { useUIStore } from '@/store/uiStore'

describe('Header', () => {
  it('renders title and settings button', () => {
    render(<Header />)
    expect(screen.getByRole('heading', { name: /melakartas in carnatic music/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /open settings/i })).toBeInTheDocument()
  })

  it('opens settings when settings button is clicked', async () => {
    useUIStore.setState({ settingsOpen: false })
    render(<Header />)
    await userEvent.click(screen.getByRole('button', { name: /open settings/i }))
    expect(useUIStore.getState().settingsOpen).toBe(true)
  })
})
