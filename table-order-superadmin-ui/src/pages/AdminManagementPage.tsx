import { useState } from 'react'
import { useAdmins, useCreateAdmin } from '@/hooks/useAdmins'
import AdminList from '@/components/admin/AdminList'
import AdminForm from '@/components/admin/AdminForm'
import type { CreateAdminRequest } from '@/types/api'

export default function AdminManagementPage() {
  const [showForm, setShowForm] = useState(false)
  const [filter, setFilter] = useState('')
  const { data: admins = [], isLoading } = useAdmins()
  const createAdmin = useCreateAdmin()

  const handleCreate = (data: CreateAdminRequest) => {
    createAdmin.mutate(data, { onSuccess: () => setShowForm(false) })
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">관리자 계정 관리</h1>
        <button
          onClick={() => setShowForm(true)}
          className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-500"
        >
          + 계정 생성
        </button>
      </div>

      <div className="mb-4">
        <input
          type="text"
          placeholder="검색 (매장ID, 사용자명)"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="border rounded px-3 py-2 w-64"
        />
      </div>

      {isLoading ? (
        <div className="text-center py-8">로딩 중...</div>
      ) : (
        <AdminList admins={admins} filter={filter} />
      )}

      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
          <div className="bg-white p-6 rounded shadow-lg w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">관리자 계정 생성</h2>
            <AdminForm
              onSubmit={handleCreate}
              onCancel={() => setShowForm(false)}
              isLoading={createAdmin.isPending}
            />
          </div>
        </div>
      )}
    </div>
  )
}
