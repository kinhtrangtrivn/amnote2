import React, { useState, useMemo, useCallback } from 'react';
import { Plus, Eye, Edit, Trash2, Search, Filter, Target, X, Save, Printer, Upload, Download, AlertCircle } from 'lucide-react';
import Pagination from './Pagination';
import PrintModal from './PrintModal';
import ExcelImportModal from './ExcelImportModal';

interface CostObject {
  id: string;
  code: string;
  nameVi: string;
  nameEn: string;
  nameKo: string;
  objectType: string;
  notes: string;
}

const objectTypes = [
  'Không có cha',
  'Phòng ban',
  'Dự án',
  'Sản phẩm',
  'Dịch vụ',
  'Khách hàng',
  'Khu vực'
];

const mockCostObjects: CostObject[] = [
  {
    id: '1',
    code: 'DTCP001',
    nameVi: 'Phòng Kế toán',
    nameEn: 'Accounting Department',
    nameKo: '회계부',
    objectType: 'Phòng ban',
    notes: 'Phòng ban chính phụ trách kế toán tổng hợp'
  },
  {
    id: '2',
    code: 'DTCP002',
    nameVi: 'Dự án ABC',
    nameEn: 'Project ABC',
    nameKo: 'ABC 프로젝트',
    objectType: 'Dự án',
    notes: 'Dự án phát triển sản phẩm mới'
  },
  {
    id: '3',
    code: 'DTCP003',
    nameVi: 'Sản phẩm X1',
    nameEn: 'Product X1',
    nameKo: '제품 X1',
    objectType: 'Sản phẩm',
    notes: 'Sản phẩm chủ lực của công ty'
  },
  {
    id: '4',
    code: 'DTCP004',
    nameVi: 'Phòng Nhân sự',
    nameEn: 'Human Resources Department',
    nameKo: '인사부',
    objectType: 'Phòng ban',
    notes: 'Phòng ban quản lý nhân sự'
  },
  {
    id: '5',
    code: 'DTCP005',
    nameVi: 'Dự án XYZ',
    nameEn: 'Project XYZ',
    nameKo: 'XYZ 프로젝트',
    objectType: 'Dự án',
    notes: 'Dự án mở rộng thị trường'
  }
];

