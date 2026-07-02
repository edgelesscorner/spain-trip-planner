import { describe, it, expect, afterEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import CategoryPage from './CategoryPage'
import { EAT, DO } from '../data/seed'
import { usePlanner } from '../store/planner'

function renderedNames(container: HTMLElement): string[] {
  return Array.from(
    container.querySelectorAll('[data-testid="place-name"]'),
  ).map((el) => el.textContent ?? '')
}

afterEach(() => {
  usePlanner.setState({ liveHotels: [], hotelsFetchedAt: 0 })
})

describe('Stay feed shows all live, AC hotels at the actual price', () => {
  it('renders curated + non-curated live hotels with the actual nightly price', () => {
    // Simulate the live hotel list from the proxy (curated + a Google-only one).
    usePlanner.setState({
      liveHotels: [
        {
          id: 'maria-cristina',
          curated: false,
          leg: 'basque',
          name: 'Hotel María Cristina',
          town: 'San Sebastián',
          nightlyUSD: 270,
        },
        {
          id: 'gran-hotel-soller',
          curated: false,
          leg: 'balearic',
          name: 'Gran Hotel Sóller',
          town: 'Sóller',
          nightlyUSD: 383,
        },
      ],
      hotelsFetchedAt: Date.now(),
    })

    const { container } = render(<CategoryPage category="stay" />)
    const names = renderedNames(container)
    // eslint-disable-next-line no-console
    console.log('RENDERED STAY (live hotels):', names)

    expect(names).toContain('Hotel María Cristina') // Basque leg
    expect(names).toContain('Gran Hotel Sóller') // Balearic leg
    // actual nightly prices shown
    expect(screen.getByText('$270/night')).toBeTruthy()
    expect(screen.getByText('$383/night')).toBeTruthy()
  })

  it('shows a helpful message when no live hotels are loaded', () => {
    const { container } = render(<CategoryPage category="stay" />)
    expect(renderedNames(container)).toHaveLength(0)
    expect(screen.getByText(/Fetching live hotels/)).toBeTruthy()
  })
})

describe('Eat feed renders the researched Basque + Balearic places', () => {
  it('renders every seed restaurant with a "books ahead" badge on the marquee ones', () => {
    const { container } = render(<CategoryPage category="eat" />)
    const names = renderedNames(container)
    // eslint-disable-next-line no-console
    console.log('RENDERED EAT:', names)

    for (const e of EAT) expect(names).toContain(e.name)
    expect(names).toContain('Arzak') // San Sebastián (Basque)
    expect(names).toContain('Marc Fosh') // Palma (Balearic)
    // marquee/splurge spots surface a booking-urgency badge
    expect(screen.getAllByText('books ahead').length).toBeGreaterThan(0)
  })
})

describe('Do feed renders real seed places', () => {
  it('renders every seed activity', () => {
    const { container } = render(<CategoryPage category="do" />)
    const names = renderedNames(container)
    // eslint-disable-next-line no-console
    console.log('RENDERED DO:', names)

    for (const d of DO) expect(names).toContain(d.name)
  })
})
