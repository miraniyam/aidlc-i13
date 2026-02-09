import { Menu } from '@/types/api';

interface MenuItemProps {
  menu: Menu;
  onClick: () => void;
}

const MenuItem = ({ menu, onClick }: MenuItemProps) => {
  return (
    <button
      onClick={onClick}
      className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden text-left"
    >
      <div className="aspect-square bg-gray-200 relative">
        {menu.imageUrl ? (
          <img
            src={menu.imageUrl}
            alt={menu.menuName}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            <svg
              className="w-16 h-16"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
        )}
      </div>
      <div className="p-3">
        <h3 className="font-medium text-gray-900 mb-1 line-clamp-1">
          {menu.menuName}
        </h3>
        <p className="text-sm text-gray-500 mb-2 line-clamp-2">
          {menu.description}
        </p>
        <p className="text-lg font-bold text-blue-600">
          {menu.price.toLocaleString()}원
        </p>
      </div>
    </button>
  );
};

export default MenuItem;
