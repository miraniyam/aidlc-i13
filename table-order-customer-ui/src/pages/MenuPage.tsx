import { useState } from 'react';
import BottomNavigation from '@/components/common/BottomNavigation';
import CategoryTabs from '@/components/menu/CategoryTabs';
import MenuList from '@/components/menu/MenuList';
import MenuDetailModal from '@/components/common/MenuDetailModal';
import Spinner from '@/components/common/Spinner';
import ErrorMessage from '@/components/common/ErrorMessage';
import { useMenus } from '@/hooks/useMenus';
import { Menu, MenuCategory } from '@/types/api';

const MenuPage = () => {
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | undefined>();
  const [selectedMenu, setSelectedMenu] = useState<Menu | null>(null);

  const { data: menus, isLoading, isError, error, refetch } = useMenus(selectedCategoryId);

  // Mock categories - will be replaced with actual API call
  const mockCategories: MenuCategory[] = [
    { categoryId: '1', categoryName: '메인 요리', displayOrder: 1 },
    { categoryId: '2', categoryName: '사이드', displayOrder: 2 },
    { categoryId: '3', categoryName: '음료', displayOrder: 3 },
    { categoryId: '4', categoryName: '디저트', displayOrder: 4 },
  ];

  const handleMenuClick = (menu: Menu) => {
    setSelectedMenu(menu);
  };

  const handleCloseModal = () => {
    setSelectedMenu(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">메뉴</h1>
        
        <CategoryTabs
          categories={mockCategories}
          selectedCategoryId={selectedCategoryId}
          onSelectCategory={setSelectedCategoryId}
        />

        {isLoading && (
          <div className="flex justify-center py-12">
            <Spinner size="lg" />
          </div>
        )}

        {isError && (
          <ErrorMessage
            message={error?.message || '메뉴를 불러오는데 실패했습니다'}
            onRetry={() => refetch()}
          />
        )}

        {!isLoading && !isError && menus && (
          <MenuList menus={menus} onMenuClick={handleMenuClick} />
        )}
      </div>
      
      <BottomNavigation />

      {selectedMenu && (
        <MenuDetailModal menu={selectedMenu} onClose={handleCloseModal} />
      )}
    </div>
  );
};

export default MenuPage;
