import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { 
  Plus, 
  Eye, 
  Edit, 
  Trash2, 
  Search, 
  Filter, 
  RefreshCw, 
  Download, 
  Upload, 
  Printer, 
  X, 
  Save, 
  ChevronLeft, 
  ChevronRight,
  Target,
  FileSpreadsheet,
  AlertCircle
} from 'lucide-react';
import Pagination from './Pagination';
import PrintModal from './PrintModal';
import ExcelImportModal from './ExcelImportModal';

interface CostObject {
  id: string;
  code: string;
  nameVi: string;
  nameEn: string;
  nameKo: string;
  notes: string;
}

const mockCostObjects: CostObject[] = [
  {
    id: '1',
    code: 'CC001',
    nameVi: 'Phòng Marketing',
    nameEn: 'Marketing Department',
    nameKo: 'Marketing부',
    notes: 'Ghi chú cho đối tượng 1'
  },
  {
    id: '2',
    code: 'CC002',
    nameVi: 'Phòng Kế Toán',
    nameEn: 'Kế Toán Department',
    nameKo: 'Kế Toán부',
    notes: 'Ghi chú cho đối tượng 2'
  },
  {
    id: '3',
    code: 'CC003',
    nameVi: 'Phòng IT',
    nameEn: 'IT Department',
    nameKo: 'IT부',
    notes: 'Ghi chú cho đối tượng 3'
  },
  {
    id: '4',
    code: 'CC004',
    nameVi: 'Phòng Nhân Sự',
    nameEn: 'Nhân Sự Department',
    nameKo: 'Nhân Sự부',
    notes: 'Ghi chú cho đối tượng 4'
  },
  {
    id: '5',
    code: 'CC005',
    nameVi: 'Phòng Kinh Doanh',
    nameEn: 'Kinh Doanh Department',
    nameKo: 'Kinh Doanh부',
    notes: 'Ghi chú cho đối tượng 5'
  },
  {
    id: '6',
    code: 'CC006',
    nameVi: 'Phòng Vận Hành',
    nameEn: 'Vận Hành Department',
    nameKo: 'Vận Hành부',
    notes: 'Ghi chú cho đối tượng 6'
  },
  {
    id: '7',
    code: 'CC007',
    nameVi: 'Phòng Chất Lượng',
    nameEn: 'Chất Lượng Department',
    nameKo: 'Chất Lượng부',
    notes: 'Ghi chú cho đối tượng 7'
  },
  {
    id: '8',
    code: 'CC008',
    nameVi: 'Phòng Sản Xuất',
    nameEn: 'Sản Xuất Department',
    nameKo: 'Sản Xuất부',
    notes: 'Ghi chú cho đối tượng 8'
  }
];

// Generate more mock data for pagination
const generateMockData = (count: number): CostObject[] => {
  const departments = [
    'Marketing', 'Kế Toán', 'IT', 'Nhân Sự', 'Kinh Doanh', 'Vận Hành', 
    'Chất Lượng', 'Sản Xuất', 'Tài Chính', 'Pháp Chế', 'Hành Chính',
    'Nghiên Cứu', 'Phát Triển', 'Bán Hàng', 'Dịch Vụ', 'Kỹ Thuật'
  ];
  
  const data: CostObject[] = [];
  for (let i = 1; i <= count; i++) {
    const dept = departments[i % departments.length];
    data.push({
      id: i.toString(),
      code: `CC${i.toString().padStart(3, '0')}`,
      nameVi: `Phòng ${dept}`,
      nameEn: `${dept} Department`,
      nameKo: `${dept}부`,
      notes: `Ghi chú cho đối tượng ${i}`
    });
  }
  return data;
};

const allMockData = generateMockData(1000);

