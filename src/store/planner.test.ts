import { describe, it, expect } from 'vitest'
import { createPlannerStore } from './planner'
import { createMemoryKV, kvToStateStorage } from '../lib/storage'

const tick = () => new Promise((r) => setTimeout(r, 0))

describe('Save → schedule → book lifecycle', () => {
  it('moves an item through the states', () => {
    const store = createPlannerStore(kvToStateStorage(createMemoryKV()))
    const s = store.getState

    s().toggleSave('casamar', 'eat')
    expect(s().saved['casamar'].status).toBe('saved')

    s().scheduleItem('casamar', '2026-08-04', '20:30')
    expect(s().saved['casamar'].status).toBe('scheduled')
    expect(s().saved['casamar'].day).toBe('2026-08-04')
    expect(s().saved['casamar'].timeSlot).toBe('20:30')

    s().setBooking('casamar', {
      status: 'to-book',
      partySize: 2,
      costEUR: 158,
    })
    expect(s().saved['casamar'].booking?.costEUR).toBe(158)

    s().markBooked('casamar')
    expect(s().saved['casamar'].status).toBe('booked')
    expect(s().saved['casamar'].booking?.status).toBe('booked')
  })
})

describe('Persistence across reloads', () => {
  it('rehydrates saved + scheduled + booked state from storage into a fresh store', async () => {
    const sharedKV = createMemoryKV()
    const storage = kvToStateStorage(sharedKV)

    // First "session"
    const storeA = createPlannerStore(storage)
    await storeA.persist.rehydrate()
    storeA.getState().toggleSave('bo-tic', 'eat')
    storeA.getState().scheduleItem('bo-tic', '2026-08-03')
    storeA.getState().markBooked('bo-tic')
    storeA.getState().addPacking('Swimsuit')
    storeA.getState().setNotes('Anniversary dinner on day 3.')
    await tick() // let the async write flush

    // Second "session" (simulated reload) sharing the same storage
    const storeB = createPlannerStore(storage)
    await storeB.persist.rehydrate()

    const b = storeB.getState()
    expect(b.saved['bo-tic'].status).toBe('booked')
    expect(b.saved['bo-tic'].day).toBe('2026-08-03')
    expect(b.packing.map((p) => p.text)).toContain('Swimsuit')
    expect(b.notes).toBe('Anniversary dinner on day 3.')
  })
})

describe('Budget reflects entered costs', () => {
  it('sums booking costs by category', () => {
    const store = createPlannerStore(kvToStateStorage(createMemoryKV()))
    store.getState().toggleSave('hotel-mediterrani', 'stay')
    store.getState().setBooking('hotel-mediterrani', {
      status: 'booked',
      costEUR: 600,
    })
    store.getState().toggleSave('casamar', 'eat')
    store.getState().setBooking('casamar', { status: 'booked', costEUR: 160 })

    const saved = store.getState().saved
    const total = Object.values(saved).reduce(
      (sum, i) => sum + (i.booking?.costEUR ?? 0),
      0,
    )
    expect(total).toBe(760)
  })
})
