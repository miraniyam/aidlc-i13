import { describe, it, expect } from 'vitest'
import { sanitizeInput } from './sanitizer'

describe('sanitizeInput', () => {
  it('TC-SEC-001: XSS 공격 방지 - script 태그 제거', () => {
    const malicious = '<script>alert("XSS")</script>Hello'
    const result = sanitizeInput(malicious)
    expect(result).toBe('Hello')
    expect(result).not.toContain('<script>')
  })

  it('TC-SEC-002: XSS 공격 방지 - img onerror 제거', () => {
    const malicious = '<img src=x onerror="alert(1)">Test'
    const result = sanitizeInput(malicious)
    expect(result).toBe('Test')
    expect(result).not.toContain('onerror')
  })
})
