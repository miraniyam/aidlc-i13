import apiClient from './client';
import { Menu } from '@/types/api';

export const menuApi = {
  getMenus: async (categoryId?: string): Promise<Menu[]> => {
    const params = categoryId ? { category: categoryId } : {};
    const response = await apiClient.get<Menu[]>('/api/menus', { params });
    return response.data;
  },

  getMenuDetail: async (menuId: string): Promise<Menu> => {
    const response = await apiClient.get<Menu>(`/api/menus/${menuId}`);
    return response.data;
  },
};
