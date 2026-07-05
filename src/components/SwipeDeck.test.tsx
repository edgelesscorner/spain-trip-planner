import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import SwipeDeck from './SwipeDeck'
import { usePlanner } from '../store/planner'
import type { CardPlace } from '../lib/catalog'

// jsdom has no PointerEvent, so clientX/clientY never reach the handlers. Back it
// with MouseEvent (which carries them) and no-op pointer capture.
class FakePointerEvent extends MouseEvent {
  pointerId: number
  constructor(type: string, props: PointerEventInit = {}) {
    super(type, props)
    this.pointerId = props.pointerId ?? 1
  }
}
;(globalThis as unknown as { PointerEvent: typeof PointerEvent }).PointerEvent =
  FakePointerEvent as unknown as typeof PointerEvent
type Cap = { setPointerCapture?: unknown; releasePointerCapture?: unknown }
if (!(HTMLElement.prototype as Cap).setPointerCapture) {
  ;(HTMLElement.prototype as Cap).setPointerCapture = () => {}
  ;(HTMLElement.prototype as Cap).releasePointerCapture = () => {}
}

function card(id: string): CardPlace {
  return {
    id,
    category: 'eat',
    name: id,
    town: 'Town',
    why: '',
    tags: [],
    badges: [],
    photos: [],
    isDiscovered: false,
  }
}

function area(container: HTMLElement): HTMLElement {
  return container.querySelector('.touch-pan-y') as HTMLElement
}

beforeEach(() => usePlanner.setState({ saved: {} }))

describe('SwipeDeck — swipe gestures', () => {
  it('drag right keeps (saves) the card and advances', async () => {
    const { container } = render(<SwipeDeck cards={[card('a'), card('b')]} />)
    expect(screen.getByText('1 of 2')).toBeTruthy()
    const el = area(container)
    fireEvent.pointerDown(el, { clientX: 100, clientY: 100, pointerId: 1 })
    fireEvent.pointerMove(el, { clientX: 180, clientY: 100, pointerId: 1 })
    fireEvent.pointerMove(el, { clientX: 260, clientY: 100, pointerId: 1 })
    fireEvent.pointerUp(el, { clientX: 260, clientY: 100, pointerId: 1 })
    await waitFor(() => expect(usePlanner.getState().saved['a']).toBeTruthy())
    await waitFor(() => expect(screen.getByText('2 of 2')).toBeTruthy())
  })

  it('drag left skips without saving', async () => {
    const { container } = render(<SwipeDeck cards={[card('a'), card('b')]} />)
    const el = area(container)
    fireEvent.pointerDown(el, { clientX: 200, clientY: 100, pointerId: 1 })
    fireEvent.pointerMove(el, { clientX: 120, clientY: 100, pointerId: 1 })
    fireEvent.pointerMove(el, { clientX: 50, clientY: 100, pointerId: 1 })
    fireEvent.pointerUp(el, { clientX: 50, clientY: 100, pointerId: 1 })
    await waitFor(() => expect(screen.getByText('2 of 2')).toBeTruthy())
    expect(usePlanner.getState().saved['a']).toBeFalsy()
  })

  it('a small drag snaps back — no save, no advance', () => {
    const { container } = render(<SwipeDeck cards={[card('a'), card('b')]} />)
    const el = area(container)
    fireEvent.pointerDown(el, { clientX: 100, clientY: 100, pointerId: 1 })
    fireEvent.pointerMove(el, { clientX: 128, clientY: 100, pointerId: 1 })
    fireEvent.pointerUp(el, { clientX: 128, clientY: 100, pointerId: 1 })
    expect(screen.getByText('1 of 2')).toBeTruthy()
    expect(usePlanner.getState().saved['a']).toBeFalsy()
  })

  it('a mostly-vertical drag scrolls instead of swiping', () => {
    const { container } = render(<SwipeDeck cards={[card('a'), card('b')]} />)
    const el = area(container)
    fireEvent.pointerDown(el, { clientX: 100, clientY: 100, pointerId: 1 })
    fireEvent.pointerMove(el, { clientX: 108, clientY: 220, pointerId: 1 })
    fireEvent.pointerUp(el, { clientX: 108, clientY: 220, pointerId: 1 })
    expect(screen.getByText('1 of 2')).toBeTruthy()
    expect(usePlanner.getState().saved['a']).toBeFalsy()
  })
})
