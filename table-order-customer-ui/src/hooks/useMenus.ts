import { useQuery } from '@tanstack/react-query';
import { menuApi } from '@/api/menuApi';
import { queryKeys } from '@/lib/queryClient';
import useAuthStore from '@/stores/authStore';

export const useMenus = (categoryId?: number) => {
  const storeId = useAuthStore(state => state.storeId);
  
  return useQuery({
    queryKey: queryKeys.menus.byCategory(categoryId?.toString()),
    queryFn: () => menuApi.getMenus(categoryId, storeId || undefined),
    enabled: !!storeId,
  });
};

export const useMenuDetail = (menuId: number) => {
  const storeId = useAuthStore(state => state.storeId);
  
  return useQuery({
    queryKey: queryKeys.menus.detail(menuId.toString()),
    queryFn: () => menuApi.getMenuDetail(menuId, storeId!),
    enabled: !!menuId && !!storeId,
  });
};
