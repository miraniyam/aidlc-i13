import useAuthStore from '@/stores/authStore';
import { useOrders } from '@/hooks/useOrders';
import { ORDER_STATUS_CONFIG } from '@/utils/constants';
import BottomNavigation from '@/components/common/BottomNavigation';

const OrdersPage = () => {
  const { data: orders, isLoading, error } = useOrders(true);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 pb-20 flex items-center justify-center">
        <div className="text-gray-500">로딩 중...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 pb-20 flex items-center justify-center">
        <div className="text-red-500">주문 내역을 불러오는데 실패했습니다</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">주문 내역</h1>
        
        {!orders || orders.length === 0 ? (
          <div className="text-center text-gray-500 py-12">
            주문 내역이 없습니다
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => {
              const statusConfig = ORDER_STATUS_CONFIG[order.status];
              return (
                <div key={order.id} className="bg-white p-4 rounded-lg shadow">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-medium">주문 #{order.id}</h3>
                      <p className="text-sm text-gray-500">
                        {new Date(order.created_at).toLocaleString('ko-KR')}
                      </p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm ${statusConfig.bgColor} ${statusConfig.textColor}`}>
                      {statusConfig.label}
                    </span>
                  </div>
                  
                  <div className="space-y-1 mb-3">
                    {order.order_items.map((item) => (
                      <div key={item.id} className="text-sm text-gray-600">
                        - {item.menu_name} x{item.quantity}
                      </div>
                    ))}
                  </div>
                  
                  <div className="text-right font-medium">
                    총액: {Number(order.total_price).toLocaleString()}원
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      
      <BottomNavigation />
    </div>
  );
};

export default OrdersPage;
