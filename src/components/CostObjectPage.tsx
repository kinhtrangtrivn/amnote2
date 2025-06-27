import React, { useState, useEffect } from 'react';
import * as Icons from 'lucide-react';

/** Interface mô tả một Đối tượng tập hợp chi phí */
interface DoiTuongTapHopChiPhi {
  id: string;
  code: string;
  nameVi: string;
  nameEn: string;
  nameKo: string;
  parentObject: string;   // id của cha, hoặc '' nếu là root
  notes: string;
  createdDate: string;
  status: 'active' | 'inactive';
}

/** Component chính: Quản lý Đối tượng tập hợp chi phí */
const CostCenterManagement: React.FC = () => {
  /** Dữ liệu mẫu */
  const [doiTuongList, setDoiTuongList] = useState<DoiTuongTapHopChiPhi[]>([
    { id: '1', code: 'CC001', nameVi: 'Phòng Sản Xuất',  nameEn: 'Production Department', nameKo: '생산부', parentObject: '', notes: 'Chịu trách nhiệm sản xuất', createdDate: '2024-01-15', status: 'active' },
    { id: '2', code: 'CC002', nameVi: 'Phòng Marketing',    nameEn: 'Marketing Department',   nameKo: '마케팅부', parentObject: '1', notes: 'Phụ trách marketing',         createdDate: '2024-01-10', status: 'active' },
    { id: '3', code: 'CC003', nameVi: 'Phòng Kế Toán',     nameEn: 'Accounting Department',  nameKo: '회계부', parentObject: '', notes: 'Quản lý tài chính',          createdDate: '2024-01-05', status: 'active' },
  ]);

  /** State cho tree–view */
  const [expandedParents, setExpandedParents] = useState<string[]>([]);
  const toggleExpand = (id: string) => {
    setExpandedParents(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  /** Modal thêm/sửa */
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<DoiTuongTapHopChiPhi | null>(null);
  const [formData, setFormData] = useState({
    code: '', nameVi: '', nameEn: '', nameKo: '', parentObject: '', notes: ''
  });

  /** Search, select, pagination */
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [showActionMenu, setShowActionMenu] = useState<string | null>(null);
  const [showPrintMenu, setShowPrintMenu] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  /** Lọc dữ liệu theo search */
  const filtered = doiTuongList.filter(item =>
    item.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.nameVi.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.nameEn.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.nameKo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  /** Xây dựng map con theo cha */
  const childrenMap: Record<string, DoiTuongTapHopChiPhi[]> = {};
  filtered.forEach(item => {
    if (item.parentObject) {
      if (!childrenMap[item.parentObject]) childrenMap[item.parentObject] = [];
      childrenMap[item.parentObject].push(item);
    }
  });

  /** Danh sách root */
  const rootItems = filtered.filter(item => !item.parentObject);

  /** Hàm flatten theo tree–view */
  const flatten = (items: DoiTuongTapHopChiPhi[]): DoiTuongTapHopChiPhi[] => {
    return items.reduce<DoiTuongTapHopChiPhi[]>((acc, item) => {
      acc.push(item);
      if (expandedParents.includes(item.id) && childrenMap[item.id]) {
        acc.push(...flatten(childrenMap[item.id]));
      }
      return acc;
    }, []);
  };

  /** Danh sách đã flatten, sẵn sàng phân trang */
  const flattenedList = flatten(rootItems);
  const totalPages = Math.ceil(flattenedList.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const displayed = flattenedList.slice(startIndex, startIndex + itemsPerPage);

  /** Options cho select Đối tượng gốc (chỉ root) */
  const parentOptions = doiTuongList.filter(item => !item.parentObject);

  /** CRUD và các hàm hỗ trợ */
  const handleAdd = () => {
    setEditingItem(null);
    setFormData({ code: '', nameVi: '', nameEn: '', nameKo: '', parentObject: '', notes: '' });
    setIsModalOpen(true);
  };
  const handleEdit = (item: DoiTuongTapHopChiPhi) => {
    setEditingItem(item);
    setFormData({
      code: item.code, nameVi: item.nameVi, nameEn: item.nameEn,
      nameKo: item.nameKo, parentObject: item.parentObject, notes: item.notes
    });
    setShowActionMenu(null);
    setIsModalOpen(true);
  };
  const handleDelete = (id: string) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa mục này?')) {
      setDoiTuongList(prev => prev.filter(x => x.id !== id));
    }
    setShowActionMenu(null);
  };
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
  const handleSelectAll = (checked: boolean) =>
    setSelectedItems(checked ? displayed.map(x => x.id) : []);
  const handleSelectOne = (id: string, checked: boolean) =>
    setSelectedItems(prev => checked ? [...prev, id] : prev.filter(x => x !== id));
  const handleBulkDelete = () => {
    if (selectedItems.length && window.confirm(`Xóa ${selectedItems.length} mục đã chọn?`)) {
      setDoiTuongList(prev => prev.filter(x => !selectedItems.includes(x.id)));
      setSelectedItems([]);
    }
  };
  const handlePrint = (lang: 'vi'|'en'|'ko') => {
    const lbl = { vi:'Tiếng Việt', en:'English', ko:'한국어' }[lang];
    alert(`Đang xuất báo cáo (${lbl})…`);
    setShowPrintMenu(false);
  };
  const handleExport = () => alert('Đang xuất ra Excel…');

  /** Đóng dropdown khi click ngoài */
  useEffect(() => {
    const onClickOutside = (e: MouseEvent) => {
      const t = e.target as Element;
      if (showPrintMenu && !t.closest('.print-dropdown')) setShowPrintMenu(false);
      if (showActionMenu && !t.closest('.action-dropdown')) setShowActionMenu(null);
    };
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, [showPrintMenu, showActionMenu]);

  return (
    <div className="p-6 space-y-6">
      {/* HEADER & ACTIONS */}
      <div className="flex flex-col sm:flex-row items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Đối tượng tập hợp chi phí</h1>
          <p className="text-gray-600 mt-1">Quản lý các đối tượng tập hợp chi phí</p>
        </div>
        <div className="flex items-center space-x-3 mt-4 sm:mt-0">
          {/* In ấn */}
          <div className="relative print-dropdown">
            <button
              onClick={() => setShowPrintMenu(v => !v)}
              className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm flex items-center space-x-2 hover:bg-red-700"
            >
              <Icons.Printer size={16}/> <span>In ấn</span> <Icons.ChevronDown size={16}/>
            </button>
            {showPrintMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-20">
                <button onClick={() => handlePrint('vi')}
                  className="w-full text-left px-4 py-3 hover:bg-gray-50 flex items-center space-x-2 text-sm border-b border-gray-100"
                >
                  <Icons.FileText size={16} className="text-blue-500"/> <span>Tiếng Việt</span>
                </button>
                <button onClick={() => handlePrint('en')}
                  className="w-full text-left px-4 py-3 hover:bg-gray-50 flex items-center space-x-2 text-sm border-b border-gray-100"
                >
                  <Icons.FileText size={16} className="text-green-500"/> <span>English</span>
                </button>
                <button onClick={() => handlePrint('ko')}
                  className="w-full text-left px-4 py-3 hover:bg-gray-50 flex items-center space-x-2 text-sm"
                >
                  <Icons.FileText size={16} className="text-purple-500"/> <span>한국어</span>
                </button>
              </div>
            )}
          </div>
          {/* Xuất Excel */}
          <button onClick={handleExport}
            className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm flex items-center space-x-2 hover:bg-green-700"
          >
            <Icons.Download size={16}/> <span>Xuất Excel</span>
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
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="relative">
            <Icons.Search size={16}
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              placeholder="Tìm kiếm mã, tên…"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
            />
          </div>
          {selectedItems.length > 0 && (
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">Đã chọn {selectedItems.length} mục</span>
              <button onClick={handleBulkDelete}
                className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
              >
                Xóa đã chọn
              </button>
            </div>
          )}
        </div>
      </div>

      {/* DATA TABLE */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-red-50 border-b border-red-200">
              <tr>
                <th className="px-4 py-3">
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
              {displayed.map(item => {
                const isChild = Boolean(item.parentObject);
                const hasChildren = Boolean(childrenMap[item.id]?.length);
                const isExpanded = expandedParents.includes(item.id);
                return (
                  <tr key={item.id}
                    className={`hover:bg-gray-50 transition-colors ${isChild ? 'bg-gray-50' : ''}`}
                  >
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selectedItems.includes(item.id)}
                        onChange={e => handleSelectOne(item.id, e.target.checked)}
                        className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <div className={`flex items-center ${isChild ? 'ml-10 text-gray-600 italic' : ''}`}>
                        {!isChild && hasChildren && (
                          <button onClick={() => toggleExpand(item.id)} className="mr-2">
                            {isExpanded ? <Icons.ChevronDown size={16}/> : <Icons.ChevronRight size={16}/>}
                          </button>
                        )}
                        <span className={isChild ? '' : 'font-medium text-gray-900'}>{item.code}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3"><span className="text-gray-900">{item.nameVi}</span></td>
                    <td className="px-4 py-3"><span className="text-gray-700">{item.nameEn}</span></td>
                    <td className="px-4 py-3"><span className="text-gray-700">{item.nameKo}</span></td>
                    <td className="px-4 py-3">
                      <span className="text-gray-600 text-sm truncate max-w-xs block" title={item.notes}>
                        {item.notes}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="relative action-dropdown">
                        <button
                          onClick={() => setShowActionMenu(m => m === item.id ? null : item.id)}
                          className="inline-flex items-center px-3 py-1 rounded-lg text-sm bg-gray-100 text-gray-700 hover:bg-gray-200"
                        >
                          <Icons.MoreHorizontal size={16}/>
                        </button>
                        {showActionMenu === item.id && (
                          <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                            <button onClick={() => handleEdit(item)}
                              className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center space-x-2 text-sm"
                            >
                              <Icons.Eye size={16} className="text-blue-500"/><span>Xem chi tiết</span>
                            </button>
                            <button onClick={() => handleEdit(item)}
                              className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center space-x-2 text-sm"
                            >
                              <Icons.Edit size={16} className="text-green-500"/><span>Chỉnh sửa</span>
                            </button>
                            <button onClick={() => handleDelete(item.id)}
                              className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center space-x-2 text-sm text-red-600"
                            >
                              <Icons.Trash2 size={16}/><span>Xóa</span>
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
            Hiển thị {startIndex + 1} - {Math.min(startIndex + itemsPerPage, flattenedList.length)} của {flattenedList.length} kết quả
          </div>
          <div className="flex items-center space-x-2">
            <button onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 rounded border border-gray-300 text-sm hover:bg-gray-100 disabled:opacity-50"
            >
              Trước
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <button key={page} onClick={() => setCurrentPage(page)}
                className={`px-3 py-1 rounded text-sm ${currentPage === page ? 'bg-red-600 text-white' : 'border border-gray-300 hover:bg-gray-100'}`}
              >
                {page}
              </button>
            ))}
            <button onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 rounded border border-gray-300 text-sm hover:bg-gray-100 disabled:opacity-50"
            >
              Sau
            </button>
          </div>
        </div>
      </div>

      {/* MODAL THÊM / CHỈNH SỬA */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">
                {editingItem ? 'Chỉnh sửa đối tượng tập hợp chi phí' : 'Thêm mới đối tượng tập hợp chi phí'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <Icons.X size={20} className="text-gray-500"/>
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Mã đối tượng */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mã đối tượng <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text" required
                    value={formData.code}
                    onChange={e => setFormData(d => ({ ...d, code: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
                    placeholder="Nhập mã đối tượng"
                  />
                </div>
                {/* Đối tượng gốc */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Đối tượng gốc</label>
                  <select
                    value={formData.parentObject}
                    onChange={e => setFormData(d => ({ ...d, parentObject: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
                  >
                    <option value="">Không có cha</option>
                    {parentOptions.map(opt => (
                      <option key={opt.id} value={opt.id}>{opt.code}</option>
                    ))}
                  </select>
                </div>
              </div>
              {/* Tên & Ghi chú */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tên tiếng Việt <span className="text-red-500">*</span>
                </label>
                <input
                  type="text" required
                  value={formData.nameVi}
                  onChange={e => setFormData(d => ({ ...d, nameVi: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
                  placeholder="Nhập tên tiếng Việt"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tên tiếng Anh</label>
                <input
                  type="text"
                  value={formData.nameEn}
                  onChange={e => setFormData(d => ({ ...d, nameEn: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
                  placeholder="Nhập tên tiếng Anh"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tên tiếng Hàn</label>
                <input
                  type="text"
                  value={formData.nameKo}
                  onChange={e => setFormData(d => ({ ...d, nameKo: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
                  placeholder="Nhập tên tiếng Hàn"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Ghi chú</label>
                <textarea
                  rows={4}
                  value={formData.notes}
                  onChange={e => setFormData(d => ({ ...d, notes: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none resize-none"
                  placeholder="Nhập ghi chú (tùy chọn)"
                />
              </div>
              {/* Nút Hủy / Lưu */}
              <div className="flex items-center justify-end space-x-4 pt-4 border-t border-gray-200">
                <button type="button" onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
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

export default CostCenterManagement;
