import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { queryClient } from '@/lib/queryClient';
import useCartStore from '@/stores/cartStore';
import useAuthStore from '@/stores/authStore';
import ProtectedRoute from '@/components/common/ProtectedRoute';
import LoginPage from '@/pages/LoginPage';
import MenuPage from '@/pages/MenuPage';
import CartPage from '@/pages/CartPage';
import OrdersPage from '@/pages/OrdersPage';

function App() {
  const loadCart = useCartStore(state => state.loadFromStorage);
  const loadAuth = useAuthStore(state => state.loadFromStorage);

  useEffect(() => {
    loadCart();
    loadAuth();

    // Offline detection
    const handleOffline = () => {
      console.log('Network offline');
    };

    const handleOnline = () => {
      console.log('Network online');
      queryClient.refetchQueries();
    };

    window.addEventListener('offline', handleOffline);
    window.addEventListener('online', handleOnline);

    return () => {
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('online', handleOnline);
    };
  }, [loadCart, loadAuth]);

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/menu" replace />} />
          <Route path="/login" element={<LoginPage />} />
          
          <Route element={<ProtectedRoute />}>
            <Route path="/menu" element={<MenuPage />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/orders" element={<OrdersPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
      
      <Toaster position="top-center" />
    </QueryClientProvider>
  );
}

export default App;
