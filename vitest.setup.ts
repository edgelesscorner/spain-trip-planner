import { afterEach } from 'vitest'
import { cleanup } from '@testing-library/react'

// Unmount React trees between tests (globals are off, so do it explicitly).
afterEach(() => {
  cleanup()
})
