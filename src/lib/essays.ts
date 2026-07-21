import type { BaseRecord } from '@hanzo/base/react'

/**
 * One row of the `essays` collection provisioned from schema.sql. `body` is
 * markdown; `reading_minutes` is derived from it at save time (see readingMinutes).
 * `published_at` is an ISO string, empty while an essay is still a draft.
 */
export interface Essay extends BaseRecord {
  title: string
  subtitle: string
  body: string
  reading_minutes: number
  published_at: string
  published: boolean
}

/** Words in a body of prose. */
export function countWords(text: string): number {
  const words = text.trim().match(/\S+/g)
  return words ? words.length : 0
}

/** Estimated reading time in whole minutes (200 wpm, floor of one). */
export function readingMinutes(text: string): number {
  return Math.max(1, Math.round(countWords(text) / 200))
}

/** e.g. "March 4, 2026"; empty string for an undated draft or a bad value. */
export function formatDate(iso: string): string {
  if (!iso) return ''
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
}

/** Publication year, or 0 when undated. */
export function yearOf(iso: string): number {
  if (!iso) return 0
  const d = new Date(iso)
  return Number.isNaN(d.getTime()) ? 0 : d.getFullYear()
}

/** A year bucket in the index. */
export interface Year {
  year: number
  essays: Essay[]
}

/** The index model: drafts, then published essays grouped by year. */
export interface Shelf {
  drafts: Essay[]
  years: Year[]
}

/**
 * Build the index: drafts first (undated, still being written), then published
 * essays bucketed by year — newest year first, newest essay first within a year.
 */
export function shelve(essays: Essay[]): Shelf {
  const drafts = essays
    .filter((e) => !e.published)
    .sort((a, b) => (b.created ?? '').localeCompare(a.created ?? ''))

  const byYear = new Map<number, Essay[]>()
  for (const e of essays.filter((x) => x.published)) {
    const year = yearOf(e.published_at) || yearOf(e.created ?? '')
    const bucket = byYear.get(year) ?? []
    bucket.push(e)
    byYear.set(year, bucket)
  }

  const years: Year[] = [...byYear.entries()]
    .sort((a, b) => b[0] - a[0])
    .map(([year, list]) => ({
      year,
      essays: list.sort((a, b) => (b.published_at || '').localeCompare(a.published_at || '')),
    }))

  return { drafts, years }
}

/** A block of an essay body, from the tiny markdown subset below. */
export type Block =
  | { kind: 'heading'; text: string }
  | { kind: 'quote'; text: string }
  | { kind: 'para'; text: string }

/**
 * Parse a markdown body into blocks — an honest, dependency-free subset:
 * blank-line separated blocks, `## ` (or `# `) → a section heading, `> ` → a
 * pull quote, everything else → a paragraph. Enough for a reading column;
 * no inline formatting is claimed.
 */
export function blocks(body: string): Block[] {
  return body
    .split(/\n{2,}/)
    .map((b) => b.trim())
    .filter(Boolean)
    .map<Block>((b) => {
      if (b.startsWith('## ')) return { kind: 'heading', text: b.slice(3).trim() }
      if (b.startsWith('# ')) return { kind: 'heading', text: b.slice(2).trim() }
      if (b.startsWith('> ')) return { kind: 'quote', text: b.replace(/^>\s?/gm, '').trim() }
      return { kind: 'para', text: b.replace(/\n/g, ' ') }
    })
}
