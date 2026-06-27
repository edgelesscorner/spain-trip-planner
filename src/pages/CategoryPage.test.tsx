import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import CategoryPage from './CategoryPage'
import { STAY, EAT, DO } from '../data/seed'

function renderedNames(container: HTMLElement): string[] {
  return Array.from(
    container.querySelectorAll('[data-testid="place-name"]'),
  ).map((el) => el.textContent ?? '')
}

describe('Stay feed renders real seed places with AC enforced', () => {
  it('renders all AC seed stays and shows the AC badge', () => {
    const { container } = render(<CategoryPage category="stay" />)
    const names = renderedNames(container)
    // eslint-disable-next-line no-console
    console.log('RENDERED STAY:', names)

    for (const s of STAY) expect(names).toContain(s.name)
    // AC badge present (every seed stay has AC)
    expect(screen.getAllByText('AC').length).toBeGreaterThan(0)
    // prices render in USD (Hotel Mediterrani €80–150 → $86–$162 /night)
    expect(screen.getByText(/\$86–\$162/)).toBeTruthy()
    // eslint-disable-next-line no-console
    console.log('STAY PRICE (Hotel Mediterrani):', '$86–$162 /night (was €80–150)')
    // never an invented place
    expect(names).not.toContain('Hotel Imaginary')
  })
})

describe('Eat feed renders real seed places with urgency badges', () => {
  it('renders the dinners and the El Celler waitlist-now urgency', () => {
    const { container } = render(<CategoryPage category="eat" />)
    const names = renderedNames(container)
    // eslint-disable-next-line no-console
    console.log('RENDERED EAT:', names)

    for (const e of EAT) expect(names).toContain(e.name)
    expect(names).toContain('El Celler de Can Roca')
    // urgency badge for the critical booking
    expect(screen.getAllByText('waitlist now').length).toBeGreaterThan(0)
    // prices render in USD (Casamar "tasting from ~€79" → "~$85")
    expect(screen.getByText('tasting from ~$85')).toBeTruthy()
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
