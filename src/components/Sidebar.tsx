import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { 
  BarChart3, 
  Database, 
  Building2, 
  Users, 
  Target, 
  UserCheck, 
  Banknote, 
  Key, 
  CreditCard, 
  Warehouse, 
  Package, 
  Layers, 
  Archive, 
  Grid, 
  Ruler, 
  Settings, 
  FileText, 
  BookOpen, 
  Calculator, 
  ShoppingCart, 
  TrendingUp, 
  Receipt, 
  Home, 
  File, 
  ChevronRight, 
  ChevronDown,
  Search
} from 'lucide-react';

interface SidebarProps {
  activeMenu: string;
  onMenuSelect: (menuId: string) => void;
  isCollapsed: boolean;
  isMobile?: boolean;
}

interface MenuGroup {
  id: string;
  title: string;
  items: MenuItem[];
}

interface MenuItem {
  id: string;
  title: string;
  icon: string;
  subItems?: SubMenuItem[];
}

interface SubMenuItem {
  id: string;
  title: string;
  path: string; // Add path for each submenu item
}

const menuGroups: MenuGroup[] = [
  {
    id: 'overview',
    title: 'Tổng quan',
    items: [
      { id: 'dashboard', title: 'Dashboard Tổng Quan', icon: 'BarChart3' }
    ]
  },
  {
    id: 'data-management',
    title: 'Quản lý Dữ liệu',
    items: [
      { 
        id: 'basic-data', 
        title: 'Quản lý Dữ liệu Cơ Bản', 
        icon: 'Database',
        subItems: [
          { id: 'company-management', title: 'Quản lý công ty', path: '/company-management' },
          { id: 'user-management', title: 'Quản lý người dùng', path: '/user-management' },
          { id: 'cost-center', title: 'Đối tượng tập hợp chi phí', path: '/cost-center' },
          { id: 'customer-management', title: 'Quản lý khách hàng', path: '/customer-management' },
          { id: 'bank-management', title: 'Quản lý ngân hàng', path: '/bank-management' },
          { id: 'code-registration', title: 'Đăng ký mã quản lý', path: '/code-registration' },
          { id: 'account-management', title: 'Quản lý tài khoản', path: '/account-management' },
          { id: 'warehouse-management', title: 'Quản lý kho bãi', path: '/warehouse-management' },
          { id: 'warehouse-category', title: 'Quản lý thể loại kho', path: '/warehouse-category' },
          { id: 'inventory-declaration', title: 'Khai báo hàng tồn kho', path: '/inventory-declaration' },
          { id: 'material-group', title: 'Quản lý mã nhóm vật tư', path: '/material-group' },
          { id: 'unit-management', title: 'Quản lý mã đơn vị tính', path: '/unit-management' },
          { id: 'standard-management', title: 'Quản lý mã tiêu chuẩn', path: '/standard-management' },
          { id: 'note-management', title: 'Quản lý ghi chú', path: '/note-management' },
          { id: 'contract-management', title: 'Quản lý hợp đồng', path: '/contract-management' }
        ]
      }
    ]
  },
  {
    id: 'finance',
    title: 'Tài Chính',
    items: [
      { id: 'summary', title: 'Tổng Hợp', icon: 'BarChart3' },
      { id: 'journal', title: 'Sổ Nhật Ký', icon: 'BookOpen' },
      { id: 'cash', title: 'Tiền Mặt', icon: 'Banknote' },
      { id: 'banking', title: 'Ngân Hàng', icon: 'Building2' }
    ]
  },
  {
    id: 'trading',
    title: 'Mua Bán',
    items: [
      { id: 'purchasing', title: 'Mua Hàng', icon: 'ShoppingCart' },
      { id: 'sales', title: 'Bán Hàng', icon: 'TrendingUp' }
    ]
  },
  {
    id: 'inventory-tax',
    title: 'Kho & Thuế',
    items: [
      { id: 'costing', title: 'Giá Thành Giản Đơn', icon: 'Calculator' },
      { id: 'inventory', title: 'Quản lý Hàng Tồn Kho', icon: 'Package' },
      { id: 'vat', title: 'Quản lý Thuế VAT', icon: 'Receipt' }
    ]
  },
  {
    id: 'assets-reports',
    title: 'Tài sản & Báo Cáo',
    items: [
      { id: 'assets', title: 'Quản lý Tài Sản Cố Định', icon: 'Home' },
      { id: 'invoices', title: 'Hóa Đơn', icon: 'FileText' },
      { id: 'reports', title: 'Sổ Sách & Báo Cáo Tài Chính', icon: 'BookOpen' }
    ]
  },
  {
    id: 'integration',
    title: 'Tích Hợp',
    items: [
      { id: 'firmbanking', title: 'FirmBanking', icon: 'CreditCard' },
      { id: 'e-documents', title: 'Chứng Từ Điện Tử', icon: 'File' },
      { id: 'utilities', title: 'Tiện Ích', icon: 'Settings' }
    ]
  }
];

