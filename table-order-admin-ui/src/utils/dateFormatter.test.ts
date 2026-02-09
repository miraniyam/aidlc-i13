import { describe, it, expect, beforeEach, vi } from 'vitest'
import { formatDate, formatRelativeTime } from './dateFormatter'
import dayjs from 'dayjs'

describe('dateFormatter', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-02-09T12:00:00Z'))
  })

  it('TC-DATE-001: 날짜 포맷팅 - 기본 형식', () => {
    const date = '2026-02-09T10:30:00Z'
    const result = formatDate(date)
    expect(result).toMatch(/2026-02-09/)
  })

  it('TC-DATE-002: 상대 시간 - 분 단위', () => {
    const date = dayjs().subtract(30, 'minute').toISOString()
    const result = formatRelativeTime(date)
    expect(result).toBe('30분 전')
  })

  it('TC-DATE-003: 상대 시간 - 시간 단위', () => {
    const date = dayjs().subtract(3, 'hour').toISOString()
    const result = formatRelativeTime(date)
    expect(result).toBe('3시간 전')
  })
})
