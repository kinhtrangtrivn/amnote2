import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { Plus, Eye, Edit, Trash2, Search, Filter, Target, X, Save, ChevronLeft, ChevronRight, Printer, Upload, Download, RefreshCw, Loader2 } from 'lucide-react';
import * as XLSX from 'xlsx';
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

// Generate more mock data for pagination testing
const generateMockData = (count: number): CostObject[] => {
  const departments = [
    'Marketing', 'Kế Toán', 'IT', 'Nhân Sự', 'Kinh Doanh', 'Vận Hành', 
    'Chất Lượng', 'Sản Xuất', 'Tài Chính', 'Pháp Chế', 'Hành Chính',
    'Nghiên Cứu', 'Phát Triển', 'Bảo Trì', 'An Toàn', 'Môi Trường'
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

export default function CostObjectPage() {
  const [costObjects, setCostObjects] = useState<CostObject[]>(allMockData);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'view' | 'edit'>('add');
  const [selectedCostObject, setSelectedCostObject] = useState<CostObject | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState<Partial<CostObject>>({});
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(25);
  
  // Loading states
  const [isTableLoading, setIsTableLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Simulate loading when searching or changing pagination
  useEffect(() => {
    setIsTableLoading(true);
    const timer = setTimeout(() => {
      setIsTableLoading(false);
    }, 800); // Simulate API call delay

    return () => clearTimeout(timer);
  }, [searchTerm, currentPage, itemsPerPage]);

  // Memoized calculations để tối ưu hiệu suất
  const filteredCostObjects = useMemo(() => {
    return costObjects.filter(costObject =>
      costObject.nameVi.toLowerCase().includes(searchTerm.toLowerCase()) ||
      costObject.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      costObject.nameEn.toLowerCase().includes(searchTerm.toLowerCase()) ||
      costObject.nameKo.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [costObjects, searchTerm]);

  const totalPages = useMemo(() => {
    return Math.ceil(filteredCostObjects.length / itemsPerPage);
  }, [filteredCostObjects.length, itemsPerPage]);

  const startIndex = useMemo(() => {
    return (currentPage - 1) * itemsPerPage;
  }, [currentPage, itemsPerPage]);

  const endIndex = useMemo(() => {
    return startIndex + itemsPerPage;
  }, [startIndex, itemsPerPage]);

  const currentPageData = useMemo(() => {
    return filteredCostObjects.slice(startIndex, endIndex);
  }, [filteredCostObjects, startIndex, endIndex]);

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
    setSelectedItems([]);
    setSelectAll(false);
  }, []);

  const handleItemsPerPageChange = useCallback((newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1);
    setSelectedItems([]);
    setSelectAll(false);
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
      setCostObjects(prev => prev.map(costObject => 
        costObject.id === selectedCostObject.id 
          ? { ...costObject, ...formData }
          : costObject
      ));
    }
    closeModal();
  };

  const handleDelete = (costObjectId: string) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa đối tượng này?')) {
      setCostObjects(prev => prev.filter(costObject => costObject.id !== costObjectId));
    }
  };

  const handleBulkDelete = () => {
    if (selectedItems.length === 0) return;
    
    if (window.confirm(`Bạn có chắc chắn muốn xóa ${selectedItems.length} đối tượng đã chọn?`)) {
      setCostObjects(prev => prev.filter(costObject => !selectedItems.includes(costObject.id)));
      setSelectedItems([]);
      setSelectAll(false);
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
    if (selectAll) {
      setSelectedItems([]);
    } else {
      setSelectedItems(currentPageData.map(item => item.id));
    }
    setSelectAll(!selectAll);
  };

  const handleExport = () => {
    const exportData = selectedItems.length > 0 
      ? costObjects.filter(item => selectedItems.includes(item.id))
      : filteredCostObjects;

    const worksheet = XLSX.utils.json_to_sheet(exportData.map(item => ({
      'Mã đối tượng': item.code,
      'Tên đối tượng (Tiếng Việt)': item.nameVi,
      'Tên đối tượng (Tiếng Anh)': item.nameEn,
      'Tên đối tượng (Tiếng Hàn)': item.nameKo,
      'Ghi chú': item.notes
    })));

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Đối tượng tập hợp chi phí');
    
    const fileName = `doi-tuong-tap-hop-chi-phi-${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(workbook, fileName);
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    // Simulate API refresh
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsRefreshing(false);
    setSelectedItems([]);
    setSelectAll(false);
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
              <p className="text-gray-600 mt-1">Quản lý đối tượng tập hợp chi phí ({filteredCostObjects.length.toLocaleString('vi-VN')} bản ghi)</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="flex items-center space-x-2 px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
              title="Làm mới dữ liệu"
            >
              <RefreshCw size={16} className={isRefreshing ? 'animate-spin' : ''} />
              <span className="hidden sm:block">Làm mới</span>
            </button>
            <button
              onClick={() => setShowPrintModal(true)}
              className="flex items-center space-x-2 px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Printer size={16} />
              <span className="hidden sm:block">In ấn</span>
            </button>
            <button
              onClick={() => setShowImportModal(true)}
              className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
            >
              <Upload size={16} />
              <span className="hidden sm:block">Nhập Excel</span>
            </button>
            <button
              onClick={() => openModal('add')}
              className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus size={16} />
              <span className="hidden sm:block">Thêm mới</span>
            </button>
          </div>
        </div>

        {/* Search and Actions */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-4 sm:space-y-0 sm:space-x-4 mb-6">
          <div className="flex-1 relative max-w-md">
            <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm kiếm mã, tên..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div className="flex items-center space-x-3">
            {selectedItems.length > 0 && (
              <>
                <span className="text-sm text-gray-600">
                  Đã chọn {selectedItems.length} mục
                </span>
                <button
                  onClick={handleBulkDelete}
                  className="flex items-center space-x-2 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  <Trash2 size={16} />
                  <span>Xóa</span>
                </button>
              </>
            )}
            <button
              onClick={handleExport}
              className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Download size={16} className="text-gray-400" />
              <span className="text-gray-700">Xuất Excel</span>
            </button>
            <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              <Filter size={16} className="text-gray-400" />
              <span className="text-gray-700 hidden sm:block">Lọc</span>
            </button>
          </div>
        </div>

        {/* Table Container with Loading Overlay */}
        <div classNam