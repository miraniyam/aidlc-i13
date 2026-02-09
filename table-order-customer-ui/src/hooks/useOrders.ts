import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { orderApi } from '@/api/orderApi';
import { queryKeys } from '@/lib/queryClient';
import useCartStore from '@/stores/cartStore';
import useAuthStore from '@/stores/authStore';
import toast from 'react-hot-toast';

export const useOrders = (enablePolling: boolean = false) => {
  const sessionId = useAuthStore(state => state.sessionId);
  
  return useQuery({
    queryKey: queryKeys.orders.bySession(sessionId || ''),
    queryFn: () => orderApi.getOrders(),
    refetchInterval: enablePolling ? 30 * 1000 : false, // 30 seconds
    enabled: !!sessionId,
  });
};

export const useCreateOrder = () => {
  const queryClient = useQueryClient();
  const clearCart = useCartStore(state => state.clearCart);
  const sessionId = useAuthStore(state => state.sessionId);

  return useMutation({
    mutationFn: orderApi.createOrder,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.orders.bySession(sessionId || '') 
      });
      clearCart();
      toast.success(`주문이 완료되었습니다 (주문번호: ${data.order_id})`);
    },
    onError: () => {
      toast.error('주문 생성에 실패했습니다');
    },
  });
};
