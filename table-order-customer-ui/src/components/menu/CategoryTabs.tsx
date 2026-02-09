import { MenuCategory } from '@/types/api';

interface CategoryTabsProps {
  categories: MenuCategory[];
  selectedCategoryId?: string;
  onSelectCategory: (categoryId?: string) => void;
}

const CategoryTabs = ({ categories, selectedCategoryId, onSelectCategory }: CategoryTabsProps) => {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2 mb-6 scrollbar-hide">
      <button
        onClick={() => onSelectCategory(undefined)}
        className={`px-4 py-2 rounded-full whitespace-nowrap transition-colors ${
          !selectedCategoryId
            ? 'bg-blue-600 text-white'
            : 'bg-white text-gray-700 hover:bg-gray-100'
        }`}
      >
        전체
      </button>
      {categories.map((category) => (
        <button
          key={category.categoryId}
          onClick={() => onSelectCategory(category.categoryId)}
          className={`px-4 py-2 rounded-full whitespace-nowrap transition-colors ${
            selectedCategoryId === category.categoryId
              ? 'bg-blue-600 text-white'
              : 'bg-white text-gray-700 hover:bg-gray-100'
          }`}
        >
          {category.categoryName}
        </button>
      ))}
    </div>
  );
};

export default CategoryTabs;
