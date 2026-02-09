import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

export const queryKeys = {
  menus: {
    all: ['menus'] as const,
    byCategory: (categoryId?: string) => ['menus', 'category', categoryId] as const,
    detail: (menuId: string) => ['menus', 'detail', menuId] as const,
  },
  orders: {
    all: ['orders'] as const,
    bySession: (sessionId: string) => ['orders', 'session', sessionId] as const,
  },
};
