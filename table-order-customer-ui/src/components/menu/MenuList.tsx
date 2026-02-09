import { Menu } from '@/types/api';
import MenuItem from './MenuItem';

interface MenuListProps {
  menus: Menu[];
  onMenuClick: (menu: Menu) => void;
}

const MenuList = ({ menus, onMenuClick }: MenuListProps) => {
  if (menus.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        메뉴가 없습니다
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {menus.map((menu) => (
        <MenuItem key={menu.menuId} menu={menu} onClick={() => onMenuClick(menu)} />
      ))}
    </div>
  );
};

export default MenuList;
