import { useNavigate } from 'react-router-dom';
import useCartStore from '@/stores/cartStore';
import useAuthStore from '@/stores/authStore';
import { useCreateOrder } from '@/hooks/useOrders';
import BottomNavigation from '@/components/common/BottomNavigation';
import toast from 'react-hot-toast';

const CartPage = () => {
  const { items, totalAmount, updateQuantity, removeItem, clearCart } = useCartStore();
  const sessionId = useAuthStore(state => state.sessionId);
  const tableId = useAuthStore(state => state.tableId);
  const createOrder = useCreateOrder();
  const navigate = useNavigate();

  const handleCreateOrder = () => {
    if (items.length === 0) {
      toast.error('장바구니가 비어있습니다');
      return;
    }

    if (!sessionId || !tableId) {
      toast.error('세션 정보가 없습니다');
      return;
    }

    createOrder.mutate(
      {
        sessionId,
        tableId,
        items: items.map(item => ({
          menuId: item.menuId,
          quantity: item.quantity,
        })),
      },
      {
        onSuccess: () => {
          setTimeout(() => navigate('/menu'), 5000);
        },
      }
    );
  };

  const handleClearCart = () => {
    if (confirm('장바구니를 비우시겠습니까?')) {
      clearCart();
      toast.success('장바구니가 비워졌습니다');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">장바구니</h1>
        
        {items.length === 0 ? (
          <div className="text-center text-gray-500 py-12">
            장바구니가 비어있습니다
          </div>
        ) : (
          <>
            <div className="space-y-4 mb-6">
              {items.map((item) => (
                <div key={item.menuId} className="bg-white p-4 rounded-lg shadow">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-medium">{item.menuName}</h3>
                      <p className="text-gray-600">{item.price.toLocaleString()}원</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateQuantity(item.menuId, item.quantity - 1)}
                        className="w-8 h-8 bg-gray-200 rounded"
                      >
                        -
                      </button>
                      <span className="w-8 text-center">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.menuId, item.quantity + 1)}
                        className="w-8 h-8 bg-gray-200 rounded"
                      >
                        +
                      </button>
                      <button
                        onClick={() => removeItem(item.menuId)}
                        className="ml-2 text-red-500"
                      >
                        삭제
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-white p-4 rounded-lg shadow mb-4">
              <div className="flex justify-between text-lg font-bold">
                <span>총 금액</span>
                <span>{totalAmount.toLocaleString()}원</span>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleClearCart}
                className="flex-1 py-3 bg-gray-200 text-gray-800 rounded-lg"
              >
                장바구니 비우기
              </button>
              <button
                onClick={handleCreateOrder}
                disabled={createOrder.isPending}
                className="flex-1 py-3 bg-primary-600 text-white rounded-lg disabled:opacity-50"
              >
                {createOrder.isPending ? '주문 중...' : '주문하기'}
              </button>
            </div>
          </>
        )}
      </div>
      
      <BottomNavigation />
    </div>
  );
};

export default CartPage;
