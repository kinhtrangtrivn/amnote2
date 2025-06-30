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

const CostObjectPage: React.FC = () => {
  // --- State dữ liệu ---
  const [doiTuongList, setDoiTuongList] = useState<DoiTuongTapHopChiPhi[]>([
    { id: '1', code: 'CC001', nameVi: 'Phòng Sản Xuất', nameEn: 'Production Dept', nameKo: '생산부', parentObject: '', notes: 'Bộ phận sản xuất', createdDate: '2024-01-15', status: 'active' },
    { id: '2', code: 'CC002', nameVi: 'Phòng Marketing',   nameEn: 'Marketing Dept',  nameKo: '마케팅부', parentObject: '1', notes: 'Con của CC001',      createdDate: '2024-01-16', status: 'active' },
    { id: '3', code: 'CC003', nameVi: 'Phòng Kế Toán',     nameEn: 'Accounting Dept', nameKo: '회계부',  parentObject: '', notes: 'Bộ phận kế toán',       createdDate: '2024-01-05', status: 'active' },
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
  const handleExport = () => alert('Đang xuất Excel…');

  // Đóng dropdown khi click ngoài
  useEffect(() => {
    const onClickOutside = (e: MouseEvent) => {
      const t = e.target as Element;
      if (showPrintMenu && !t.closest('.print-dropdown')) setShowPrintMenu(false);
      if (showActionMenu && !t.closest('.action-dropdown')) setShowActionMenu(null);
    };
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, [showPrintMenu, showActionMenu]);

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

  // --- Select Đối tượng gốc: flat toàn bộ list, nhưng ẩn chính item đang edit ---
  const parentOptions = doiTuongList.filter(opt =>
    !editingItem || opt.id !== editingItem.id
  );

  return (
    <div className=" space-y-6">
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
              <Icons.Printer size={16}/> <span class="hidden sm:block">In ấn</span>
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
          <button onClick={handleExport}
            className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm flex items-center space-x-2 hover:bg-green-700"
          >
            <Icons.Download size={16}/> <span class="hidden sm:block">Xuất Excel</span>
          </button>
          {/* Thêm mới */}
          <button onClick={handleAdd}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm flex items-center space-x-2 hover:bg-blue-700"
          >
            <Icons.Plus size={16}/> <span>Thêm mới</span>
          </button>
        </div>
      </div>

      {/* SEARCH & BULK ACTION */}
      <div className="bg-white rounded-xl shadow border ">
        <div className="flex items-center justify-between p-6">
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
          {selectedItems.length > 0 && (
            <div className="flex items-center space-x-4">
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
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedItems.length === displayed.length && displayed.length > 0}
                    onChange={e => handleSelectAll(e.target.checked)}
                    className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                  />
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-red-700">Mã đối tượng</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-red-700">Tiếng Việt</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-red-700">Tiếng Anh</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-red-700">Tiếng Hàn</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-red-700">Ghi chú</th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-red-700">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {displayed.map(({ item, depth }) => {
                const hasChildren = Boolean(childrenMap[item.id]?.length);
                const isExpanded  = expandedParents.includes(item.id);
                return (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selectedItems.includes(item.id)}
                        onChange={e => handleSelectOne(item.id, e.target.checked)}
                        className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                      />
                    </td>
                    <td className="px-4 py-3">
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
                          {item.code}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">{item.nameVi}</td>
                    <td className="px-4 py-3">{item.nameEn}</td>
                    <td className="px-4 py-3">{item.nameKo}</td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-gray-600 truncate max-w-xs block" title={item.notes}>
                        {item.notes}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="relative action-dropdown">
                        <button
                          onClick={() => setShowActionMenu(m => m === item.id ? null : item.id)}
                          className="inline-flex items-center text-gray-700 bg-gray-100 px-2 py-1 rounded-lg hover:bg-gray-200"
                        >
                          <Icons.MoreHorizontal size={16}/>
                        </button>
                        {showActionMenu === item.id && (
                          <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border z-10">
                            <button onClick={() => handleEdit(item)}
                              className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center space-x-2 text-sm"
                            >
                              <Icons.Edit size={16} className="text-green-500"/> <span>Chỉnh sửa</span>
                            </button>
                            <button onClick={() => handleDelete(item.id)}
                              className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center space-x-2 text-sm text-red-600"
                            >
                              <Icons.Trash2 size={16}/> <span>Xóa</span>
                            </button>
                          </div>
                        )}
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
