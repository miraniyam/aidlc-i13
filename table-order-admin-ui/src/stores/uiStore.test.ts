import { describe, it, expect, beforeEach } from 'vitest'
import { useUIStore } from './uiStore'

describe('useUIStore', () => {
  beforeEach(() => {
    useUIStore.setState({
      isSidebarOpen: true,
      isModalOpen: false,
      modalContent: null,
    })
  })

  it('TC-UI-001: 사이드바 토글', () => {
    expect(useUIStore.getState().isSidebarOpen).toBe(true)

    useUIStore.getState().toggleSidebar()
    expect(useUIStore.getState().isSidebarOpen).toBe(false)

    useUIStore.getState().toggleSidebar()
    expect(useUIStore.getState().isSidebarOpen).toBe(true)
  })

  it('TC-UI-002: 모달 열기', () => {
    const content = 'Test Modal Content'

    useUIStore.getState().openModal(content)

    const state = useUIStore.getState()
    expect(state.isModalOpen).toBe(true)
    expect(state.modalContent).toBe(content)
  })

  it('TC-UI-003: 모달 닫기', () => {
    useUIStore.setState({
      isModalOpen: true,
      modalContent: 'Test Content',
    })

    useUIStore.getState().closeModal()

    const state = useUIStore.getState()
    expect(state.isModalOpen).toBe(false)
    expect(state.modalContent).toBeNull()
  })
})