const iconMap: { [key: string]: React.ReactNode } = {
  BarChart3: <BarChart3 size={16} />,
  Database: <Database size={16} />,
  Building2: <Building2 size={16} />,
  Users: <Users size={16} />,
  Target: <Target size={16} />,
  UserCheck: <UserCheck size={16} />,
  Banknote: <Banknote size={16} />,
  Key: <Key size={16} />,
  CreditCard: <CreditCard size={16} />,
  Warehouse: <Warehouse size={16} />,
  Package: <Package size={16} />,
  Layers: <Layers size={16} />,
  Archive: <Archive size={16} />,
  Grid: <Grid size={16} />,
  Ruler: <Ruler size={16} />,
  Settings: <Settings size={16} />,
  FileText: <FileText size={16} />,
  BookOpen: <BookOpen size={16} />,
  Calculator: <Calculator size={16} />,
  ShoppingCart: <ShoppingCart size={16} />,
  TrendingUp: <TrendingUp size={16} />,
  Receipt: <Receipt size={16} />,
  Home: <Home size={16} />,
  File: <File size={16} />
};

export default function Sidebar({ activeMenu, onMenuSelect, isCollapsed, isMobile = false }: SidebarProps) {
  const location = useLocation();
  const [expandedMenus, setExpandedMenus] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  // Function to find which parent menu contains the current active item
  const findParentMenu = (currentPath: string) => {
    for (const group of menuGroups) {
      for (const item of group.items) {
        if (item.subItems) {
          for (const subItem of item.subItems) {
            if (subItem.path === currentPath) {
              return item.id;
            }
          }
        }
      }
    }
    return null;
  };

  // Function to get active menu ID from current path
  const getActiveMenuFromPath = (pathname: string) => {
    if (pathname === '/') return 'dashboard';
    
    // Check submenus first
    for (const group of menuGroups) {
      for (const item of group.items) {
        if (item.subItems) {
          for (const subItem of item.subItems) {
            if (subItem.path === pathname) {
              return subItem.id;
            }
          }
        }
      }
    }
    
    // Check main menu items
    const pathWithoutSlash = pathname.substring(1);
    return pathWithoutSlash || 'dashboard';
  };

  // Initialize expanded menus based on current location
  useEffect(() => {
    const currentPath = location.pathname;
    const parentMenu = findParentMenu(currentPath);
    
    if (parentMenu && !expandedMenus.includes(parentMenu)) {
      setExpandedMenus(prev => [...prev, parentMenu]);
    }
  }, [location.pathname]);

  const toggleSubmenu = (menuId: string) => {
    setExpandedMenus(prev => 
      prev.includes(menuId) 
        ? prev.filter(id => id !== menuId)
        : [...prev, menuId]
    );
  };

  const handleMenuClick = (item: MenuItem | SubMenuItem, path?: string) => {
    if ('path' in item && item.path) {
      // This is a submenu item with a path
      onMenuSelect(item.path.substring(1)); // Remove leading slash
    } else if (!('path' in item) && !item.subItems) {
      // This is a main menu item without subItems
      onMenuSelect(item.id);
    }
    
    // Close sidebar on mobile after menu selection
    if (isMobile) {
      // This would need to be handled by parent component
    }
  };

  // Get current active menu ID
  const currentActiveMenu = getActiveMenuFromPath(location.pathname);

  // Filter menu items based on search term
  const filterMenuItems = (groups: MenuGroup[]) => {
    if (!searchTerm) return groups;

    return groups.map(group => ({
      ...group,
      items: group.items.filter(item => {
        const itemMatches = item.title.toLowerCase().includes(searchTerm.toLowerCase());
        const subItemMatches = item.subItems?.some(subItem => 
          subItem.title.toLowerCase().includes(searchTerm.toLowerCase())
        );
        return itemMatches || subItemMatches;
      }).map(item => ({
        ...item,
        subItems: item.subItems?.filter(subItem =>
          subItem.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.title.toLowerCase().includes(searchTerm.toLowerCase())
        )
      }))
    })).filter(group => group.items.length > 0);
  };

  const filteredMenuGroups = filterMenuItems(menuGroups);

  if (isCollapsed && !isMobile) {
    return (
      <div className="bg-white border-r border-gray-200 w-16 h-screen flex flex-col">
        <div className="p-3 border-b border-gray-200 flex-shrink-0">
          <div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">A</span>
          </div>
        </div>
        
        <nav className="flex-1 overflow-y-auto p-2">
          <div className="space-y-1">
            {menuGroups.map((group) => (
              <div key={group.id}>
                {group.items.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleMenuClick(item)}
                    className={`w-full flex items-center justify-center p-3 rounded-lg transition-all duration-200 ${
                      currentActiveMenu === item.id
                        ? 'bg-red-50 text-red-700'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                    title={item.title}
                  >
                    <div className={`${currentActiveMenu === item.id ? 'text-red-600' : 'text-gray-400'}`}>
                      {iconMap[item.icon]}
                    </div>
                  </button>
                ))}
              </div>
            ))}
          </div>
        </nav>
      </div>
    );
  }

  return (
    <div className={`bg-white border-r border-gray-200 ${isMobile ? 'w-64' : 'w-64'} h-screen flex flex-col`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200 flex-shrink-0">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">A</span>
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-900">AMnote</h1>
            <p className="text-xs text-gray-500">Phần mềm kế toán</p>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="p-3 border-b border-gray-200 flex-shrink-0">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Tìm kiếm menu..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
          />
        </div>
      </div>
      
      {/* Menu Groups */}
      <nav className="flex-1 overflow-y-auto p-2">
        <div className="space-y-4">
          {filteredMenuGroups.map((group) => (
            <div key={group.id}>
              <h3 className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                {group.title}
              </h3>
              <div className="space-y-1">
                {group.items.map((item) => (
                  <div key={item.id}>
                    <button
                      onClick={() => {
                        if (item.subItems) {
                          toggleSubmenu(item.id);
                        } else {
                          handleMenuClick(item);
                        }
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2.5 text-left rounded-lg transition-all duration-200 ${
                        currentActiveMenu === item.id
                          ? 'bg-red-50 text-red-700 border-l-3 border-red-600'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`flex-shrink-0 ${currentActiveMenu === item.id ? 'text-red-600' : 'text-gray-400'}`}>
                          {iconMap[item.icon]}
                        </div>
                        <span className={`text-sm font-medium ${
                          currentActiveMenu === item.id ? 'text-red-700' : 'text-gray-700'
                        }`}>
                          {item.title}
                        </span>
                      </div>
                      {item.subItems && (
                        <div className={`transition-transform duration-200 ${
                          expandedMenus.includes(item.id) ? 'rotate-90' : ''
                        }`}>
                          <ChevronRight size={14} className="text-gray-400" />
                        </div>
                      )}
                    </button>
                    
                    {/* Submenu */}
                    {item.subItems && expandedMenus.includes(item.id) && (
                      <div className="ml-6 mt-1 space-y-1">
                        {item.subItems.map((subItem) => (
                          <button
                            key={subItem.id}
                            onClick={() => handleMenuClick(subItem)}
                            className={`w-full text-left px-3 py-2 text-sm rounded-lg transition-colors ${
                              currentActiveMenu === subItem.id
                                ? 'bg-red-50 text-red-700 font-medium border-l-2 border-red-500'
                                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                            }`}
                          >
                            {subItem.title}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </nav>

      {/* User Info */}
      <div className="p-4 border-t border-gray-200 flex-shrink-0">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center">
            <span className="text-white text-sm font-medium">NA</span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium text-gray-900 truncate">Nguyễn Văn A</div>
            <div className="text-xs text-gray-500 truncate">Kế toán trưởng</div>
          </div>
        </div>
      </div>
    </div>
  );
}