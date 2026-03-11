import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { DialsSection } from '@/components/DialsSection'

describe('DialsSection', () => {
  it('renders three dials with M, R-G, D-N labels', () => {
    render(<DialsSection />)
    expect(screen.getByText('M1')).toBeInTheDocument()
    expect(screen.getByText('R1-G1')).toBeInTheDocument()
    expect(screen.getByText('D1-N1')).toBeInTheDocument()
  })

  it('increases M when M up is clicked', async () => {
    render(<DialsSection />)
    const mUp = screen.getByRole('button', { name: /increase m/i })
    await userEvent.click(mUp)
    expect(screen.getByText('M2')).toBeInTheDocument()
  })
})
