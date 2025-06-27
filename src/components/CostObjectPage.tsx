import React, { useState, useEffect, Fragment } from 'react';
import * as Icons from 'lucide-react';

interface CostCenter {
  id: string;
  code: string;
  nameVi: string;
  nameEn: string;
  nameKo: string;
  parentObject: string; // lưu id của parent, hoặc '' nếu không có
  notes: string;
  createdDate: string;
  status: 'active' | 'inactive';
}

const CostCenterManagement: React.FC = () => {
  // Dữ liệu mẫu với parentObject là id
  const [costCenters, setCostCenters] = useState<CostCenter[]>([
    {
      id: '1',
      code: 'CC001',
      nameVi: 'Phòng Sản Xuất',
      nameEn: 'Production Department',
      nameKo: '생산부',
      parentObject: '',
      notes: 'Phòng ban chịu trách nhiệm sản xuất sản phẩm',
      createdDate: '2024-01-15',
      status: 'active'
    },
    {
      id: '2',
      code: 'CC002',
      nameVi: 'Phòng Marketing',
      nameEn: 'Marketing Department',
      nameKo: '마케팅부',
      parentObject: '1',
      notes: 'Phòng ban phụ trách marketing và bán hàng',
      createdDate: '2024-01-10',
      status: 'active'
    },
    {
      id: '3',
      code: 'CC003',
      nameVi: 'Phòng Kế Toán',
      nameEn: 'Accounting Department',
      nameKo: '회계부',
      parentObject: '',
      notes: 'Phòng ban quản lý tài chính và kế toán',
      createdDate: '2024-01-05',
      status: 'active'
    }
  ]);

  // State phụ trợ
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<CostCenter | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [showActionMenu, setShowActionMenu] = useState<string | null>(null);
  const [showPrintMenu, setShowPrintMenu] = useState(false);

  // Phân trang chỉ trên parent items
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // Sort
  const [sortField, setSortField] = useState<keyof CostCenter>('code');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // Form data
  const [formData, setFormData] = useState({
    code: '',
    nameVi: '',
    nameEn: '',
    nameKo: '',
    parentObject: '',
    notes: ''
  });

  // State lưu hàng đã expand
  const [expandedRows, setExpandedRows] = useState<string[]>([]);

  // Toggle expand/collapse
  const toggleRow = (id: string) => {
    setExpandedRows(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  // Làm mới dữ liệu hiển thị theo search + sort
  const filteredAndSorted = costCenters
    .filter(item =>
      item.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.nameVi.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.nameEn.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.nameKo.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      const aVal = a[sortField];
      const bVal = b[sortField];
      if (sortDirection === 'asc') return aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
      else return aVal > bVal ? -1 : aVal < bVal ? 1 : 0;
    });

  // Lọc ra chỉ các parent (parentObject === '')
  const parentItems = filteredAndSorted.filter(item => !item.parentObject);
  const totalPages = Math.ceil(parentItems.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, parentItems.length);
  const paginatedParents = parentItems.slice(startIndex, endIndex);

  // Danh sách options cho select Parent (loại bỏ chính nó khi edit)
  const parentOptions = costCenters.filter(cc =>
    !cc.parentObject && cc.id !== (editingItem?.id ?? '')
  );

  // Xử lý sort khi click header
  const handleSort = (field: keyof CostCenter) => {
    if (sortField === field) setSortDirection(d => d === 'asc' ? 'desc' : 'asc');
    else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Các hàm thêm/sửa/xóa giống trước (giữ nguyên)...
  // ... handleAdd, handleEdit, handleDelete, handleSubmit, handleSelectAll, handleSelectItem, handleBulkDelete, handlePrint, handleExport, useEffect đóng dropdown

  // --- RENDER ---
  return (
    <div className="p-6 space-y-6">
      {/* ... Header, Filters, Statistics (giữ nguyên) ... */}
      
      {/* Bảng dữ liệu */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-red-50 border-b border-red-200">
              <tr>
                <th className="px-4 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedItems.length === paginatedParents.length && paginatedParents.length > 0}
                    onChange={e => {
                      const checked = e.target.checked;
                      setSelectedItems(checked
                        ? paginatedParents.map(item => item.id)
                        : []);
                    }}
                    className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                  />
                </th>
                {/* Mã đối tượng (có mũi tên expand) */}
                <th
                  className="px-4 py-3 text-left text-sm font-semibold text-red-700 cursor-pointer hover:bg-red-100"
                  onClick={() => handleSort('code')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Mã đối tượng</span>
                    {sortField === 'code' &&
                      (sortDirection === 'asc'
                        ? <Icons.ChevronUp size={16}/>
                        : <Icons.ChevronDown size={16}/>)
                    }
                  </div>
                </th>
                {/* Tiếng Việt */}
                <th
                  className="px-4 py-3 text-left text-sm font-semibold text-red-700 cursor-pointer hover:bg-red-100"
                  onClick={() => handleSort('nameVi')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Tiếng Việt</span>
                    {sortField === 'nameVi' &&
                      (sortDirection === 'asc'
                        ? <Icons.ChevronUp size={16}/>
                        : <Icons.ChevronDown size={16}/>)
                    }
                  </div>
                </th>
                {/* Tiếng Anh */}
                <th className="px-4 py-3 text-left text-sm font-semibold text-red-700">
                  Tiếng Anh
                </th>
                {/* Tiếng Hàn */}
                <th className="px-4 py-3 text-left text-sm font-semibold text-red-700">
                  Tiếng Hàn
                </th>
                {/* Ghi chú */}
                <th className="px-4 py-3 text-left text-sm font-semibold text-red-700">
                  Ghi chú
                </th>
                {/* Thao tác */}
                <th className="px-4 py-3 text-center text-sm font-semibold text-red-700">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {paginatedParents.map(parent => (
                <Fragment key={parent.id}>
                  {/* Parent row */}
                  <tr className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selectedItems.includes(parent.id)}
                        onChange={e => {
                          const checked = e.target.checked;
                          setSelectedItems(prev =>
                            checked
                              ? [...prev, parent.id]
                              : prev.filter(id => id !== parent.id)
                          );
                        }}
                        className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                      />
                    </td>
                    <td className="px-4 py-3 flex items-center">
                      {/* Icon expand nếu có con */}
                      {costCenters.some(c => c.parentObject === parent.id) && (
                        <button
                          onClick={() => toggleRow(parent.id)}
                          className="mr-2 p-1 hover:bg-gray-100 rounded"
                        >
                          {expandedRows.includes(parent.id)
                            ? <Icons.ChevronDown size={16}/>
                            : <Icons.ChevronRight size={16}/>}
                        </button>
                      )}
                      <span className="font-medium text-gray-900">
                        {parent.code}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-gray-900">{parent.nameVi}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-gray-700">{parent.nameEn}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-gray-700">{parent.nameKo}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className="text-gray-600 text-sm truncate max-w-xs block"
                        title={parent.notes}
                      >
                        {parent.notes}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      {/* Action menu (giữ nguyên) */}
                      <div className="relative action-dropdown">
                        <button
                          onClick={() =>
                            setShowActionMenu(
                              showActionMenu === parent.id ? null : parent.id
                            )
                          }
                          className="inline-flex items-center px-3 py-1 rounded-lg text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
                        >
                          <Icons.MoreHorizontal size={16} />
                        </button>
                        {showActionMenu === parent.id && (
                          <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                            <button
                              onClick={() => {
                                /* xem chi tiết */
                                handleEdit(parent);
                              }}
                              className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center space-x-2 text-sm"
                            >
                              <Icons.Eye size={16} className="text-blue-500" />
                              <span>Xem chi tiết</span>
                            </button>
                            <button
                              onClick={() => handleEdit(parent)}
                              className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center space-x-2 text-sm"
                            >
                              <Icons.Edit size={16} className="text-green-500" />
                              <span>Chỉnh sửa</span>
                            </button>
                            <button
                              onClick={() => handleDelete(parent.id)}
                              className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center space-x-2 text-sm text-red-600"
                            >
                              <Icons.Trash2 size={16} />
                              <span>Xóa</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                  {/* Children rows */}
                  {expandedRows.includes(parent.id) &&
                    filteredAndSorted
                      .filter(c => c.parentObject === parent.id)
                      .map(child => (
                        <tr
                          key={child.id}
                          className="hover:bg-gray-50 transition-colors"
                        >
                          <td className="px-4 py-3">
                            <input
                              type="checkbox"
                              checked={selectedItems.includes(child.id)}
                              onChange={e => {
                                const checked = e.target.checked;
                                setSelectedItems(prev =>
                                  checked
                                    ? [...prev, child.id]
                                    : prev.filter(id => id !== child.id)
                                );
                              }}
                              className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                            />
                          </td>
                          <td className="px-4 py-3 pl-8">
                            <span className="text-gray-900">{child.code}</span>
                          </td>
                          <td className="px-4 py-3">
                            <span className="text-gray-900">{child.nameVi}</span>
                          </td>
                          <td className="px-4 py-3">
                            <span className="text-gray-700">{child.nameEn}</span>
                          </td>
                          <td className="px-4 py-3">
                            <span className="text-gray-700">{child.nameKo}</span>
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className="text-gray-600 text-sm truncate max-w-xs block"
                              title={child.notes}
                            >
                              {child.notes}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-center">
                            {/* Có thể tái sử dụng action-dropdown */}
                          </td>
                        </tr>
                      ))
                  }
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>
        {/* Pagination cập nhật cho parentItems */}
        <div className="bg-gray-50 px-6 py-3 flex items-center justify-between border-t border-gray-200">
          <div>
            <span className="text-sm text-gray-700">
              Hiển thị {startIndex + 1} – {endIndex} của {parentItems.length} kết quả
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 rounded border border-gray-300 text-sm hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Trước
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
              <button
                key={p}
                onClick={() => setCurrentPage(p)}
                className={`px-3 py-1 rounded text-sm ${
                  currentPage === p
                    ? 'bg-red-600 text-white'
                    : 'border border-gray-300 hover:bg-gray-100'
                }`}
              >
                {p}
              </button>
            ))}
            <button
              onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 rounded border border-gray-300 text-sm hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Sau
            </button>
          </div>
        </div>
      </div>

      {/* Modal Add/Edit */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            {/* ... header giống trước ... */}
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* ... các trường khác ... */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Đối tượng gốc
                </label>
                <select
                  value={formData.parentObject}
                  onChange={e =>
                    setFormData(prev => ({
                      ...prev,
                      parentObject: e.target.value
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
                >
                  <option value="">Không có cha</option>
                  {parentOptions.map(opt => (
                    <option key={opt.id} value={opt.id}>
                      {opt.code}
                    </option>
                  ))}
                </select>
              </div>
              {/* ... nút lưu/hủy ... */}
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CostCenterManagement;
