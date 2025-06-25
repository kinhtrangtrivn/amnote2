import React, { useState } from 'react';
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
          { id: 'company-management', title: 'Quản lý công ty' },
          { id: 'user-management', title: 'Quản lý người dùng' },
          { id: 'cost-center', title: 'Đối tượng tập hợp chi phí' },
          { id: 'customer-management', title: 'Quản lý khách hàng' },
          { id: 'bank-management', title: 'Quản lý ngân hàng' },
          { id: 'code-registration', title: 'Đăng ký mã quản lý' },
          { id: 'account-management', title: 'Quản lý tài khoản' },
          { id: 'warehouse-management', title: 'Quản lý kho bãi' },
          { id: 'warehouse-category', title: 'Quản lý thể loại kho' },
          { id: 'inventory-declaration', title: 'Khai báo hàng tồn kho' },
          { id: 'material-group', title: 'Quản lý mã nhóm vật tư' },
          { id: 'unit-management', title: 'Quản lý mã đơn vị tính' },
          { id: 'standard-management', title: 'Quản lý mã tiêu chuẩn' },
          { id: 'note-management', title: 'Quản lý ghi chú' },
          { id: 'contract-management', title: 'Quản lý hợp đồng' }
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
  const [expandedMenus, setExpandedMenus] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  const toggleSubmenu = (menuId: string) => {
    setExpandedMenus(prev => 
      prev.includes(menuId) 
        ? prev.filter(id => id !== menuId)
        : [...prev, menuId]
    );
  };

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
                    onClick={() => onMenuSelect(item.id)}
                    className={`w-full flex items-center justify-center p-3 rounded-lg transition-all duration-200 ${
                      activeMenu === item.id
                        ? 'bg-red-50 text-red-700'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                    title={item.title}
                  >
                    <div className={`${activeMenu === item.id ? 'text-red-600' : 'text-gray-400'}`}>
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
                          onMenuSelect(item.id);
                        }
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2.5 text-left rounded-lg transition-all duration-200 ${
                        activeMenu === item.id
                          ? 'bg-red-50 text-red-700 border-l-3 border-red-600'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`flex-shrink-0 ${activeMenu === item.id ? 'text-red-600' : 'text-gray-400'}`}>
                          {iconMap[item.icon]}
                        </div>
                        <span className={`text-sm font-medium ${
                          activeMenu === item.id ? 'text-red-700' : 'text-gray-700'
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
                            onClick={() => onMenuSelect(subItem.id)}
                            className={`w-full text-left px-3 py-2 text-sm rounded-lg transition-colors ${
                              activeMenu === subItem.id
                                ? 'bg-red-50 text-red-700'
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