import React, { useState } from 'react';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Download, 
  Upload, 
  Search, 
  Filter,
  ChevronDown,
  ChevronUp,
  Save,
  X,
  AlertCircle,
  CheckCircle,
  Factory,
  Package,
  Settings,
  Workflow
} from 'lucide-react';

interface CostObject {
  id: string;
  type: 'workshop' | 'product' | 'process' | 'operation';
  name: string;
  description: string;
  costAccount: string;
  wipAccount?: string;
  status: 'active' | 'inactive';
  createdDate: string;
  lastModified: string;
}

const costObjectTypes = [
  { value: 'workshop', label: 'Phân xưởng', icon: Factory },
  { value: 'product', label: 'Sản phẩm', icon: Package },
  { value: 'process', label: 'Quy trình sản xuất', icon: Workflow },
  { value: 'operation', label: 'Công đoạn sản xuất', icon: Settings }
];

const mockData: CostObject[] = [
  {
    id: '1',
    type: 'workshop',
    name: 'Phân xưởng A',
    description: 'Sản xuất linh kiện điện tử',
    costAccount: '621',
    wipAccount: '154',
    status: 'active',
    createdDate: '2024-01-15',
    lastModified: '2024-01-20'
  },
  {
    id: '2',
    type: 'product',
    name: 'Sản phẩm B',
    description: 'Thành phẩm chính - Máy tính bảng',
    costAccount: '622',
    status: 'active',
    createdDate: '2024-01-10',
    lastModified: '2024-01-18'
  },
  {
    id: '3',
    type: 'process',
    name: 'Quy trình lắp ráp',
    description: 'Quy trình lắp ráp sản phẩm hoàn chỉnh',
    costAccount: '627',
    wipAccount: '154',
    status: 'active',
    createdDate: '2024-01-12',
    lastModified: '2024-01-19'
  },
  {
    id: '4',
    type: 'operation',
    name: 'Công đoạn hàn',
    description: 'Hàn linh kiện và mạch điện',
    costAccount: '621',
    status: 'active',
    createdDate: '2024-01-08',
    lastModified: '2024-01-16'
  }
];

