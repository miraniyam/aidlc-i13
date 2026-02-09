import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { orderApi } from '@/api/orderApi';
import { queryKeys } from '@/lib/queryClient';
import useCartStore from '@/stores/cartStore';
import toast from 'react-hot-toast';

export const useOrders = (sessionId: string, enablePolling: boolean = false) => {
  return useQuery({
    queryKey: queryKeys.orders.bySession(sessionId),
    queryFn: () => orderApi.getOrders(sessionId),
    refetchInterval: enablePolling ? 30 * 1000 : false, // 30 seconds
    enabled: !!sessionId,
  });
};

export const useCreateOrder = () => {
  const queryClient = useQueryClient();
  const clearCart = useCartStore(state => state.clearCart);

  return useMutation({
    mutationFn: orderApi.createOrder,
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.orders.bySession(variables.sessionId) 
      });
      clearCart();
      toast.success(`주문이 완료되었습니다 (주문번호: ${data.orderNumber})`);
    },
    onError: () => {
      toast.error('주문 생성에 실패했습니다');
    },
  });
};
