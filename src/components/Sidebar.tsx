import React, { useState, useEffect } from 'react';
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
  ChevronDown,
  Search
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

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
      { 
        id: 'summary', 
        title: 'Tổng Hợp', 
        icon: 'BarChart3',
        subItems: [
          {
            id: 'documents',
            title: 'Chứng từ',
            icon: 'FileText',
            subItems: [
              { id: 'receipt', title: 'Phiếu thu' },
              { id: 'payment', title: 'Phiếu chi' },
              { id: 'debt-note', title: 'Giấy báo nợ' },
              { id: 'credit-note', title: 'Giấy báo có' },
              { id: 'purchase-order', title: 'Phiếu mua hàng' },
              { id: 'service-order', title: 'Phiếu mua dịch vụ' },
              { id: 'sales-order', title: 'Phiếu bán hàng/dịch vụ' },
              { id: 'offset-order', title: 'Phiếu cấn trừ' },
              { id: 'other-order', title: 'Phiếu khác' }
            ]
          },
          { id: 'opening-balance', title: 'Sổ đầu kỳ được chuyển sang' },
          { id: 'transfer', title: 'Kết chuyển' },
          { id: 'check-transfer', title: 'Kiểm tra kết chuyển tài khoản trước khi khóa sổ' },
          { id: 'lock', title: 'Khóa sổ' }
        ]
      },
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

// Recursive SidebarMenuNode component
function findPathToNode(
  nodeList: (MenuItem | (SubMenuItem & { subItems?: SubMenuItem[] }))[],
  targetId: string,
  path: string[] = []
): string[] | null {
  for (const node of nodeList) {
    const currentPath = [...path, node.id];
    if (node.id === targetId) return currentPath;
    if (node.subItems) {
      const found = findPathToNode(node.subItems, targetId, currentPath);
      if (found) return found;
    }
  }
  return null;
}

// Hàm tìm tất cả path đến các node chứa từ khóa (dạng mảng các path)
function findAllPathsToMatchedNodes(
  nodeList: (MenuItem | (SubMenuItem & { subItems?: SubMenuItem[] }))[],
  term: string,
  path: string[] = []
): string[][] {
  let result: string[][] = [];
  for (const node of nodeList) {
    const currentPath = [...path, node.id];
    const nodeMatch = node.title.toLowerCase().includes(term.toLowerCase());
    let childMatched = false;
    if (node.subItems) {
      const childPaths = findAllPathsToMatchedNodes(node.subItems, term, currentPath);
      if (childPaths.length > 0) {
        result = result.concat(childPaths);
        childMatched = true;
      }
    }
    if (nodeMatch || childMatched) {
      // Nếu node khớp hoặc có con khớp, thêm path này
      result.push(currentPath);
    }
  }
  return result;
}

