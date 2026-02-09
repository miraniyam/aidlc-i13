import { Link, useLocation } from 'react-router-dom';
import useCartStore from '@/stores/cartStore';

const BottomNavigation = () => {
  const location = useLocation();
  const totalQuantity = useCartStore(state => state.totalQuantity);

  const navItems = [
    { path: '/menu', label: '메뉴', icon: '🍽️' },
    { path: '/cart', label: '장바구니', icon: '🛒', badge: totalQuantity },
    { path: '/orders', label: '주문내역', icon: '📋' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg">
      <div className="flex justify-around items-center h-16">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center justify-center flex-1 h-full relative ${
                isActive ? 'text-primary-600' : 'text-gray-600'
              }`}
            >
              <span className="text-2xl">{item.icon}</span>
              <span className="text-xs mt-1">{item.label}</span>
              {item.badge !== undefined && item.badge > 0 && (
                <span className="absolute top-2 right-1/4 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNavigation;
