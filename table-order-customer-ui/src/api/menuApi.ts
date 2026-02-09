import apiClient from './client';
import { Menu } from '@/types/api';

export const menuApi = {
  getMenus: async (categoryId?: number, storeId?: string): Promise<Menu[]> => {
    const params: Record<string, any> = {};
    if (categoryId !== undefined) params.category_id = categoryId;
    if (storeId) params.store_id = storeId;
    
    const response = await apiClient.get<Menu[]>('/api/customer/menus', { params });
    return response.data;
  },

  getMenuDetail: async (menuId: number, storeId: string): Promise<Menu> => {
    const response = await apiClient.get<Menu>(`/api/customer/menus/${menuId}`, {
      params: { store_id: storeId },
    });
    return response.data;
  },
};
