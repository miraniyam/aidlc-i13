import type { Admin } from '@/types/api'
import { useActivateAdmin, useDeactivateAdmin } from '@/hooks/useAdmins'

interface Props {
  admin: Admin
}

export default function AdminStatusButton({ admin }: Props) {
  const activate = useActivateAdmin()
  const deactivate = useDeactivateAdmin()

  const handleClick = () => {
    if (admin.is_active) {
      if (confirm(`${admin.username} 계정을 비활성화하시겠습니까?`)) {
        deactivate.mutate(admin.id)
      }
    } else {
      if (confirm(`${admin.username} 계정을 활성화하시겠습니까?`)) {
        activate.mutate(admin.id)
      }
    }
  }

  const isLoading = activate.isPending || deactivate.isPending

  return (
    <button
      onClick={handleClick}
      disabled={isLoading}
      className={`px-3 py-1 rounded text-sm ${
        admin.is_active
          ? 'bg-red-100 text-red-700 hover:bg-red-200'
          : 'bg-green-100 text-green-700 hover:bg-green-200'
      } disabled:opacity-50`}
    >
      {isLoading ? '처리중...' : admin.is_active ? '비활성화' : '활성화'}
    </button>
  )
}
