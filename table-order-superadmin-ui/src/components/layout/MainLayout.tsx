import { Outlet, Link } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'

export default function MainLayout() {
  const { role, logout } = useAuthStore()

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-indigo-600 text-white p-4 flex justify-between items-center">
        <Link to="/" className="text-xl font-bold">SuperAdmin</Link>
        <div className="flex items-center gap-4">
          <span>{role}</span>
          <button onClick={logout} className="bg-indigo-500 px-3 py-1 rounded hover:bg-indigo-400">
            로그아웃
          </button>
        </div>
      </nav>
      <main className="p-6">
        <Outlet />
      </main>
    </div>
  )
}
