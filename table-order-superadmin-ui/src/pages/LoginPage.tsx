import { useNavigate } from 'react-router-dom'
import { useLogin } from '@/hooks/useAuth'
import LoginForm from '@/components/auth/LoginForm'

export default function LoginPage() {
  const navigate = useNavigate()
  const login = useLogin()

  const handleSubmit = (username: string, password: string) => {
    login.mutate({ username, password }, { onSuccess: () => navigate('/') })
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center">SuperAdmin 로그인</h1>
        <LoginForm
          onSubmit={handleSubmit}
          isLoading={login.isPending}
          error={login.error?.message}
        />
        <p className="mt-4 text-sm text-gray-500 text-center">
          Mock: superadmin / super123
        </p>
      </div>
    </div>
  )
}
