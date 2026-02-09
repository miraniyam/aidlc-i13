import { useState } from 'react'

interface Props {
  onSubmit: (data: { username: string; password: string; role: string; store_id?: string }) => void
  onCancel: () => void
  isLoading: boolean
}

export default function AdminForm({ onSubmit, onCancel, isLoading }: Props) {
  const [storeId, setStoreId] = useState(`store-${Date.now().toString(36)}`)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit({ username, password, role: 'store_admin', store_id: storeId })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">매장 ID (자동생성)</label>
        <input
          type="text"
          value={storeId}
          onChange={(e) => setStoreId(e.target.value)}
          className="w-full border rounded px-3 py-2 bg-gray-50"
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">사용자명</label>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="w-full border rounded px-3 py-2"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">비밀번호</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full border rounded px-3 py-2"
          required
        />
      </div>
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={isLoading}
          className="flex-1 bg-indigo-600 text-white py-2 rounded hover:bg-indigo-500 disabled:opacity-50"
        >
          {isLoading ? '생성 중...' : '생성'}
        </button>
        <button type="button" onClick={onCancel} className="flex-1 border py-2 rounded hover:bg-gray-50">
          취소
        </button>
      </div>
    </form>
  )
}