function SidebarMenuNode({
  node,
  level = 0,
  expandedPath,
  onMenuSelect,
  location,
  setExpandedPath,
  isSearching = false,
}: {
  node: MenuItem | (SubMenuItem & { subItems?: SubMenuItem[] });
  level?: number;
  expandedPath: string[];
  onMenuSelect: (id: string) => void;
  location: ReturnType<typeof useLocation>;
  setExpandedPath: React.Dispatch<React.SetStateAction<string[]>>;
  isSearching?: boolean;
}) {
  const isMenuItem = (n: any): n is MenuItem => !!(n as MenuItem).icon;
  const hasChildren = !!node.subItems && node.subItems.length > 0;
  const isExpanded = isSearching ? true : expandedPath[level] === node.id;

  // Determine if this node or any of its subItems is active
  const isActive = (() => {
    // Nếu node là cấp 3, active nếu id khớp expandedPath cuối
    if (expandedPath[expandedPath.length - 1] === node.id) return true;
    // Nếu node là cấp 2, active nếu id khớp expandedPath hoặc có cấp 3 active bên trong
    if (level === 1 && hasChildren) {
      if (expandedPath[1] === node.id) return true;
      // Nếu bất kỳ subItem (cấp 3) đang active thì cấp 2 cũng active
      return node.subItems?.some(sub => expandedPath.includes(sub.id));
    }
    // Nếu node là cấp 1, active nếu id khớp expandedPath hoặc có cấp 2/cấp 3 active bên trong
    if (level === 0 && hasChildren) {
      if (expandedPath[0] === node.id) return true;
      // Nếu bất kỳ subItem (cấp 2 hoặc cấp 3) đang active thì cấp 1 cũng active
      return node.subItems?.some(sub => expandedPath.includes(sub.id) || ((sub as any).subItems && (sub as any).subItems.some((third: any) => expandedPath.includes(third.id))));
    }
    return false;
  })();

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (isExpanded) {
      setExpandedPath(expandedPath.slice(0, level)); // Đóng menu cha
    } else {
      const newPath = expandedPath.slice(0, level);
      setExpandedPath([...newPath, node.id]); // Mở menu cha
    }
  };

  // Highlight searchTerm in text
  const highlightText = (text: string, term: string) => {
    if (!term) return text;
    const regex = new RegExp(`(${term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const parts = text.split(regex);
    return parts.map((part, i) =>
      regex.test(part)
        ? <span key={i} className="bg-yellow-200 text-red-700 font-bold">{part}</span>
        : part
    );
  };

  return (
    <div className="relative">
      {hasChildren && isExpanded && (
        <div
          className="absolute top-7 bottom-0 left-2 border-l border-dashed border-gray-400 z-0"
          style={{ left: `${level * 24 + 8}px` }}
        />
      )}
      <div className="relative flex items-center" style={{ paddingLeft: `${level * 24}px` }}>
        {level > 0 && (
          <span
            className="absolute left-0 top-1/2 -translate-y-1/2 border-t border-dashed border-gray-400 w-4 z-10"
            style={{
              left: `${(level - 1) * 24 + 8}px`,
              width: '16px',
              height: '0px',
            }}
          />
        )}
        <button
          onClick={() => onMenuSelect(node.id)}
          className={`relative z-10 w-full flex items-center justify-between px-3 py-2.5 text-left rounded-lg transition-all duration-200
            ${
              level === 0 && isActive
                ? (hasChildren
                    ? 'bg-red-50 text-red-700 border-l-3 border-red-600'
                    : 'bg-red-50 text-red-700')
                : isActive
                  ? 'text-red-700 font-bold'
                  : (hasChildren
                      ? 'text-gray-700 hover:bg-gray-50'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900')
            }
          `}
        >
          <div className="flex items-center space-x-3">
            {/* Always show icon for level 1 menu inside button, even if no sub menu */}
            {isMenuItem(node) && level === 0 && node.icon && (
              <span className="flex-shrink-0 text-gray-400">{iconMap[node.icon]}</span>
            )}
            <span className={`text-sm ${level > 0 ? 'font-normal' : 'font-medium'} ${level > 0 && isActive ? 'text-red-700 font-bold' : ''}`}>{highlightText(node.title, (typeof window !== 'undefined' && window.document) ? (document.querySelector('input[placeholder="Tìm kiếm menu..."]') as HTMLInputElement)?.value || '' : '')}</span>
          </div>
          {hasChildren && !isSearching && (
            <span
              className={`transition-transform duration-200 cursor-pointer ${isExpanded ? 'rotate-180' : ''}`}
              onClick={handleToggle}
            >
              <ChevronDown size={14} className="text-gray-400 hover:text-red-400" />
            </span>
          )}
          {hasChildren && isSearching && (
            <span
              className={`transition-transform duration-200 cursor-pointer ${isExpanded ? 'rotate-180' : ''}`}
              onClick={handleToggle}
            >
              <ChevronDown size={14} className="text-gray-400 hover:text-red-400" />
            </span>
          )}
        </button>
      </div>
      {hasChildren && isExpanded && (
        <div className="relative">
          {node.subItems!.map((child) => (
            <SidebarMenuNode
              key={child.id}
              node={child}
              level={level + 1}
              expandedPath={expandedPath}
              onMenuSelect={onMenuSelect}
              location={location}
              setExpandedPath={setExpandedPath}
              isSearching={isSearching}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function Sidebar({
  activeMenu,
  onMenuSelect,
  isCollapsed,
  isMobile = false,
}: SidebarProps) {
  const [expandedPath, setExpandedPath] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSidebarHovered, setSidebarHovered] = useState(false);
  const [originalMenuState, setOriginalMenuState] = useState<{ expandedPath: string[]; activeMenu: string | null } | null>(null);
  const location = useLocation();
  const searchInputRef = React.useRef<HTMLInputElement>(null);

  // Lắng nghe Ctrl+K để focus vào ô tìm kiếm
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleMenuSelect = (menuId: string) => {
    const path = findPathToNode(menuGroups.flatMap(g => g.items), menuId);
    if (path) setExpandedPath(path);
    onMenuSelect(menuId);
    // Nếu đang search, cập nhật lại trạng thái activeMenu tạm thời
    if (searchTerm && !originalMenuState) {
      setOriginalMenuState({ expandedPath, activeMenu });
    }
  };


  // Filter menu items based on search term, hỗ trợ cấp 3, chỉ show menu cha có con phù hợp
  const filterMenuItems = (groups: MenuGroup[]) => {
    if (!searchTerm) return groups; // Không filter nếu không search

    // Lấy tất cả path đến các node khớp
    const allPaths = groups.flatMap(group =>
      findAllPathsToMatchedNodes(group.items, searchTerm, [group.id])
    );

    // Lấy tất cả id cần show (menu cha và con)
    const idsToShow = new Set<string>();
    allPaths.forEach(path => path.forEach(id => idsToShow.add(id)));

    // Filter lại menu, chỉ giữ các node có id nằm trong idsToShow
    return groups
      .map(group => {
        if (!idsToShow.has(group.id)) return null;
        return {
          ...group,
          items: group.items
            .filter(item => idsToShow.has(item.id))
            .map(item => ({
              ...item,
              subItems: item.subItems
                ? item.subItems
                    .filter(sub => idsToShow.has(sub.id))
                    .map(sub => ({
                      ...sub,
                      subItems: (sub as any).subItems
                        ? (sub as any).subItems.filter((third: any) => idsToShow.has(third.id))
                        : undefined,
                    }))
                : undefined,
            })),
        };
      })
      .filter(Boolean) as MenuGroup[];
  };

  const filteredMenuGroups = filterMenuItems(menuGroups);

  // Lưu trạng thái menu gốc khi bắt đầu search, khôi phục khi xóa search
  useEffect(() => {
    if (searchTerm) {
      // Khi bắt đầu search, lưu trạng thái menu gốc nếu chưa lưu
      if (!originalMenuState) {
        setOriginalMenuState({ expandedPath, activeMenu });
      }
      // Khi search, mở tất cả menu có kết quả khớp
      const allMatchedPaths: string[] = [];
      for (const group of menuGroups) {
        const paths = findAllPathsToMatchedNodes(group.items, searchTerm, [group.id]);
        paths.forEach(path => {
          // Thêm tất cả các node trong path vào danh sách expanded
          path.forEach(nodeId => {
            if (!allMatchedPaths.includes(nodeId)) {
              allMatchedPaths.push(nodeId);
            }
          });
        });
      }
      // Set expanded path để hiển thị tất cả menu có kết quả
      setExpandedPath(allMatchedPaths);
    } else {
      // Khi xóa search, kiểm tra trạng thái menu
      if (originalMenuState) {
        setExpandedPath(originalMenuState.expandedPath);
        setOriginalMenuState(null);
      }
    }
  }, [searchTerm]);

  // Khi activeMenu thay đổi, luôn mở parent menu (chỉ khi không search)
  useEffect(() => {
    if (!searchTerm && activeMenu) {
      const path = findPathToNode(menuGroups.flatMap(g => g.items), activeMenu);
      if (path) setExpandedPath(path);
    }
  }, [activeMenu, searchTerm]);

  // Collapsed sidebar with hover-to-expand floating overlay
  if (isCollapsed && !isMobile) {
    return (
      <>
        <div
          className="bg-white border-r border-gray-200 w-16 h-screen flex flex-col z-20"
          onMouseEnter={() => setSidebarHovered(true)}
          onMouseLeave={() => setSidebarHovered(false)}
          style={{ position: 'relative' }}
        >
          <div className="p-3 border-b border-gray-200 flex-shrink-0">
            <div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">A</span>
            </div>
          </div>
          <nav className="flex-1 overflow-y-auto p-2">
            <div className="space-y-1">
              {menuGroups.map((group) => (
                <div key={group.id}>
                  {group.items.map((item) => {
                    // Determine if this menu item or any of its submenus is active
                    const hasChildren = !!item.subItems && item.subItems.length > 0;
                    const isActive = (() => {
                      if (activeMenu === item.id) return true;
                      if (hasChildren) {
                        // Check if any subItem is active
                        if (item.subItems?.some(sub => sub.id === activeMenu)) return true;
                        // Check for nested subItems (level 3)
                        return item.subItems?.some(sub => (sub as any).subItems?.some((third: any) => third.id === activeMenu));
                      }
                      return false;
                    })();
                    return (
                      <button
                        key={item.id}
                        onClick={() => onMenuSelect(item.id)}
                        className={`w-full flex items-center justify-center p-3 rounded-lg transition-all duration-200 ${
                          isActive
                            ? 'bg-red-50 text-red-700'
                            : 'text-gray-700 hover:bg-gray-50'
                        }`}
                        title={item.title}
                      >
                        <div className={`${isActive ? 'text-red-600' : 'text-gray-400'}`}>
                          {iconMap[item.icon]}
                        </div>
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>
          </nav>
        </div>
        {/* Floating expanded sidebar overlay on hover */}
        {isSidebarHovered && (
          <div
            className="fixed left-0 top-0 h-screen w-64 bg-white border-r border-gray-200 shadow-lg z-50 flex flex-col"
            onMouseEnter={() => setSidebarHovered(true)}
            onMouseLeave={() => setSidebarHovered(false)}
            style={{ pointerEvents: 'auto' }}
          >
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
                    <div className="space-y-1 relative">
                      {group.items.map((item) => (
                        <SidebarMenuNode
                          key={item.id}
                          node={item}
                          level={0}
                          expandedPath={expandedPath}
                          onMenuSelect={handleMenuSelect}
                          location={location}
                          setExpandedPath={setExpandedPath}
                          isSearching={!!searchTerm}
                        />
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
        )}
      </>
    );
  }

  return (
    <div
      className={`bg-white border-r border-gray-200 ${
        isMobile ? 'w-64' : 'w-64'
      } h-screen flex flex-col`}
    >
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
            ref={searchInputRef}
            type="text"
            placeholder="Tìm kiếm menu..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-9 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
          />
          {searchTerm && (
            <button
              type="button"
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-500 focus:outline-none"
              onClick={() => setSearchTerm("")}
              tabIndex={-1}
              aria-label="Xóa tìm kiếm"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
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
              <div className="space-y-1 relative">
                {group.items.map((item) => (
                  <SidebarMenuNode
                    key={item.id}
                    node={item}
                    level={0}
                    expandedPath={expandedPath}
                    onMenuSelect={handleMenuSelect}
                    location={location}
                    setExpandedPath={setExpandedPath}
                    isSearching={!!searchTerm}
                  />
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