import { describe, it, expect } from 'vitest'
import { createImagePreview } from './imagePreview'

describe('createImagePreview', () => {
  it('TC-PREVIEW-001: 이미지 파일 미리보기 생성', async () => {
    const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' })

    const result = await createImagePreview(file)

    expect(result).toContain('data:image/jpeg;base64')
  })
})
