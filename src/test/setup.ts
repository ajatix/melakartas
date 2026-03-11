import '@testing-library/jest-dom'
import { expect, afterEach, vi } from 'vitest'
import { cleanup } from '@testing-library/react'

afterEach(() => {
  cleanup()
})

vi.stubGlobal('AudioContext', vi.fn())
vi.stubGlobal('webkitAudioContext', vi.fn())
