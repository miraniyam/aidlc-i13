import { Link } from 'react-router-dom'
import { useAuthStore } from '../../stores/authStore'

export default function Sidebar() {
  const logout = useAuthStore((state) => state.logout)

  return (
    <div
      style={{
        width: '200px',
        height: '100vh',
        backgroundColor: '#2c3e50',
        color: 'white',
        padding: '20px',
        position: 'fixed',
        left: 0,
        top: 0,
      }}
    >
      <h2 style={{ marginBottom: '30px' }}>Admin</h2>
      <nav>
        <ul style={{ listStyle: 'none', padding: 0 }}>
          <li style={{ marginBottom: '15px' }}>
            <Link to="/dashboard" style={{ color: 'white', textDecoration: 'none' }}>
              대시보드
            </Link>
          </li>
          <li style={{ marginBottom: '15px' }}>
            <Link to="/menus" style={{ color: 'white', textDecoration: 'none' }}>
              메뉴 관리
            </Link>
          </li>
          <li style={{ marginBottom: '15px' }}>
            <Link to="/order-history" style={{ color: 'white', textDecoration: 'none' }}>
              주문 내역
            </Link>
          </li>
          <li style={{ marginTop: '50px' }}>
            <button
              onClick={logout}
              style={{
                background: 'none',
                border: 'none',
                color: 'white',
                cursor: 'pointer',
                padding: 0,
              }}
            >
              로그아웃
            </button>
          </li>
        </ul>
      </nav>
    </div>
  )
}
