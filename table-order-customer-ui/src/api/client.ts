import axios from 'axios';
import toast from 'react-hot-toast';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - Add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Auto-logout on 401
      localStorage.removeItem('auth_token');
      localStorage.removeItem('table_id');
      localStorage.removeItem('session_id');
      window.location.href = '/login';
      toast.error('로그인이 만료되었습니다');
    } else if (error.code === 'ERR_NETWORK') {
      toast.error(
        <div>
          <p>네트워크 연결을 확인해주세요</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-2 px-3 py-1 bg-white text-gray-800 rounded text-sm"
          >
            다시 시도
          </button>
        </div>,
        { duration: 5000 }
      );
    } else {
      const message = error.response?.data?.message || '요청에 실패했습니다';
      toast.error(message);
    }
    return Promise.reject(error);
  }
);

export default apiClient;