export default function CostObjectContent() {
  const [costObjects, setCostObjects] = useState<CostObject[]>(mockData);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<CostObject | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [sortField, setSortField] = useState<keyof CostObject>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const [formData, setFormData] = useState({
    type: 'workshop' as CostObject['type'],
    name: '',
    description: '',
    costAccount: '',
    wipAccount: '',
    status: 'active' as CostObject['status']
  });

  const getTypeIcon = (type: CostObject['type']) => {
    const typeConfig = costObjectTypes.find(t => t.value === type);
    return typeConfig?.icon || Factory;
  };

  const getTypeLabel = (type: CostObject['type']) => {
    const typeConfig = costObjectTypes.find(t => t.value === type);
    return typeConfig?.label || type;
  };

  const filteredAndSortedData = costObjects
    .filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           item.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFilter = filterType === 'all' || item.type === filterType;
      return matchesSearch && matchesFilter;
    })
    .sort((a, b) => {
      const aValue = a[sortField];
      const bValue = b[sortField];
      const direction = sortDirection === 'asc' ? 1 : -1;
      return aValue < bValue ? -direction : aValue > bValue ? direction : 0;
    });

  const paginatedData = filteredAndSortedData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(filteredAndSortedData.length / itemsPerPage);

  const handleSort = (field: keyof CostObject) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingItem) {
      setCostObjects(prev => prev.map(item => 
        item.id === editingItem.id 
          ? { ...item, ...formData, lastModified: new Date().toISOString().split('T')[0] }
          : item
      ));
    } else {
      const newItem: CostObject = {
        id: Date.now().toString(),
        ...formData,
        createdDate: new Date().toISOString().split('T')[0],
        lastModified: new Date().toISOString().split('T')[0]
      };
      setCostObjects(prev => [...prev, newItem]);
    }
    
    resetForm();
  };

  const handleEdit = (item: CostObject) => {
    setEditingItem(item);
    setFormData({
      type: item.type,
      name: item.name,
      description: item.description,
      costAccount: item.costAccount,
      wipAccount: item.wipAccount || '',
      status: item.status
    });
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa đối tượng tập hợp chi phí này?')) {
      setCostObjects(prev => prev.filter(item => item.id !== id));
    }
  };

  const resetForm = () => {
    setFormData({
      type: 'workshop',
      name: '',
      description: '',
      costAccount: '',
      wipAccount: '',
      status: 'active'
    });
    setEditingItem(null);
    setShowForm(false);
  };

  const exportToExcel = () => {
    // Simulate Excel export
    alert('Đang xuất dữ liệu ra Excel...');
  };

  const importFromExcel = () => {
    // Simulate Excel import
    alert('Chức năng nhập từ Excel đang được phát triển...');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-600 to-red-700 rounded-xl p-6 text-white shadow-lg">
        <div className="flex items-center space-x-3 mb-2">
          <div className="p-2 bg-white/20 rounded-lg">
            <Factory size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Đối tượng tập hợp chi phí</h1>
            <p className="text-red-100">Quản lý phân xưởng, sản phẩm, quy trình và công đoạn sản xuất</p>
          </div>
        </div>
        
        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          {costObjectTypes.map((type) => {
            const count = costObjects.filter(item => item.type === type.value).length;
            const Icon = type.icon;
            return (
              <div key={type.value} className="bg-white/10 rounded-lg p-3 backdrop-blur-sm">
                <div className="flex items-center space-x-2">
                  <Icon size={16} />
                  <span className="text-sm font-medium">{type.label}</span>
                </div>
                <p className="text-2xl font-bold mt-1">{count}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
            <button
              onClick={() => setShowForm(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
            >
              <Plus size={16} />
              <span>Thêm mới</span>
            </button>
            
            <button
              onClick={exportToExcel}
              className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Download size={16} />
              <span>Xuất Excel</span>
            </button>
            
            <button
              onClick={importFromExcel}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Upload size={16} />
              <span>Nhập Excel</span>
            </button>
          </div>

          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                placeholder="Tìm kiếm theo tên hoặc mô tả..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent w-full sm:w-64"
              />
            </div>
            
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            >
              <option value="all">Tất cả loại</option>
              {costObjectTypes.map(type => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-red-50 border-b border-red-100">
              <tr>
                <th className="px-6 py-4 text-left">
                  <button
                    onClick={() => handleSort('type')}
                    className="flex items-center space-x-1 text-sm font-semibold text-red-700 hover:text-red-800"
                  >
                    <span>Loại đối tượng</span>
                    {sortField === 'type' && (
                      sortDirection === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />
                    )}
                  </button>
                </th>
                <th className="px-6 py-4 text-left">
                  <button
                    onClick={() => handleSort('name')}
                    className="flex items-center space-x-1 text-sm font-semibold text-red-700 hover:text-red-800"
                  >
                    <span>Tên đối tượng</span>
                    {sortField === 'name' && (
                      sortDirection === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />
                    )}
                  </button>
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-red-700">Mô tả</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-red-700">TK Chi phí</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-red-700">TK Dở dang</th>
                <th className="px-6 py-4 text-left">
                  <button
                    onClick={() => handleSort('status')}
                    className="flex items-center space-x-1 text-sm font-semibold text-red-700 hover:text-red-800"
                  >
                    <span>Trạng thái</span>
                    {sortField === 'status' && (
                      sortDirection === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />
                    )}
                  </button>
                </th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-red-700">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {paginatedData.map((item) => {
                const Icon = getTypeIcon(item.type);
                return (
                  <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-red-100 rounded-lg">
                          <Icon size={16} className="text-red-600" />
                        </div>
                        <span className="text-sm font-medium text-gray-900">
                          {getTypeLabel(item.type)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{item.name}</div>
                      <div className="text-xs text-gray-500">Cập nhật: {item.lastModified}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-600 max-w-xs truncate" title={item.description}>
                        {item.description}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {item.costAccount}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {item.wipAccount ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                          {item.wipAccount}
                        </span>
                      ) : (
                        <span className="text-gray-400 text-sm">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        item.status === 'active' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {item.status === 'active' ? (
                          <>
                            <CheckCircle size={12} className="mr-1" />
                            Hoạt động
                          </>
                        ) : (
                          <>
                            <AlertCircle size={12} className="mr-1" />
                            Không hoạt động
                          </>
                        )}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center space-x-2">
                        <button
                          onClick={() => handleEdit(item)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Chỉnh sửa"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Xóa"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Hiển thị {((currentPage - 1) * itemsPerPage) + 1} - {Math.min(currentPage * itemsPerPage, filteredAndSortedData.length)} 
              trong tổng số {filteredAndSortedData.length} bản ghi
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Trước
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`px-3 py-1 border rounded-md text-sm ${
                    currentPage === page
                      ? 'bg-red-600 text-white border-red-600'
                      : 'border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {page}
                </button>
              ))}
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Sau
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">
                  {editingItem ? 'Chỉnh sửa đối tượng tập hợp chi phí' : 'Thêm mới đối tượng tập hợp chi phí'}
                </h3>
                <button
                  onClick={resetForm}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Loại đối tượng <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as CostObject['type'] }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    required
                  >
                    {costObjectTypes.map(type => (
                      <option key={type.value} value={type.value}>{type.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Trạng thái
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as CostObject['status'] }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  >
                    <option value="active">Hoạt động</option>
                    <option value="inactive">Không hoạt động</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tên đối tượng <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="Nhập tên đối tượng tập hợp chi phí"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mô tả chi tiết
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="Nhập mô tả chi tiết về đối tượng"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tài khoản chi phí <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.costAccount}
                    onChange={(e) => setFormData(prev => ({ ...prev, costAccount: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    placeholder="VD: 621, 622, 627"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tài khoản chi phí dở dang
                  </label>
                  <input
                    type="text"
                    value={formData.wipAccount}
                    onChange={(e) => setFormData(prev => ({ ...prev, wipAccount: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    placeholder="VD: 154"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  <Save size={16} />
                  <span>{editingItem ? 'Cập nhật' : 'Lưu'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}