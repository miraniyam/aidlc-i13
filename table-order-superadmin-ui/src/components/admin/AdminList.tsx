import type { Admin } from '@/types/api'
import AdminStatusButton from './AdminStatusButton'

interface Props {
  admins: Admin[]
  filter: string
}

export default function AdminList({ admins, filter }: Props) {
  const filtered = admins.filter(
    (a) => a.username.includes(filter) || a.store_id.includes(filter)
  )

  return (
    <table className="w-full bg-white rounded shadow">
      <thead className="bg-gray-50">
        <tr>
          <th className="px-4 py-3 text-left">매장 ID</th>
          <th className="px-4 py-3 text-left">사용자명</th>
          <th className="px-4 py-3 text-left">상태</th>
          <th className="px-4 py-3 text-left">생성일</th>
          <th className="px-4 py-3 text-left">액션</th>
        </tr>
      </thead>
      <tbody>
        {filtered.map((admin) => (
          <tr key={admin.id} className="border-t">
            <td className="px-4 py-3">{admin.store_id}</td>
            <td className="px-4 py-3">{admin.username}</td>
            <td className="px-4 py-3">
              <span className={`px-2 py-1 rounded text-sm ${admin.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                {admin.is_active ? '활성' : '비활성'}
              </span>
            </td>
            <td className="px-4 py-3">{new Date(admin.created_at).toLocaleDateString()}</td>
            <td className="px-4 py-3">
              <AdminStatusButton admin={admin} />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