// Skeleton Loading Component
const SkeletonRow = () => (
  <tr className="border-b border-gray-100">
    <td className="py-3 px-4">
      <div className="flex items-center">
        <div className="w-4 h-4 bg-gray-200 rounded animate-pulse mr-3"></div>
        <div className="w-16 h-4 bg-gray-200 rounded animate-pulse"></div>
      </div>
    </td>
    <td className="py-3 px-4">
      <div className="w-24 h-4 bg-gray-200 rounded animate-pulse"></div>
    </td>
    <td className="py-3 px-4">
      <div className="w-32 h-4 bg-gray-200 rounded animate-pulse"></div>
    </td>
    <td className="py-3 px-4">
      <div className="w-28 h-4 bg-gray-200 rounded animate-pulse"></div>
    </td>
    <td className="py-3 px-4">
      <div className="w-24 h-4 bg-gray-200 rounded animate-pulse"></div>
    </td>
    <td className="py-3 px-4">
      <div className="w-20 h-4 bg-gray-200 rounded animate-pulse"></div>
    </td>
    <td className="py-3 px-4">
      <div className="flex items-center justify-center space-x-2">
        <div className="w-6 h-6 bg-gray-200 rounded animate-pulse"></div>
        <div className="w-6 h-6 bg-gray-200 rounded animate-pulse"></div>
        <div className="w-6 h-6 bg-gray-200 rounded animate-pulse"></div>
      </div>
    </td>
  </tr>
);

const SkeletonTable = ({ rows = 10 }: { rows?: number }) => (
  <div className="overflow-x-auto">
    <table className="w-full">
      <thead>
        <tr className="border-b border-gray-200">
          <th className="text-left py-3 px-4 font-medium text-gray-700">
            <div className="flex items-center">
              <div className="w-4 h-4 bg-gray-200 rounded animate-pulse mr-2"></div>
              <div className="w-12 h-4 bg-gray-200 rounded animate-pulse"></div>
            </div>
          </th>
          <th className="text-left py-3 px-4 font-medium text-gray-700">
            <div className="w-20 h-4 bg-gray-200 rounded animate-pulse"></div>
          </th>
          <th className="text-left py-3 px-4 font-medium text-gray-700">
            <div className="w-16 h-4 bg-gray-200 rounded animate-pulse"></div>
          </th>
          <th className="text-left py-3 px-4 font-medium text-gray-700">
            <div className="w-20 h-4 bg-gray-200 rounded animate-pulse"></div>
          </th>
          <th className="text-left py-3 px-4 font-medium text-gray-700">
            <div className="w-16 h-4 bg-gray-200 rounded animate-pulse"></div>
          </th>
          <th className="text-left py-3 px-4 font-medium text-gray-700">
            <div className="w-12 h-4 bg-gray-200 rounded animate-pulse"></div>
          </th>
          <th className="text-center py-3 px-4 font-medium text-gray-700">
            <div className="w-16 h-4 bg-gray-200 rounded animate-pulse mx-auto"></div>
          </th>
        </tr>
      </thead>
      <tbody>
        {Array.from({ length: rows }, (_, index) => (
          <SkeletonRow key={index} />
        ))}
      </tbody>
    </table>
  </div>
);

