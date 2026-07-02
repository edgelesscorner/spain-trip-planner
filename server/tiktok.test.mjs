import { describe, it, expect } from 'vitest'
import {
  buildQueries,
  postsToText,
  extractJsonArray,
  parseCandidates,
} from './tiktok.mjs'

const POSTS = [
  {
    text: 'Best pintxos in San Sebastian?? Gandarias never misses 🍷',
    hashtags: [{ name: 'sansebastian' }, { name: 'pintxos' }],
    webVideoUrl: 'https://www.tiktok.com/@a/video/1',
  },
  {
    text: 'La Vina cheesecake is legendary. Also went to Gandarias again!',
    hashtags: ['food'],
    webVideoUrl: 'https://www.tiktok.com/@b/video/2',
  },
  {
    text: 'Cala Macarella in Menorca is unreal 🏖️',
    hashtags: [{ name: 'menorca' }],
    webVideoUrl: 'https://www.tiktok.com/@c/video/3',
  },
]

describe('tiktok extraction helpers (pure)', () => {
  it('builds a bounded query set per category', () => {
    expect(buildQueries('eat').length).toBeGreaterThan(0)
    expect(buildQueries('do').length).toBeGreaterThan(0)
    expect(buildQueries('stay')).toEqual([])
  })

  it('flattens posts to a numbered caption list with hashtags', () => {
    const text = postsToText(POSTS)
    expect(text).toContain('1.')
    expect(text).toContain('Gandarias')
    expect(text).toContain('#pintxos')
  })

  it('extracts a JSON array tolerating prose/fences', () => {
    const parsed = extractJsonArray('Here you go:\n```json\n[{"name":"X"}]\n```')
    expect(parsed).toEqual([{ name: 'X' }])
    expect(extractJsonArray('no array here')).toBeNull()
  })

  it('parseCandidates cleans, maps source URLs, dedupes, and tallies mentions', () => {
    const parsed = [
      { name: 'Gandarias', town: 'San Sebastián', type: 'pintxos bar', reason: 'iconic', sourceIndex: 1 },
      { name: 'Gandarias', town: 'San Sebastián', type: 'pintxos bar', reason: 'dupe', sourceIndex: 2 }, // dup → dropped
      { name: 'La Viña', town: 'San Sebastián', type: 'dessert', reason: 'cheesecake', sourceIndex: 2 },
      { name: '', town: 'Nowhere', sourceIndex: 3 }, // invalid name → dropped
      { name: 'Cala Macarella', town: 'Menorca', type: 'beach', reason: 'cove', sourceIndex: 3 },
    ]
    const out = parseCandidates(parsed, POSTS)
    const names = out.map((c) => c.name)
    expect(names).toContain('Gandarias')
    expect(names).toContain('La Viña')
    expect(names).toContain('Cala Macarella')
    expect(names).not.toContain('') // invalid dropped
    expect(out).toHaveLength(3) // Gandarias deduped

    const gand = out.find((c) => c.name === 'Gandarias')
    expect(gand.sourceUrl).toBe('https://www.tiktok.com/@a/video/1') // from sourceIndex 1
    expect(gand.mentions).toBe(2) // "Gandarias" appears in caption 1 and 2
    // most-mentioned first
    expect(out[0].name).toBe('Gandarias')
  })

  it('returns [] for non-array input', () => {
    expect(parseCandidates(null, POSTS)).toEqual([])
    expect(parseCandidates({}, POSTS)).toEqual([])
  })
})
