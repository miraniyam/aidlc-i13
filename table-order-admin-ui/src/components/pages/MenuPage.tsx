import { useEffect, useState } from 'react'
import { MenuAPI } from '../../api/menu.api'
import { sanitizeInput } from '../../utils/sanitizer'
import { createImagePreview } from '../../utils/imagePreview'
import type { Menu } from '../../types'

export default function MenuPage() {
  const [menus, setMenus] = useState<Menu[]>([])
  const [isEditing, setIsEditing] = useState(false)
  const [editingMenu, setEditingMenu] = useState<Menu | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: 0,
    is_available: true,
  })
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)

  useEffect(() => {
    loadMenus()
  }, [])

  const loadMenus = async () => {
    // Mock data - 실제로는 MenuAPI.getMenus() 호출
    setMenus([])
  }

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImageFile(file)
      const preview = await createImagePreview(file)
      setImagePreview(preview)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const sanitizedData = {
      name: sanitizeInput(formData.name),
      description: sanitizeInput(formData.description),
      price: formData.price,
      is_available: formData.is_available,
      image: imageFile || undefined,
    }

    if (editingMenu) {
      await MenuAPI.updateMenu(editingMenu.id, sanitizedData)
    } else {
      await MenuAPI.createMenu(sanitizedData)
    }

    resetForm()
    loadMenus()
  }

  const handleEdit = (menu: Menu) => {
    setEditingMenu(menu)
    setFormData({
      name: menu.name,
      description: menu.description,
      price: menu.price,
      is_available: menu.is_available,
    })
    setImagePreview(menu.image_url)
    setIsEditing(true)
  }

  const handleDelete = async (menuId: number) => {
    if (confirm('메뉴를 삭제하시겠습니까?')) {
      await MenuAPI.deleteMenu(menuId)
      loadMenus()
    }
  }

  const resetForm = () => {
    setFormData({ name: '', description: '', price: 0, is_available: true })
    setImageFile(null)
    setImagePreview(null)
    setEditingMenu(null)
    setIsEditing(false)
  }

  return (
    <div style={{ padding: '20px' }}>
      <h1>메뉴 관리</h1>

      <button onClick={() => setIsEditing(true)} style={{ marginBottom: '20px' }}>
        메뉴 추가
      </button>

      {isEditing && (
        <div style={{ border: '1px solid #ccc', padding: '20px', marginBottom: '20px' }}>
          <h2>{editingMenu ? '메뉴 수정' : '메뉴 추가'}</h2>
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '10px' }}>
              <input
                type="text"
                placeholder="메뉴명"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                style={{ width: '100%', padding: '8px' }}
              />
            </div>
            <div style={{ marginBottom: '10px' }}>
              <textarea
                placeholder="설명"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                required
                style={{ width: '100%', padding: '8px', minHeight: '80px' }}
              />
            </div>
            <div style={{ marginBottom: '10px' }}>
              <input
                type="number"
                placeholder="가격"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                required
                style={{ width: '100%', padding: '8px' }}
              />
            </div>
            <div style={{ marginBottom: '10px' }}>
              <label>
                <input
                  type="checkbox"
                  checked={formData.is_available}
                  onChange={(e) => setFormData({ ...formData, is_available: e.target.checked })}
                />
                판매 가능
              </label>
            </div>
            <div style={{ marginBottom: '10px' }}>
              <input type="file" accept="image/*" onChange={handleImageChange} />
              {imagePreview && (
                <img src={imagePreview} alt="Preview" style={{ maxWidth: '200px', marginTop: '10px' }} />
              )}
            </div>
            <button type="submit" style={{ marginRight: '10px' }}>
              {editingMenu ? '수정' : '추가'}
            </button>
            <button type="button" onClick={resetForm}>
              취소
            </button>
          </form>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
        {menus.map((menu) => (
          <div key={menu.id} style={{ border: '1px solid #ccc', padding: '10px' }}>
            {menu.image_url && (
              <img src={menu.image_url} alt={menu.name} style={{ width: '100%', height: '150px', objectFit: 'cover' }} />
            )}
            <h3>{menu.name}</h3>
            <p>{menu.description}</p>
            <p>
              <strong>{menu.price}원</strong>
            </p>
            <p>{menu.is_available ? '판매중' : '품절'}</p>
            <button onClick={() => handleEdit(menu)} style={{ marginRight: '5px' }}>
              수정
            </button>
            <button onClick={() => handleDelete(menu.id)}>삭제</button>
          </div>
        ))}
      </div>
    </div>
  )
}
