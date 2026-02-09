import client from './client'
import type { Menu, CreateMenuRequest, UpdateMenuRequest } from '../types'

export const MenuAPI = {
  async createMenu(data: CreateMenuRequest): Promise<Menu> {
    const formData = new FormData()
    formData.append('name', data.name)
    formData.append('description', data.description)
    formData.append('price', data.price.toString())
    formData.append('is_available', data.is_available.toString())
    if (data.image) {
      formData.append('image', data.image)
    }

    const response = await client.post<Menu>('/api/admin/menus', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data
  },

  async updateMenu(menuId: number, data: UpdateMenuRequest): Promise<Menu> {
    const formData = new FormData()
    if (data.name) formData.append('name', data.name)
    if (data.description) formData.append('description', data.description)
    if (data.price) formData.append('price', data.price.toString())
    if (data.is_available !== undefined) formData.append('is_available', data.is_available.toString())
    if (data.image) formData.append('image', data.image)

    const response = await client.patch<Menu>(`/api/admin/menus/${menuId}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data
  },

  async deleteMenu(menuId: number): Promise<void> {
    await client.delete(`/api/admin/menus/${menuId}`)
  },
}
