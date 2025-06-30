// CostObjectPage.tsx

import React, { useState, useEffect } from 'react';
import * as Icons from 'lucide-react';

/** Mô tả cấu trúc một đối tượng tập hợp chi phí */
interface DoiTuongTapHopChiPhi {
  id: string;
  code: string;
  nameVi: string;
  nameEn: string;
  nameKo: string;
  parentObject: string; // id cha hoặc '' nếu root
  notes: string;
  createdDate: string;
  status: 'active' | 'inactive';
}

interface ColumnConfig {
  id: string;
  dataField: string;
  displayName: string;
  width: number;
  visible: boolean;
  pinned: boolean;
  originalOrder: number; // Thêm để lưu thứ tự ban đầu
}

const CostObjectPage: React.FC = () => {
  // --- State dữ liệu ---
  const [doiTuongList, setDoiTuongList] = useState<DoiTuongTapHopChiPhi[]>([
    { id: '1', code: 'CC001', nameVi: 'Phòng Sản Xuất', nameEn: 'Production Dept', nameKo: '생산부', parentObject: '', notes: 'Bộ phận sản xuất', createdDate: '2024-01-15', status: 'active' },
    { id: '2', code: 'CC002', nameVi: 'Phòng Marketing',   nameEn: 'Marketing Dept',  nameKo: '마케팅부', parentObject: '1', notes: 'Con của CC001',      createdDate: '2024-01-16', status: 'active' },
    { id: '3', code: 'CC003', nameVi: 'Phòng Kế Toán',     nameEn: 'Accounting Dept', nameKo: '회계부',  parentObject: '', notes: 'Bộ phận kế toán',       createdDate: '2024-01-05', status: 'active' },
    { id: '4', code: 'CC004', nameVi: 'Phòng IT',          nameEn: 'IT Dept',         nameKo: 'IT부',   parentObject: '1', notes: 'Con của CC001',       createdDate: '2024-01-17', status: 'active' },
    { id: '5', code: 'CC005', nameVi: 'Team Frontend',     nameEn: 'Frontend Team',   nameKo: '프론트엔드팀', parentObject: '4', notes: 'Con của CC004',       createdDate: '2024-01-18', status: 'active' },
  ]);

  // Tree-view: giữ các parent đang expand
  const [expandedParents, setExpandedParents] = useState<string[]>([]);
  const toggleExpand = (id: string) =>
    setExpandedParents(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );

  // Modal thêm/sửa
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<DoiTuongTapHopChiPhi | null>(null);
  const [formData, setFormData] = useState({
    code: '', nameVi: '', nameEn: '', nameKo: '', parentObject: '', notes: ''
  });

  // Search, chọn, bulk, export/print, phân trang
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [showActionMenu, setShowActionMenu] = useState<string | null>(null);
  const [showPrintMenu, setShowPrintMenu] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Hover state for rows
  const [hoveredRowId, setHoveredRowId] = useState<string | null>(null);

  // Toolbar states
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showSettingsPanel, setShowSettingsPanel] = useState(false);
  const [columnConfigs, setColumnConfigs] = useState<ColumnConfig[]>([
    { id: '1', dataField: 'code', displayName: 'Mã đối tượng', width: 150, visible: true, pinned: false, originalOrder: 0 },
    { id: '2', dataField: 'nameVi', displayName: 'Tiếng Việt', width: 200, visible: true, pinned: false, originalOrder: 1 },
    { id: '3', dataField: 'nameEn', displayName: 'Tiếng Anh', width: 200, visible: true, pinned: false, originalOrder: 2 },
    { id: '4', dataField: 'nameKo', displayName: 'Tiếng Hàn', width: 200, visible: true, pinned: false, originalOrder: 3 },
    { id: '5', dataField: 'notes', displayName: 'Ghi chú', width: 250, visible: true, pinned: false, originalOrder: 4 },
  ]);

  // Hàm để sắp xếp cột: pinned columns trước, sau đó là unpinned columns theo thứ tự ban đầu
  const getOrderedColumns = () => {
    const visibleColumns = columnConfigs.filter(col => col.visible);
    const pinnedColumns = visibleColumns.filter(col => col.pinned).sort((a, b) => a.originalOrder - b.originalOrder);
    const unpinnedColumns = visibleColumns.filter(col => !col.pinned).sort((a, b) => a.originalOrder - b.originalOrder);
    
    return [...pinnedColumns, ...unpinnedColumns];
  };

  // Tính toán vị trí sticky cho các cột
  const calculateStickyPositions = () => {
    const orderedColumns = getOrderedColumns();
    const pinnedColumns = orderedColumns.filter(col => col.pinned);
    const positions: { [key: string]: number } = {};
    
    // Checkbox column luôn ở vị trí 0
    const checkboxWidth = 50;
    let currentLeft = checkboxWidth;
    
    // Tính toán vị trí cho các cột pinned theo thứ tự
    pinnedColumns.forEach((col) => {
      positions[col.id] = currentLeft;
      currentLeft += col.width;
    });
    
    return positions;
  };

  const stickyPositions = calculateStickyPositions();

  // Hàm để lấy style cho cột
  const getColumnStyle = (column: ColumnConfig) => {
    if (!column.pinned) return {};
    
    return {
      position: 'sticky' as const,
      left: stickyPositions[column.id],
      zIndex: 10,
      backgroundColor: 'white'
    };
  };

  // Hàm để lấy style cho header cột
  const getHeaderColumnStyle = (column: ColumnConfig) => {
    if (!column.pinned) return {};
    
    return {
      position: 'sticky' as const,
      left: stickyPositions[column.id],
      zIndex: 11,
      backgroundColor: '#fef2f2' // bg-red-50
    };
  };

  // Hàm để tìm tất cả các con của một đối tượng (đệ quy)
  const getAllChildren = (parentId: string, items: DoiTuongTapHopChiPhi[]): string[] => {
    const children: string[] = [];
    const directChildren = items.filter(item => item.parentObject === parentId);
    
    directChildren.forEach(child => {
      children.push(child.id);
      // Đệ quy tìm con của con
      children.push(...getAllChildren(child.id, items));
    });
    
    return children;
  };

  // --- CRUD Handlers ---
  const handleAdd = () => {
    setEditingItem(null);
    setFormData({ code: '', nameVi: '', nameEn: '', nameKo: '', parentObject: '', notes: '' });
    setIsModalOpen(true);
  };
  const handleEdit = (item: DoiTuongTapHopChiPhi) => {
    setEditingItem(item);
    setFormData({
      code: item.code,
      nameVi: item.nameVi,
      nameEn: item.nameEn,
      nameKo: item.nameKo,
      parentObject: item.parentObject,
      notes: item.notes
    });
    setIsModalOpen(true);
    setShowActionMenu(null);
  };
  const handleDelete = (id: string) => {
    if (window.confirm('Xóa đối tượng này?')) {
      setDoiTuongList(prev => prev.filter(x => x.id !== id));
    }
    setShowActionMenu(null);
  };
  const handleBulkDelete = () => {
    if (selectedItems.length > 0 &&
        window.confirm(`Xóa ${selectedItems.length} mục đã chọn?`)) {
      setDoiTuongList(prev => prev.filter(x => !selectedItems.includes(x.id)));
      setSelectedItems([]);
    }
  };
  const handleSelectAll = (checked: boolean) =>
    setSelectedItems(checked ? displayed.map(({ item }) => item.id) : []);
  const handleSelectOne = (id: string, checked: boolean) =>
    setSelectedItems(prev => checked ? [...prev, id] : prev.filter(x => x !== id));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingItem) {
      setDoiTuongList(prev =>
        prev.map(x => x.id === editingItem.id ? { ...x, ...formData } : x)
      );
    } else {
      const newItem: DoiTuongTapHopChiPhi = {
        id: Date.now().toString(),
        ...formData,
        createdDate: new Date().toISOString().split('T')[0],
        status: 'active'
      };
      setDoiTuongList(prev => [...prev, newItem]);
    }
    setIsModalOpen(false);
  };

  const handlePrint = (lang: 'vi' | 'en' | 'ko') => {
    const lbl = { vi: 'Tiếng Việt', en: 'English', ko: '한국어' }[lang];
    alert(`Đang in báo cáo (${lbl})…`);
    setShowPrintMenu(false);
  };

  // Toolbar handlers
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      // In real app, you would fetch fresh data here
      console.log('Dữ liệu đã được làm mới');
    } catch (error) {
      console.error('Lỗi khi làm mới dữ liệu:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleExportExcel = () => {
    // Create CSV content
    const orderedColumns = getOrderedColumns();
    const headers = orderedColumns.map(col => col.displayName).join(',');
    
    const rows = displayed.map(({ item }) => {
      return orderedColumns
        .map(col => {
          const value = item[col.dataField as keyof DoiTuongTapHopChiPhi] || '';
          return `"${value}"`;
        })
        .join(',');
    });

    const csvContent = [headers, ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'doi-tuong-tap-hop-chi-phi.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleColumnConfigChange = (columnId: string, field: keyof ColumnConfig, value: any) => {
    setColumnConfigs(prev => 
      prev.map(col => 
        col.id === columnId ? { ...col, [field]: value } : col
      )
    );
  };

  // Đóng dropdown khi click ngoài
  useEffect(() => {
    const onClickOutside = (e: MouseEvent) => {
      const t = e.target as Element;
      if (showPrintMenu && !t.closest('.print-dropdown')) setShowPrintMenu(false);
      if (showActionMenu && !t.closest('.action-dropdown')) setShowActionMenu(null);
      if (showSettingsPanel && !t.closest('.settings-panel') && !t.closest('.settings-trigger')) {
        setShowSettingsPanel(false);
      }
    };
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, [showPrintMenu, showActionMenu, showSettingsPanel]);

  // --- Lọc theo search ---
  const filtered = doiTuongList.filter(item =>
    item.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.nameVi.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.nameEn.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.nameKo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // --- Xây dựng cây và flatten ---
  const childrenMap: Record<string, DoiTuongTapHopChiPhi[]> = {};
  filtered.forEach(item => {
    if (item.parentObject) {
      childrenMap[item.parentObject] = childrenMap[item.parentObject] || [];
      childrenMap[item.parentObject].push(item);
    }
  });
  const rootItems = filtered.filter(item => !item.parentObject);

  interface Flattened { item: DoiTuongTapHopChiPhi; depth: number; }
  const flattenWithDepth = (items: DoiTuongTapHopChiPhi[], depth = 0): Flattened[] =>
    items.reduce<Flattened[]>((acc, item) => {
      acc.push({ item, depth });
      if (expandedParents.includes(item.id) && childrenMap[item.id]) {
        acc.push(...flattenWithDepth(childrenMap[item.id], depth + 1));
      }
      return acc;
    }, []);

  // Khi đang search: hiển thị flat list của filtered; nếu không: hiển thị tree-view
  const flattenedItems: Flattened[] = searchTerm
    ? filtered.map(item => ({ item, depth: 0 }))
    : flattenWithDepth(rootItems);

  const totalPages = Math.ceil(flattenedItems.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const displayed  = flattenedItems.slice(startIndex, startIndex + itemsPerPage);

  // --- Select Đối tượng gốc: ẩn chính item đang edit và tất cả con của nó ---
  const getValidParentOptions = () => {
    if (!editingItem) {
      // Khi thêm mới, hiển thị tất cả
      return doiTuongList;
    }

    // Khi chỉnh sửa, tìm tất cả các con của item hiện tại
    const childrenIds = getAllChildren(editingItem.id, doiTuongList);
    const excludedIds = [editingItem.id, ...childrenIds];

    // Lọc ra những đối tượng không nằm trong danh sách loại trừ
    return doiTuongList.filter(opt => !excludedIds.includes(opt.id));
  };

  const parentOptions = getValidParentOptions();

  return (
    <div className="space-y-6">
      {/* HEADER & ACTIONS */}
      <div className="flex flex-col sm:flex-row items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Đối tượng tập hợp chi phí</h1>
          <p className="text-gray-600 mt-1">Quản lý các đối tượng tập hợp chi phí</p>
        </div>
        <div className="flex items-center space-x-3 mt-4 sm:mt-0">
          {/* In ấn */}
          <div className="relative print-dropdown">
            <button onClick={() => setShowPrintMenu(m => !m)}
              className="inline-flex items-center space-x-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-sm hover:bg-gray-200"
            >
              <Icons.Printer size={16}/> <span className="hidden sm:block">In ấn</span>
            </button>
            {showPrintMenu && (
              <div className="absolute right-0 mt-2 w-40 bg-white rounded-lg shadow-lg border z-10">
                <button onClick={() => handlePrint('vi')}
                  className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center space-x-2 text-sm"
                >
                  <Icons.FileText size={16}/> <span>Tiếng Việt</span>
                </button>
                <button onClick={() => handlePrint('en')}
                  className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center space-x-2 text-sm"
                >
                  <Icons.FileText size={16}/> <span>English</span>
                </button>
                <button onClick={() => handlePrint('ko')}
                  className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center space-x-2 text-sm"
                >
                  <Icons.FileText size={16}/> <span>한국어</span>
                </button>
              </div>
            )}
          </div>
          {/* Xuất Excel */}
          <button onClick={handleExportExcel}
            className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm flex items-center space-x-2 hover:bg-green-700"
          >
            <Icons.Download size={16}/> <span className="hidden sm:block">Nhập Excel</span>
          </button>
          {/* Thêm mới */}
          <button onClick={handleAdd}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm flex items-center space-x-2 hover:bg-blue-700"
          >
            <Icons.Plus size={16}/> <span className="hidden sm:block">Thêm mới</span>
          </button>
        </div>
      </div>

      {/* SEARCH & BULK ACTION */}
      <div className="bg-white rounded-xl shadow border ">
        <div className="block sm:flex items-center justify-between p-6">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Icons.Search size={16}
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                placeholder="Tìm kiếm mã, tên…"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
              />
            </div>

            {/* Toolbar với 3 icon */}
            <div className="flex items-center bg-gray-50 rounded-lg p-1 space-x-1">
              {/* Icon Load lại */}
              <div className="relative group">
                <button
                  onClick={handleRefresh}
                  disabled={isRefreshing}
                  className="p-2 text-gray-600 hover:text-blue-600 hover:bg-white rounded-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Làm mới dữ liệu"
                >
                  <Icons.RefreshCw size={16} className={isRefreshing ? 'animate-spin' : ''} />
                </button>
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                  Làm mới dữ liệu
                </div>
              </div>

              {/* Icon Xuất Excel */}
              <div className="relative group">
                <button
                  onClick={handleExportExcel}
                  className="p-2 text-gray-600 hover:text-green-600 hover:bg-white rounded-md transition-all"
                  title="Xuất Excel"
                >
                  <Icons.FileSpreadsheet size={16} />
                </button>
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                  Xuất Excel
                </div>
              </div>

              {/* Icon Thiết lập */}
              <div className="relative group">
                <button
                  onClick={() => setShowSettingsPanel(true)}
                  className="p-2 text-gray-600 hover:text-purple-600 hover:bg-white rounded-md transition-all settings-trigger"
                  title="Thiết lập"
                >
                  <Icons.Settings size={16} />
                </button>
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                  Thiết lập
                </div>
              </div>
            </div>
          </div>

          {selectedItems.length > 0 && (
            <div className="flex mt-4 sm:mt-0 items-center space-x-4">
              <span className="text-sm text-gray-600">Đã chọn {selectedItems.length} mục</span>
              <button onClick={handleBulkDelete}
                className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm flex items-center space-x-2 hover:bg-red-700"
              >
                <Icons.Trash2 size={16}/> <span>Xóa</span>
              </button>
            </div>
          )}
        </div>

        {/* TABLE */}
        <div className="overflow-x-auto">
          <table className="min-w-full table-auto">
            <thead className="bg-red-50">
              <tr>
                <th 
                  className="sticky left-0 z-20 bg-red-50 px-4 py-3 text-left"
                  style={{ 
                    width: '50px',
                    minWidth: '50px',
                    maxWidth: '50px'
                  }}
                >
                  <input
                    type="checkbox"
                    checked={selectedItems.length === displayed.length && displayed.length > 0}
                    onChange={e => handleSelectAll(e.target.checked)}
                    className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                  />
                </th>
                {getOrderedColumns().map(col => (
                  <th 
                    key={col.id} 
                    className="px-4 py-3 text-left text-sm font-semibold text-red-700" 
                    style={{
                      width: col.width,
                      minWidth: col.width,
                      ...getHeaderColumnStyle(col)
                    }}
                  >
                    <div className="flex items-center">
                      {col.displayName}
                      {col.pinned && (
                        <Icons.Pin size={12} className="ml-1 text-red-500" />
                      )}
                    </div>
                  </th>
                ))}
                <th 
                  className="sticky right-0 z-20 bg-red-50 px-4 py-3 text-center text-sm font-semibold text-red-700"
                  style={{ 
                    width: '1px',
                    minWidth: '1px',
                    maxWidth: '1px'
                  }}
                >
                  
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {displayed.map(({ item, depth }) => {
                const hasChildren = Boolean(childrenMap[item.id]?.length);
                const isExpanded  = expandedParents.includes(item.id);
                const isHovered = hoveredRowId === item.id;
                
                return (
                  <tr 
                    key={item.id} 
                    className="hover:bg-gray-50"
                    onMouseEnter={() => setHoveredRowId(item.id)}
                    onMouseLeave={() => setHoveredRowId(null)}
                  >
                    <td 
                      className="sticky left-0 z-15 bg-white px-4 py-3"
                      style={{ 
                        width: '50px',
                        minWidth: '50px',
                        maxWidth: '50px'
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={selectedItems.includes(item.id)}
                        onChange={e => handleSelectOne(item.id, e.target.checked)}
                        className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                      />
                    </td>
                    {getOrderedColumns().map(col => (
                      <td 
                        key={col.id} 
                        className="px-4 py-3"
                        style={{
                          width: col.width,
                          minWidth: col.width,
                          ...getColumnStyle(col)
                        }}
                      >
                        {col.dataField === 'code' ? (
                          <div className="flex items-center" style={{ marginLeft: depth * 20 }}>
                            {hasChildren && (
                              <button onClick={() => toggleExpand(item.id)} className="mr-2">
                                {isExpanded
                                  ? <Icons.ChevronDown size={16}/>
                                  : <Icons.ChevronRight size={16}/>
                                }
                              </button>
                            )}
                            <span className={depth > 0 ? 'text-gray-600 italic' : 'font-medium text-gray-900'}>
                              {item[col.dataField as keyof DoiTuongTapHopChiPhi]}
                            </span>
                          </div>
                        ) : col.dataField === 'notes' ? (
                          <span className="text-sm text-gray-600 truncate max-w-xs block" title={item.notes}>
                            {item.notes}
                          </span>
                        ) : (
                          <span>{item[col.dataField as keyof DoiTuongTapHopChiPhi]}</span>
                        )}
                      </td>
                    ))}
                    <td 
                      className="sticky right-0 z-15  px-4 py-3 text-center"
                      style={{ 
                        width: '100px',
                        minWidth: '100px',
                        maxWidth: '100px'
                      }}
                    >
                      <div className={`flex items-center justify-center space-x-2 transition-opacity duration-200 ${
                        isHovered ? 'opacity-100' : 'opacity-0'
                      }`}>
                        {/* Edit Button */}
                        <div className="relative group bg-white">
                          <button
                            onClick={() => handleEdit(item)}
                            className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                          >
                            <Icons.Edit size={16} />
                          </button>
                          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-30">
                            Sửa
                          </div>
                        </div>
                        
                        {/* Delete Button */}
                        <div className="relative group bg-white">
                          <button
                            onClick={() => handleDelete(item.id)}
                            className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Icons.Trash2 size={16} />
                          </button>
                          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-30">
                            Xóa
                          </div>
                        </div>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* PHÂN TRANG */}
        <div className="bg-gray-50 px-6 py-3 flex items-center justify-between border-t border-gray-200">
          <div className="text-sm text-gray-700">
            Hiển thị {startIndex + 1}–{Math.min(startIndex + displayed.length, flattenedItems.length)} của {flattenedItems.length} kết quả
          </div>
          <div className="flex items-center space-x-2">
            <button onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 border rounded text-sm hover:bg-gray-100 disabled:opacity-50"
            >
              Trước
            </button>
            {Array.from({ length: totalPages }, (_, i) => (
              <button key={i+1} onClick={() => setCurrentPage(i+1)}
                className={`px-3 py-1 border rounded text-sm ${currentPage === i+1 ? 'bg-red-600 text-white border-red-600' : 'hover:bg-gray-100'}`}
              >
                {i+1}
              </button>
            ))}
            <button onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 border rounded text-sm hover:bg-gray-100 disabled:opacity-50"
            >
              Sau
            </button>
          </div>
        </div>
      </div>

      {/* SETTINGS PANEL */}
      {showSettingsPanel && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-end z-50">
          <div className="bg-white h-full w-96 shadow-xl settings-panel flex flex-col">
            <div className="flex-1 flex flex-col h-full ">
              <div className="flex justify-between p-6 border-b flex-col">
                <h3 className="text-lg font-semibold text-gray-900">Thiết lập bảng dữ liệu</h3>
                <button
                  onClick={() => setShowSettingsPanel(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <Icons.X size={20} className="text-gray-500" />
                </button>
                <div class="text-sm text-gray-600 mb-4">Tùy chỉnh hiển thị các cột trong bảng dữ liệu</div>
              </div>
              
              <div className="flex-1 overflow-y-auto p-6">
                <div className="space-y-4">
                  {columnConfigs.map((column) => (
                    <div key={column.id} className="border border-gray-200 rounded-lg p-4 space-y-3">
                      {/* Checkbox và tên cột */}
                      <div className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          checked={column.visible}
                          onChange={(e) => handleColumnConfigChange(column.id, 'visible', e.target.checked)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <div className="flex-1">
                          <div className="font-medium text-gray-900">{column.dataField}</div>
                          <div className="text-sm text-gray-500">Tên cột dữ liệu</div>
                        </div>
                        {column.pinned && (
                          <div className="flex items-center text-blue-600">
                            <Icons.Pin size={14} />
                            <span className="text-xs ml-1">Đã ghim</span>
                          </div>
                        )}
                      </div>
                      
                      {/* Tên hiển thị và Độ rộng cột trên cùng 1 dòng */}
                      <div className="grid grid-cols-5 gap-3">
                        <div className="col-span-3">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Tên cột hiển thị
                          </label>
                          <input
                            type="text"
                            value={column.displayName}
                            onChange={(e) => handleColumnConfigChange(column.id, 'displayName', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            disabled={!column.visible}
                          />
                        </div>
                        
                        <div className="col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Width
                          </label>
                          <input
                            type="number"
                            value={column.width}
                            onChange={(e) => handleColumnConfigChange(column.id, 'width', parseInt(e.target.value) || 100)}
                            min="50"
                            max="500"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            disabled={!column.visible}
                          />
                        </div>
                      </div>
                      
                      {/* Ghim cột */}
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={column.pinned}
                          onChange={(e) => handleColumnConfigChange(column.id, 'pinned', e.target.checked)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          disabled={!column.visible}
                        />
                        <label className="text-sm text-gray-700">
                          Ghim cột bên trái
                        </label>
                      </div>
                      
                      {/* Hiển thị vị trí sticky nếu được ghim */}
                      {column.pinned && column.visible && (
                        <div className="bg-blue-50 border border-blue-200 rounded p-2">
                          <div className="text-xs text-blue-700">
                            <Icons.Info size={12} className="inline mr-1" />
                            Vị trí sticky: {stickyPositions[column.id]}px từ trái
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Action buttons - Fixed at bottom */}
              <div className="p-6 border-t border-gray-200 flex space-x-3">
                <button
                  onClick={() => {
                    // Reset to default
                    setColumnConfigs([
                      { id: '1', dataField: 'code', displayName: 'Mã đối tượng', width: 150, visible: true, pinned: false, originalOrder: 0 },
                      { id: '2', dataField: 'nameVi', displayName: 'Tiếng Việt', width: 200, visible: true, pinned: false, originalOrder: 1 },
                      { id: '3', dataField: 'nameEn', displayName: 'Tiếng Anh', width: 200, visible: true, pinned: false, originalOrder: 2 },
                      { id: '4', dataField: 'nameKo', displayName: 'Tiếng Hàn', width: 200, visible: true, pinned: false, originalOrder: 3 },
                      { id: '5', dataField: 'notes', displayName: 'Ghi chú', width: 250, visible: true, pinned: false, originalOrder: 4 },
                    ]);
                  }}
                  className="flex-1 px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Đặt lại mặc định
                </button>
                <button
                  onClick={() => setShowSettingsPanel(false)}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Áp dụng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL THÊM/SỬA */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-bold text-gray-900">
                {editingItem ? 'Chỉnh sửa đối tượng' : 'Thêm mới đối tượng'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <Icons.X size={20} className="text-gray-500"/>
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Mã & Đối tượng gốc */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mã đối tượng <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text" required
                    value={formData.code}
                    onChange={e => setFormData(d => ({ ...d, code: e.target.value }))}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
                    placeholder="Nhập mã đối tượng"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Đối tượng gốc
                    {editingItem && (
                      <span className="text-xs text-gray-500 ml-2">
                        (Ẩn đối tượng hiện tại và các con)
                      </span>
                    )}
                  </label>
                  <select
                    value={formData.parentObject}
                    onChange={e => setFormData(d => ({ ...d, parentObject: e.target.value }))}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
                  >
                    <option value="">Không có cha</option>
                    {parentOptions.map(opt => (
                      <option key={opt.id} value={opt.id}>
                        {opt.code} – {opt.nameVi}
                      </option>
                    ))}
                  </select>
                  {editingItem && parentOptions.length < doiTuongList.length - 1 && (
                    <div className="mt-1 text-xs text-amber-600 flex items-center">
                      <Icons.Info size={12} className="mr-1" />
                      Một số tùy chọn bị ẩn để tránh vòng lặp phân cấp
                    </div>
                  )}
                </div>
              </div>

              {/* Tên & Ghi chú */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tên tiếng Việt <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text" required
                    value={formData.nameVi}
                    onChange={e => setFormData(d => ({ ...d, nameVi: e.target.value }))}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
                    placeholder="Nhập tên tiếng Việt"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tên tiếng Anh
                  </label>
                  <input
                    type="text"
                    value={formData.nameEn}
                    onChange={e => setFormData(d => ({ ...d, nameEn: e.target.value }))}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
                    placeholder="Nhập tên tiếng Anh"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tên tiếng Hàn
                  </label>
                  <input
                    type="text"
                    value={formData.nameKo}
                    onChange={e => setFormData(d => ({ ...d, nameKo: e.target.value }))}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
                    placeholder="Nhập tên tiếng Hàn"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ghi chú
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={e => setFormData(d => ({ ...d, notes: e.target.value }))}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
                    placeholder="Nhập ghi chú"
                  />
                </div>
              </div>

              {/* Buttons */}
              <div className="flex justify-end space-x-4 pt-4 border-t">
                <button type="button" onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200"
                >
                  Hủy
                </button>
                <button type="submit"
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center space-x-2"
                >
                  <Icons.Save size={16}/> <span>{editingItem ? 'Cập nhật' : 'Thêm mới'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CostObjectPage;