import { useQuery } from '@tanstack/react-query';
import { menuApi } from '@/api/menuApi';
import { queryKeys } from '@/lib/queryClient';

export const useMenus = (categoryId?: string) => {
  return useQuery({
    queryKey: queryKeys.menus.byCategory(categoryId),
    queryFn: () => menuApi.getMenus(categoryId),
  });
};

export const useMenuDetail = (menuId: string) => {
  return useQuery({
    queryKey: queryKeys.menus.detail(menuId),
    queryFn: () => menuApi.getMenuDetail(menuId),
    enabled: !!menuId,
  });
};
