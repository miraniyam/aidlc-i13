import { describe, it, expect, beforeEach, vi } from 'vitest'
import { RateLimiter } from './rateLimiter'

describe('RateLimiter', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  it('TC-RATE-001: 초기 토큰으로 요청 허용', () => {
    const limiter = new RateLimiter(5, 1)

    expect(limiter.tryConsume()).toBe(true)
    expect(limiter.tryConsume()).toBe(true)
  })

  it('TC-RATE-002: 토큰 소진 시 요청 거부', () => {
    const limiter = new RateLimiter(2, 1)

    expect(limiter.tryConsume()).toBe(true)
    expect(limiter.tryConsume()).toBe(true)
    expect(limiter.tryConsume()).toBe(false)
  })

  it('TC-RATE-003: 시간 경과 후 토큰 재충전', () => {
    const limiter = new RateLimiter(2, 1)

    limiter.tryConsume()
    limiter.tryConsume()
    expect(limiter.tryConsume()).toBe(false)

    vi.advanceTimersByTime(1000)

    expect(limiter.tryConsume()).toBe(true)
  })
})