export default function CostObjectPage() {
  const [costObjects, setCostObjects] = useState<CostObject[]>(allMockData);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'view' | 'edit'>('add');
  const [selectedCostObject, setSelectedCostObject] = useState<CostObject | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [formData, setFormData] = useState<Partial<CostObject>>({});
  const [currentStep, setCurrentStep] = useState(1);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [isExcelImportModalOpen, setIsExcelImportModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(25);

  // Filter data based on search term
  const filteredCostObjects = useMemo(() => {
    return costObjects.filter(obj =>
      obj.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      obj.nameVi.toLowerCase().includes(searchTerm.toLowerCase()) ||
      obj.nameEn.toLowerCase().includes(searchTerm.toLowerCase()) ||
      obj.nameKo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      obj.notes.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [costObjects, searchTerm]);

  // Pagination calculations
  const totalItems = filteredCostObjects.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = filteredCostObjects.slice(startIndex, endIndex);

  // Reset to first page when search term changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  // Reset to first page when items per page changes
  const handleItemsPerPageChange = useCallback((newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1);
  }, []);

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  const openModal = (mode: 'add' | 'view' | 'edit', costObject?: CostObject) => {
    setModalMode(mode);
    setSelectedCostObject(costObject || null);
    setFormData(costObject || {});
    setCurrentStep(1);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedCostObject(null);
    setFormData({});
    setCurrentStep(1);
  };

  const handleInputChange = (field: keyof CostObject, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateStep1 = () => {
    const requiredFields = ['code', 'nameVi'];
    return requiredFields.every(field => formData[field as keyof CostObject]?.toString().trim());
  };

  const handleNext = () => {
    if (currentStep === 1 && validateStep1()) {
      setCurrentStep(2);
    }
  };

  const handlePrev = () => {
    if (currentStep === 2) {
      setCurrentStep(1);
    }
  };

  const handleSave = () => {
    if (modalMode === 'add') {
      const newCostObject: CostObject = {
        id: Date.now().toString(),
        code: formData.code || '',
        nameVi: formData.nameVi || '',
        nameEn: formData.nameEn || '',
        nameKo: formData.nameKo || '',
        notes: formData.notes || ''
      };
      setCostObjects(prev => [newCostObject, ...prev]);
    } else if (modalMode === 'edit' && selectedCostObject) {
      setCostObjects(prev => prev.map(obj => 
        obj.id === selectedCostObject.id 
          ? { ...obj, ...formData }
          : obj
      ));
    }
    closeModal();
  };

  const handleDelete = (costObjectId: string) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa đối tượng này?')) {
      setCostObjects(prev => prev.filter(obj => obj.id !== costObjectId));
      setSelectedItems(prev => prev.filter(id => id !== costObjectId));
    }
  };

  const handleSelectItem = (id: string) => {
    setSelectedItems(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id)
        : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedItems.length === currentItems.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(currentItems.map(item => item.id));
    }
  };

  const handleBulkDelete = () => {
    if (selectedItems.length === 0) return;
    
    if (window.confirm(`Bạn có chắc chắn muốn xóa ${selectedItems.length} đối tượng đã chọn?`)) {
      setCostObjects(prev => prev.filter(obj => !selectedItems.includes(obj.id)));
      setSelectedItems([]);
    }
  };

  const handleRefresh = async () => {
    setIsLoading(true);
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // In a real app, you would fetch fresh data from the API
      // For demo purposes, we'll just reset the data
      setCostObjects(allMockData);
      setSelectedItems([]);
      setSearchTerm('');
      setCurrentPage(1);
    } catch (error) {
      console.error('Error refreshing data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExcelImport = (data: any[]) => {
    const newCostObjects: CostObject[] = data.map((row, index) => ({
      id: (Date.now() + index).toString(),
      code: row.code || `CC${(costObjects.length + index + 1).toString().padStart(3, '0')}`,
      nameVi: row.nameVi || '',
      nameEn: row.nameEn || '',
      nameKo: row.nameKo || '',
      notes: row.notes || ''
    }));
    
    setCostObjects(prev => [...newCostObjects, ...prev]);
    setIsExcelImportModalOpen(false);
  };

  const isViewMode = modalMode === 'view';
  const canProceedToStep2 = validateStep1();

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
              <p className="text-gray-600 mt-1">Quản lý các đối tượng tập hợp chi phí trong hệ thống ({totalItems.toLocaleString('vi-VN')} bản ghi)</p>
            </div>
          </div>
          <button
            onClick={() => openModal('add')}
            className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus size={20} />
            <span>Thêm mới</span>
          </button>
        </div>

        {/* Action Bar */}
        <div className="block sm:flex items-center justify-between space-y-4 sm:space-y-0 mb-6">
          <div className="flex items-center space-x-4">
            <div className="flex-1 sm:flex-none relative">
              <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Tìm kiếm mã, tên..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full sm:w-80 pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="flex items-center bg-gray-50 rounded-lg p-1 space-x-1">
              <div className="relative group">
                <button 
                  onClick={handleRefresh}
                  disabled={isLoading}
                  className="p-2 text-gray-600 hover:text-blue-600 hover:bg-white rounded-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Làm mới dữ liệu"
                >
                  <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
                </button>
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                  Làm mới
                </div>
              </div>
              <div className="relative group">
                <button 
                  onClick={() => setIsPrintModalOpen(true)}
                  className="p-2 text-gray-600 hover:text-blue-600 hover:bg-white rounded-md transition-all"
                  title="In ấn"
                >
                  <Printer size={16} />
                </button>
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                  In ấn
                </div>
              </div>
              <div className="relative group">
                <button 
                  onClick={() => setIsExcelImportModalOpen(true)}
                  className="p-2 text-gray-600 hover:text-green-600 hover:bg-white rounded-md transition-all"
                  title="Nhập Excel"
                >
                  <Upload size={16} />
                </button>
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                  Nhập Excel
                </div>
              </div>
            </div>
          </div>

          {selectedItems.length > 0 && (
            <div className="flex items-center space-x-3">
              <span className="text-sm text-gray-600">
                Đã chọn {selectedItems.length} mục
              </span>
              <button
                onClick={handleBulkDelete}
                className="flex items-center space-x-2 px-3 py-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
              >
                <Trash2 size={14} />
                <span>Xóa</span>
              </button>
            </div>
          )}
        </div>

        {/* Table */}
        {isLoading ? (
          <SkeletonTable rows={itemsPerPage} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-700">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={selectedItems.length === currentItems.length && currentItems.length > 0}
                        onChange={handleSelectAll}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mr-2"
                      />
                      Mã đối tượng
                    </div>
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Tiếng Việt</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Tiếng Anh</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Tiếng Hàn</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Ghi chú</th>
                  <th className="text-center py-3 px-4 font-medium text-gray-700">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {currentItems.map((costObject) => (
                  <tr key={costObject.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          checked={selectedItems.includes(costObject.id)}
                          onChange={() => handleSelectItem(costObject.id)}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mr-3"
                        />
                        <div className="font-medium text-gray-900">{costObject.code}</div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-medium text-gray-900">{costObject.nameVi}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-gray-900">{costObject.nameEn || '-'}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-gray-900">{costObject.nameKo || '-'}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-gray-900">{costObject.notes || '-'}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-center space-x-2">
                        <button
                          onClick={() => openModal('view', costObject)}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Xem"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          onClick={() => openModal('edit', costObject)}
                          className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                          title="Sửa"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(costObject.id)}
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

            {currentItems.length === 0 && !isLoading && (
              <div className="text-center py-8">
                <Target size={48} className="mx-auto text-gray-300 mb-4" />
                <p className="text-gray-500">
                  {searchTerm ? 'Không tìm thấy kết quả phù hợp' : 'Chưa có đối tượng tập hợp chi phí nào'}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Pagination */}
        {!isLoading && totalItems > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalItems}
            itemsPerPage={itemsPerPage}
            onPageChange={handlePageChange}
            onItemsPerPageChange={handleItemsPerPageChange}
            startIndex={startIndex}
            endIndex={Math.min(endIndex, totalItems)}
          />
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div>
                <h3 className="text-xl font-semibold text-gray-900">
                  {modalMode === 'add' && 'Thêm đối tượng tập hợp chi phí mới'}
                  {modalMode === 'view' && 'Thông tin đối tượng tập hợp chi phí'}
                  {modalMode === 'edit' && 'Chỉnh sửa đối tượng tập hợp chi phí'}
                </h3>
                {!isViewMode && (
                  <div className="flex items-center mt-2">
                    <div className="flex items-center space-x-2">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                        currentStep >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
                      }`}>
                        1
                      </div>
                      <span className={`text-sm hidden md:block ${currentStep >= 1 ? 'text-blue-600 font-medium' : 'text-gray-500'}`}>
                        Thông tin bắt buộc
                      </span>
                    </div>
                    <div className={`w-8 h-0.5 mx-2 ${currentStep >= 2 ? 'bg-blue-600' : 'bg-gray-200'}`}></div>
                    <div className="flex items-center space-x-2">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                        currentStep >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
                      }`}>
                        2
                      </div>
                      <span className={`text-sm hidden md:block ${currentStep >= 2 ? 'text-blue-600 font-medium' : 'text-gray-500'}`}>
                        Thông tin bổ sung
                      </span>
                    </div>
                  </div>
                )}
              </div>
              <button
                onClick={closeModal}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={20} className="text-gray-500" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              {/* Step 1: Required Information */}
              {(currentStep === 1 || isViewMode) && (
                <div className="space-y-6">
                  <div>
                    <h4 className="text-lg font-medium text-gray-900 mb-4 hidden md:flex items-center">
                      <div className="w-2 h-2 bg-red-500 rounded-full mr-2"></div>
                      Thông tin bắt buộc
                    </h4>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Mã đối tượng <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={formData.code || ''}
                          onChange={(e) => handleInputChange('code', e.target.value)}
                          disabled={isViewMode}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
                          placeholder="Nhập mã đối tượng"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Tên đối tượng (Tiếng Việt) <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={formData.nameVi || ''}
                          onChange={(e) => handleInputChange('nameVi', e.target.value)}
                          disabled={isViewMode}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
                          placeholder="Nhập tên đối tượng bằng tiếng Việt"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: Additional Information */}
              {(currentStep === 2 || isViewMode) && (
                <div className="space-y-6">
                  <div>
                    <h4 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                      Thông tin bổ sung
                    </h4>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Tên đối tượng (Tiếng Anh)
                        </label>
                        <input
                          type="text"
                          value={formData.nameEn || ''}
                          onChange={(e) => handleInputChange('nameEn', e.target.value)}
                          disabled={isViewMode}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
                          placeholder="Nhập tên đối tượng bằng tiếng Anh"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Tên đối tượng (Tiếng Hàn)
                        </label>
                        <input
                          type="text"
                          value={formData.nameKo || ''}
                          onChange={(e) => handleInputChange('nameKo', e.target.value)}
                          disabled={isViewMode}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
                          placeholder="Nhập tên đối tượng bằng tiếng Hàn"
                        />
                      </div>

                      <div className="lg:col-span-2">
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
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between p-6 border-t border-gray-200">
              <div className="flex items-center space-x-4">
                {!isViewMode && currentStep === 2 && (
                  <button
                    onClick={handlePrev}
                    className="flex items-center space-x-2 px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <ChevronLeft size={16} />
                    <span>Quay lại</span>
                  </button>
                )}
              </div>

              <div className="flex items-center space-x-4">
                <button
                  onClick={closeModal}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  {isViewMode ? 'Đóng' : 'Hủy'}
                </button>
                
                {!isViewMode && (
                  <>
                    {currentStep === 1 && (
                      <button
                        onClick={handleNext}
                        disabled={!canProceedToStep2}
                        className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                          canProceedToStep2
                            ? 'bg-blue-600 text-white hover:bg-blue-700'
                            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        }`}
                      >
                        <span>Tiếp theo</span>
                        <ChevronRight size={16} />
                      </button>
                    )}
                    
                    {currentStep === 2 && (
                      <button
                        onClick={handleSave}
                        className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                      >
                        <Save size={16} />
                        <span>{modalMode === 'add' ? 'Thêm' : 'Lưu'}</span>
                      </button>
                    )}
                  </>
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
          data={filteredCostObjects}
        />
      )}

      {/* Excel Import Modal */}
      {isExcelImportModalOpen && (
        <ExcelImportModal
          isOpen={isExcelImportModalOpen}
          onClose={() => setIsExcelImportModalOpen(false)}
          onImport={handleExcelImport}
          templateColumns={[
            { key: 'code', label: 'Mã đối tượng', required: true },
            { key: 'nameVi', label: 'Tên (Tiếng Việt)', required: true },
            { key: 'nameEn', label: 'Tên (Tiếng Anh)', required: false },
            { key: 'nameKo', label: 'Tên (Tiếng Hàn)', required: false },
            { key: 'notes', label: 'Ghi chú', required: false }
          ]}
        />
      )}
    </div>
  );
}