export default function CostObjectPage() {
  const [costObjects, setCostObjects] = useState<CostObject[]>(mockCostObjects);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'view' | 'edit'>('add');
  const [selectedObject, setSelectedObject] = useState<CostObject | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [formData, setFormData] = useState<Partial<CostObject>>({});
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Filter and search logic
  const filteredObjects = useMemo(() => {
    return costObjects.filter(obj => {
      const matchesSearch = 
        obj.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        obj.nameVi.toLowerCase().includes(searchTerm.toLowerCase()) ||
        obj.nameEn.toLowerCase().includes(searchTerm.toLowerCase()) ||
        obj.nameKo.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesFilter = filterType === 'all' || obj.objectType === filterType;
      
      return matchesSearch && matchesFilter;
    });
  }, [costObjects, searchTerm, filterType]);

  // Pagination calculations
  const totalItems = filteredObjects.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = filteredObjects.slice(startIndex, endIndex);

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  const handleItemsPerPageChange = useCallback((newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1);
  }, []);

  const openModal = (mode: 'add' | 'view' | 'edit', object?: CostObject) => {
    setModalMode(mode);
    setSelectedObject(object || null);
    setFormData(object || { objectType: 'Không có cha' });
    setErrors({});
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedObject(null);
    setFormData({});
    setErrors({});
  };

  const handleInputChange = (field: keyof CostObject, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    // Required fields validation
    if (!formData.code?.trim()) {
      newErrors.code = 'Mã đối tượng là bắt buộc';
    } else {
      // Check for duplicate code
      const isDuplicate = costObjects.some(obj => 
        obj.code.toLowerCase() === formData.code!.toLowerCase() && 
        obj.id !== selectedObject?.id
      );
      if (isDuplicate) {
        newErrors.code = 'Mã đối tượng đã tồn tại';
      }
    }

    if (!formData.nameVi?.trim()) {
      newErrors.nameVi = 'Tên tiếng Việt là bắt buộc';
    }

    if (!formData.objectType?.trim()) {
      newErrors.objectType = 'Đối tượng gốc là bắt buộc';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (!validateForm()) {
      return;
    }

    if (modalMode === 'add') {
      const newObject: CostObject = {
        id: Date.now().toString(),
        code: formData.code || '',
        nameVi: formData.nameVi || '',
        nameEn: formData.nameEn || '',
        nameKo: formData.nameKo || '',
        objectType: formData.objectType || '',
        notes: formData.notes || ''
      };
      setCostObjects(prev => [...prev, newObject]);
    } else if (modalMode === 'edit' && selectedObject) {
      setCostObjects(prev => prev.map(obj => 
        obj.id === selectedObject.id 
          ? { ...obj, ...formData }
          : obj
      ));
    }
    closeModal();
  };

  const handleDelete = (objectId: string) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa đối tượng này?')) {
      setCostObjects(prev => prev.filter(obj => obj.id !== objectId));
    }
  };

  const handleImportSuccess = (importedData: CostObject[]) => {
    setCostObjects(prev => [...prev, ...importedData]);
    setIsImportModalOpen(false);
  };

  const isViewMode = modalMode === 'view';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="sm:flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4 pb-3 md:pb-0">
            <div className="p-3 bg-blue-50 rounded-lg">
              <Target className="text-blue-600" size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Đối tượng Tập hợp Chi phí</h2>
              <p className="text-gray-600 mt-1">Quản lý các đối tượng tập hợp chi phí trong hệ thống</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setIsImportModalOpen(true)}
              className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
            >
              <Upload size={20} />
              <span className="hidden sm:block">Import Excel</span>
            </button>
            <button
              onClick={() => setIsPrintModalOpen(true)}
              className="flex items-center space-x-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
            >
              <Printer size={20} />
              <span className="hidden sm:block">In báo cáo</span>
            </button>
            <button
              onClick={() => openModal('add')}
              className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus size={20} />
              <span>Thêm mới</span>
            </button>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-4 mb-6">
          <div className="flex-1 relative w-full">
            <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm kiếm theo mã, tên tiếng Việt, tiếng Anh, tiếng Hàn..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="flex items-center space-x-2 w-full sm:w-auto">
            <Filter size={20} className="text-gray-400" />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Tất cả loại</option>
              {objectTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-medium text-gray-700">Mã đối tượng</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Tên tiếng Việt</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Tên tiếng Anh</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Tên tiếng Hàn</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Đối tượng gốc</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Ghi chú</th>
                <th className="text-center py-3 px-4 font-medium text-gray-700">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {currentItems.map((object) => (
                <tr key={object.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <div className="font-medium text-gray-900">{object.code}</div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="font-medium text-gray-900">{object.nameVi}</div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="text-gray-900">{object.nameEn || '-'}</div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="text-gray-900">{object.nameKo || '-'}</div>
                  </td>
                  <td className="py-3 px-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {object.objectType}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="text-gray-900 truncate max-w-xs" title={object.notes}>
                      {object.notes || '-'}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center justify-center space-x-2">
                      <button
                        onClick={() => openModal('view', object)}
                        className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Xem"
                      >
                        <Eye size={16} />
                      </button>
                      <button
                        onClick={() => openModal('edit', object)}
                        className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                        title="Sửa"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(object.id)}
                        className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Xóa"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {currentItems.length === 0 && (
            <div className="text-center py-8">
              <Target size={48} className="mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500">Không tìm thấy đối tượng nào</p>
            </div>
          )}
        </div>
      </div>

      {/* Pagination */}
      {totalItems > 0 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={totalItems}
          itemsPerPage={itemsPerPage}
          onPageChange={handlePageChange}
          onItemsPerPageChange={handleItemsPerPageChange}
          startIndex={startIndex}
          endIndex={endIndex}
        />
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            {/* Modal Header - Fixed */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-xl z-10">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-gray-900">
                  {modalMode === 'add' && 'Thêm đối tượng mới'}
                  {modalMode === 'view' && 'Thông tin đối tượng'}
                  {modalMode === 'edit' && 'Chỉnh sửa đối tượng'}
                </h3>
                <button
                  onClick={closeModal}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X size={20} className="text-gray-500" />
                </button>
              </div>
            </div>

            {/* Modal Content - Scrollable */}
            <form className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Mã đối tượng */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Mã đối tượng <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.code || ''}
                    onChange={(e) => handleInputChange('code', e.target.value)}
                    disabled={isViewMode}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500 ${
                      errors.code ? 'border-red-300 bg-red-50' : 'border-gray-300'
                    }`}
                    placeholder="Nhập mã đối tượng"
                  />
                  {errors.code && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <AlertCircle size={14} className="mr-1" />
                      {errors.code}
                    </p>
                  )}
                </div>

                {/* Đối tượng gốc */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Đối tượng gốc <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.objectType || ''}
                    onChange={(e) => handleInputChange('objectType', e.target.value)}
                    disabled={isViewMode}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500 ${
                      errors.objectType ? 'border-red-300 bg-red-50' : 'border-gray-300'
                    }`}
                  >
                    <option value="">Chọn đối tượng gốc</option>
                    {objectTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                  {errors.objectType && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <AlertCircle size={14} className="mr-1" />
                      {errors.objectType}
                    </p>
                  )}
                </div>
              </div>

              {/* Tên tiếng Việt */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tên tiếng Việt <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.nameVi || ''}
                  onChange={(e) => handleInputChange('nameVi', e.target.value)}
                  disabled={isViewMode}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500 ${
                    errors.nameVi ? 'border-red-300 bg-red-50' : 'border-gray-300'
                  }`}
                  placeholder="Nhập tên tiếng Việt"
                />
                {errors.nameVi && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <AlertCircle size={14} className="mr-1" />
                    {errors.nameVi}
                  </p>
                )}
              </div>

              {/* Tên tiếng Anh */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tên tiếng Anh
                </label>
                <input
                  type="text"
                  value={formData.nameEn || ''}
                  onChange={(e) => handleInputChange('nameEn', e.target.value)}
                  disabled={isViewMode}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
                  placeholder="Nhập tên tiếng Anh"
                />
              </div>

              {/* Tên tiếng Hàn */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tên tiếng Hàn
                </label>
                <input
                  type="text"
                  value={formData.nameKo || ''}
                  onChange={(e) => handleInputChange('nameKo', e.target.value)}
                  disabled={isViewMode}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
                  placeholder="Nhập tên tiếng Hàn"
                />
              </div>

              {/* Ghi chú */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ghi chú
                </label>
                <textarea
                  value={formData.notes || ''}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  disabled={isViewMode}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
                  placeholder="Nhập ghi chú"
                />
              </div>
            </form>

            {/* Modal Footer - Fixed */}
            <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 rounded-b-xl">
              <div className="flex items-center justify-end space-x-3">
                <button
                  onClick={closeModal}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  {isViewMode ? 'Đóng' : 'Hủy'}
                </button>
                {!isViewMode && (
                  <button
                    onClick={handleSave}
                    className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Save size={16} />
                    <span>{modalMode === 'add' ? 'Thêm mới' : 'Lưu thay đổi'}</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Print Modal */}
      {isPrintModalOpen && (
        <PrintModal
          isOpen={isPrintModalOpen}
          onClose={() => setIsPrintModalOpen(false)}
          data={filteredObjects}
        />
      )}

      {/* Import Modal */}
      {isImportModalOpen && (
        <ExcelImportModal
          isOpen={isImportModalOpen}
          onClose={() => setIsImportModalOpen(false)}
          onImportSuccess={handleImportSuccess}
          existingCodes={costObjects.map(obj => obj.code)}
        />
      )}
    </div>
  );
}