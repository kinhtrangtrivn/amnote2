import React, { useState } from 'react';
import * as Icons from 'lucide-react';
 
interface CostCenter {
  id: string;
  code: string;
  nameVi: string;
  nameEn: string;
  nameKo: string;
  parentObject: string;
  notes: string;
  createdDate: string;
  status: 'active' | 'inactive';
}

const CostCenterManagement: React.FC = () => {
  const [costCenters, setCostCenters] = useState<CostCenter[]>([
    {
      id: '1',
      code: 'CC001',
      nameVi: 'Phòng Sản Xuất',
      nameEn: 'Production Department',
      nameKo: '생산부',
      parentObject: 'Bộ phận chính',
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
      parentObject: 'Bộ phận hỗ trợ',
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
      parentObject: 'Bộ phận quản lý',
      notes: 'Phòng ban quản lý tài chính và kế toán',
      createdDate: '2024-01-05',
      status: 'active'
    }
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<CostCenter | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [showActionMenu, setShowActionMenu] = useState<string | null>(null);
  const [showPrintMenu, setShowPrintMenu] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [sortField, setSortField] = useState<keyof CostCenter>('code');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const [formData, setFormData] = useState({
    code: '',
    nameVi: '',
    nameEn: '',
    nameKo: '',
    parentObject: '',
    notes: ''
  });

  const parentObjects = [
    'Bộ phận chính',
    'Bộ phận hỗ trợ',
    'Bộ phận quản lý',
    'Bộ phận sản xuất',
    'Bộ phận kinh doanh'
  ];

  const handleSort = (field: keyof CostCenter) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const filteredAndSortedData = costCenters
    .filter(item => 
      item.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.nameVi.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.nameEn.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.nameKo.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      const aValue = a[sortField];
      const bValue = b[sortField];
      if (sortDirection === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

  const totalPages = Math.ceil(filteredAndSortedData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = filteredAndSortedData.slice(startIndex, startIndex + itemsPerPage);

  const handleAdd = () => {
    setEditingItem(null);
    setFormData({
      code: '',
      nameVi: '',
      nameEn: '',
      nameKo: '',
      parentObject: '',
      notes: ''
    });
    setIsModalOpen(true);
  };

  const handleEdit = (item: CostCenter) => {
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
    if (window.confirm('Bạn có chắc chắn muốn xóa đối tượng tập hợp chi phí này?')) {
      setCostCenters(prev => prev.filter(item => item.id !== id));
    }
    setShowActionMenu(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingItem) {
      setCostCenters(prev => prev.map(item => 
        item.id === editingItem.id 
          ? { ...item, ...formData }
          : item
      ));
    } else {
      const newItem: CostCenter = {
        id: Date.now().toString(),
        ...formData,
        createdDate: new Date().toISOString().split('T')[0],
        status: 'active'
      };
      setCostCenters(prev => [...prev, newItem]);
    }
    
    setIsModalOpen(false);
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedItems(paginatedData.map(item => item.id));
    } else {
      setSelectedItems([]);
    }
  };

  const handleSelectItem = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedItems(prev => [...prev, id]);
    } else {
      setSelectedItems(prev => prev.filter(itemId => itemId !== id));
    }
  };

  const handleBulkDelete = () => {
    if (selectedItems.length > 0 && window.confirm(`Bạn có chắc chắn muốn xóa ${selectedItems.length} mục đã chọn?`)) {
      setCostCenters(prev => prev.filter(item => !selectedItems.includes(item.id)));
      setSelectedItems([]);
    }
  };

  const handlePrint = (language: 'vi' | 'en' | 'ko') => {
    const languageNames = {
      vi: 'Tiếng Việt',
      en: 'English',
      ko: '한국어'
    };
    alert(`Đang xuất báo cáo bằng ${languageNames[language]}...`);
    setShowPrintMenu(false);
  };

  const handleExport = () => {
    alert('Đang xuất dữ liệu ra Excel...');
  };

  // Close dropdown when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showPrintMenu) {
        const target = event.target as Element;
        if (!target.closest('.print-dropdown')) {
          setShowPrintMenu(false);
        }
      }
      if (showActionMenu) {
        const target = event.target as Element;
        if (!target.closest('.action-dropdown')) {
          setShowActionMenu(null);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showPrintMenu, showActionMenu]);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className=" block sm:flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Đối tượng tập hợp chi phí</h1>
          <p className="text-gray-600 mt-1">Quản lý các đối tượng tập hợp chi phí trong doanh nghiệp</p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="relative print-dropdown">
            <button 
              onClick={() => setShowPrintMenu(!showPrintMenu)}
              className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-700 transition-colors flex items-center space-x-2"
            >
              <Icons.Printer size={16} />
              <span>In ấn</span>
              <Icons.ChevronDown size={16} />
            </button>
            {showPrintMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-20">
                <button 
                  onClick={() => handlePrint('vi')}
                  className="w-full text-left px-4 py-3 hover:bg-gray-50 flex items-center space-x-3 text-sm border-b border-gray-100 first:rounded-t-lg"
                >
                  <Icons.FileText size={16} className="text-blue-500" />
                  <span>In bằng Tiếng Việt</span>
                </button>
                <button 
                  onClick={() => handlePrint('en')}
                  className="w-full text-left px-4 py-3 hover:bg-gray-50 flex items-center space-x-3 text-sm border-b border-gray-100"
                >
                  <Icons.FileText size={16} className="text-green-500" />
                  <span>In bằng English</span>
                </button>
                <button 
                  onClick={() => handlePrint('ko')}
                  className="w-full text-left px-4 py-3 hover:bg-gray-50 flex items-center space-x-3 text-sm last:rounded-b-lg"
                >
                  <Icons.FileText size={16} className="text-purple-500" />
                  <span>In bằng 한국어</span>
                </button>
              </div>
            )}
          </div>
          <button 
            onClick={handleExport}
            className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors flex items-center space-x-2"
          >
            <Icons.Download size={16} />
            <span>Xuất Excel</span>
          </button>
          <button 
            onClick={handleAdd}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors flex items-center space-x-2"
          >
            <Icons.Plus size={16} />
            <span>Thêm mới</span>
          </button>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="block sm:flex items-center space-x-0 sm:space-x-4">
            <div className="relative">
              <Icons.Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Tìm kiếm theo mã, tên..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
              />
            </div>
            <select className=" border border-gray-300 rounded-lg px-4 py-2  focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none">
              <option value="">Tất cả trạng thái</option>
              <option value="active">Đang hoạt động</option>
              <option value="inactive">Ngừng hoạt động</option>
            </select>
          </div>
          
          {selectedItems.length > 0 && (
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">Đã chọn {selectedItems.length} mục</span>
              <button 
                onClick={handleBulkDelete}
                className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700 transition-colors"
              >
                Xóa đã chọn
              </button>
            </div>
          )}
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-red-600 text-sm font-medium">Tổng số</p>
                <p className="text-2xl font-bold text-red-700">{costCenters.length}</p>
              </div>
              <Icons.Target className="text-red-500" size={24} />
            </div>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-600 text-sm font-medium">Đang hoạt động</p>
                <p className="text-2xl font-bold text-green-700">{costCenters.filter(c => c.status === 'active').length}</p>
              </div>
              <Icons.CheckCircle className="text-green-500" size={24} />
            </div>
          </div>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-yellow-600 text-sm font-medium">Bộ phận chính</p>
                <p className="text-2xl font-bold text-yellow-700">{costCenters.filter(c => c.parentObject === 'Bộ phận chính').length}</p>
              </div>
              <Icons.Building className="text-yellow-500" size={24} />
            </div>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-600 text-sm font-medium">Mới tạo tháng này</p>
                <p className="text-2xl font-bold text-blue-700">3</p>
              </div>
              <Icons.Calendar className="text-blue-500" size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-red-50 border-b border-red-200">
              <tr>
                <th className="px-4 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedItems.length === paginatedData.length && paginatedData.length > 0}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                  />
                </th>
                <th 
                  className="px-4 py-3 text-left text-sm font-semibold text-red-700 cursor-pointer hover:bg-red-100"
                  onClick={() => handleSort('code')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Mã đối tượng</span>
                    {sortField === 'code' && (
                      sortDirection === 'asc' ? <Icons.ChevronUp size={16} /> : <Icons.ChevronDown size={16} />
                    )}
                  </div>
                </th>
                <th 
                  className="px-4 py-3 text-left text-sm font-semibold text-red-700 cursor-pointer hover:bg-red-100"
                  onClick={() => handleSort('nameVi')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Tiếng Việt</span>
                    {sortField === 'nameVi' && (
                      sortDirection === 'asc' ? <Icons.ChevronUp size={16} /> : <Icons.ChevronDown size={16} />
                    )}
                  </div>
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-red-700">Tiếng Anh</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-red-700">Tiếng Hàn</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-red-700">Đối tượng gốc</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-red-700">Ghi chú</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-red-700">Trạng thái</th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-red-700">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {paginatedData.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selectedItems.includes(item.id)}
                      onChange={(e) => handleSelectItem(item.id, e.target.checked)}
                      className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <span className="font-medium text-gray-900">{item.code}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-gray-900">{item.nameVi}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-gray-700">{item.nameEn}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-gray-700">{item.nameKo}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {item.parentObject}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-gray-600 text-sm truncate max-w-xs block" title={item.notes}>
                      {item.notes}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      item.status === 'active' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {item.status === 'active' ? 'Hoạt động' : 'Ngừng hoạt động'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="relative action-dropdown">
                      <button
                        onClick={() => setShowActionMenu(showActionMenu === item.id ? null : item.id)}
                        className="inline-flex items-center px-3 py-1 rounded-lg text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
                      >
                        <Icons.MoreHorizontal size={16} />
                      </button>
                      
                      {showActionMenu === item.id && (
                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                          <button
                            onClick={() => handleEdit(item)}
                            className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center space-x-2 text-sm"
                          >
                            <Icons.Eye size={16} className="text-blue-500" />
                            <span>Xem chi tiết</span>
                          </button>
                          <button
                            onClick={() => handleEdit(item)}
                            className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center space-x-2 text-sm"
                          >
                            <Icons.Edit size={16} className="text-green-500" />
                            <span>Chỉnh sửa</span>
                          </button>
                          <button
                            onClick={() => handleDelete(item.id)}
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
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="bg-gray-50 px-6 py-3 flex items-center justify-between border-t border-gray-200">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-700">
              Hiển thị {startIndex + 1} - {Math.min(startIndex + itemsPerPage, filteredAndSortedData.length)} của {filteredAndSortedData.length} kết quả
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 rounded border border-gray-300 text-sm hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Trước
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`px-3 py-1 rounded text-sm ${
                  currentPage === page
                    ? 'bg-red-600 text-white'
                    : 'border border-gray-300 hover:bg-gray-100'
                }`}
              >
                {page}
              </button>
            ))}
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 rounded border border-gray-300 text-sm hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Sau
            </button>
          </div>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">
                {editingItem ? 'Chỉnh sửa đối tượng tập hợp chi phí' : 'Thêm đối tượng tập hợp chi phí mới'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Icons.X size={20} className="text-gray-500" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mã đối tượng tập hợp chi phí <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.code}
                    onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
                    placeholder="Nhập mã đối tượng"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Đối tượng gốc <span className="text-red-500">*</span>
                  </label>
                  <select
                    required
                    value={formData.parentObject}
                    onChange={(e) => setFormData(prev => ({ ...prev, parentObject: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
                  >
                    <option value="">Chọn đối tượng gốc</option>
                    {parentObjects.map(obj => (
                      <option key={obj} value={obj}>{obj}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tên tiếng Việt <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.nameVi}
                  onChange={(e) => setFormData(prev => ({ ...prev, nameVi: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
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
                  onChange={(e) => setFormData(prev => ({ ...prev, nameEn: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
                  placeholder="Enter English name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tên tiếng Hàn
                </label>
                <input
                  type="text"
                  value={formData.nameKo}
                  onChange={(e) => setFormData(prev => ({ ...prev, nameKo: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
                  placeholder="한국어 이름을 입력하세요"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ghi chú
                </label>
                <textarea
                  rows={4}
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none resize-none"
                  placeholder="Nhập ghi chú (tùy chọn)"
                />
              </div>

              <div className="flex items-center justify-end space-x-4 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-2"
                >
                  <Icons.Save size={16} />
                  <span>{editingItem ? 'Cập nhật' : 'Thêm mới'}</span>
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