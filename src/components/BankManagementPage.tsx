import React, { useState, useCallback, useMemo } from 'react';
import { 
  Plus, 
  Eye, 
  Edit, 
  Trash2, 
  Search, 
  Filter, 
  Building2, 
  X, 
  Save, 
  ChevronLeft, 
  ChevronRight,
  Printer,
  Upload,
  Download,
  RefreshCw
} from 'lucide-react';
import Pagination from './Pagination';
import BankPrintModal from './BankPrintModal';
import BankExcelImportModal from './BankExcelImportModal';

interface BankAccount {
  id: string;
  bankName: string;
  bankCode: string;
  province: string;
  branch: string;
  accountNumber: string;
  accountName: string;
  currencyType: string;
  notes: string;
}

const bankCodes = [
  { code: 'VCB', name: 'Vietcombank' },
  { code: 'VTB', name: 'Vietinbank' },
  { code: 'BIDV', name: 'BIDV' },
  { code: 'ACB', name: 'ACB' },
  { code: 'TCB', name: 'Techcombank' },
  { code: 'MB', name: 'MB Bank' },
  { code: 'VPB', name: 'VPBank' },
  { code: 'TPB', name: 'TPBank' },
  { code: 'STB', name: 'Sacombank' },
  { code: 'EIB', name: 'Eximbank' }
];

const provinces = [
  'Hà Nội', 'TP. Hồ Chí Minh', 'Đà Nẵng', 'Hải Phòng', 'Cần Thơ',
  'An Giang', 'Bà Rịa - Vũng Tàu', 'Bắc Giang', 'Bắc Kạn', 'Bạc Liêu',
  'Bắc Ninh', 'Bến Tre', 'Bình Định', 'Bình Dương', 'Bình Phước',
  'Bình Thuận', 'Cà Mau', 'Cao Bằng', 'Đắk Lắk', 'Đắk Nông'
];

const branches = {
  'Hà Nội': ['Chi nhánh Hoàn Kiếm', 'Chi nhánh Ba Đình', 'Chi nhánh Đống Đa', 'Chi nhánh Cầu Giấy'],
  'TP. Hồ Chí Minh': ['Chi nhánh Quận 1', 'Chi nhánh Quận 3', 'Chi nhánh Quận 7', 'Chi nhánh Thủ Đức'],
  'Đà Nẵng': ['Chi nhánh Hải Châu', 'Chi nhánh Thanh Khê', 'Chi nhánh Liên Chiểu'],
  'default': ['Chi nhánh trung tâm', 'Chi nhánh khu vực']
};

const currencyTypes = [
  'VND - Việt Nam Đồng',
  'USD - Đô la Mỹ', 
  'EUR - Euro',
  'JPY - Yên Nhật',
  'KRW - Won Hàn Quốc',
  'CNY - Nhân dân tệ'
];

// Generate mock data
const generateMockData = (count: number): BankAccount[] => {
  const mockData: BankAccount[] = [];
  
  for (let i = 1; i <= count; i++) {
    const bankCode = bankCodes[Math.floor(Math.random() * bankCodes.length)];
    const province = provinces[Math.floor(Math.random() * provinces.length)];
    const branchList = branches[province] || branches.default;
    const branch = branchList[Math.floor(Math.random() * branchList.length)];
    const currency = currencyTypes[Math.floor(Math.random() * currencyTypes.length)];
    
    mockData.push({
      id: `BANK${i.toString().padStart(3, '0')}`,
      bankName: bankCode.name,
      bankCode: bankCode.code,
      province: province,
      branch: branch,
      accountNumber: `${bankCode.code}${Math.floor(Math.random() * 1000000000).toString().padStart(10, '0')}`,
      accountName: `Tài khoản ${bankCode.name} ${i}`,
      currencyType: currency,
      notes: i % 3 === 0 ? `Ghi chú cho tài khoản ${i}` : ''
    });
  }
  
  return mockData;
};

// Skeleton Loading Component
const TableSkeleton = () => {
  return (
    <div className="animate-pulse">
      {[...Array(10)].map((_, index) => (
        <tr key={index} className="border-b border-gray-100">
          <td className="px-4 py-3">
            <div className="flex items-center">
              <div className="w-4 h-4 bg-gray-200 rounded mr-3"></div>
              <div className="h-4 bg-gray-200 rounded w-16"></div>
            </div>
          </td>
          <td className="px-4 py-3">
            <div className="h-4 bg-gray-200 rounded w-24"></div>
          </td>
          <td className="px-4 py-3">
            <div className="h-4 bg-gray-200 rounded w-16"></div>
          </td>
          <td className="px-4 py-3">
            <div className="h-4 bg-gray-200 rounded w-20"></div>
          </td>
          <td className="px-4 py-3">
            <div className="h-4 bg-gray-200 rounded w-32"></div>
          </td>
          <td className="px-4 py-3">
            <div className="h-4 bg-gray-200 rounded w-28"></div>
          </td>
          <td className="px-4 py-3">
            <div className="h-4 bg-gray-200 rounded w-36"></div>
          </td>
          <td className="px-4 py-3">
            <div className="h-4 bg-gray-200 rounded w-20"></div>
          </td>
          <td className="px-4 py-3">
            <div className="h-4 bg-gray-200 rounded w-24"></div>
          </td>
          <td className="px-4 py-3">
            <div className="flex items-center justify-center space-x-2">
              <div className="w-6 h-6 bg-gray-200 rounded"></div>
              <div className="w-6 h-6 bg-gray-200 rounded"></div>
              <div className="w-6 h-6 bg-gray-200 rounded"></div>
            </div>
          </td>
        </tr>
      ))}
    </div>
  );
};

export default function BankManagementPage() {
  const [allBankAccounts] = useState<BankAccount[]>(generateMockData(1000));
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'view' | 'edit'>('add');
  const [selectedBankAccount, setSelectedBankAccount] = useState<BankAccount | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState<Partial<BankAccount>>({});
  const [currentStep, setCurrentStep] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(25);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Filter and pagination logic
  const filteredBankAccounts = useMemo(() => {
    return allBankAccounts.filter(account =>
      account.bankName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      account.bankCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      account.accountNumber.includes(searchTerm) ||
      account.accountName.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [allBankAccounts, searchTerm]);

  const totalPages = Math.ceil(filteredBankAccounts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentBankAccounts = filteredBankAccounts.slice(startIndex, endIndex);

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  const handleItemsPerPageChange = useCallback((newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1);
  }, []);

  const openModal = (mode: 'add' | 'view' | 'edit', bankAccount?: BankAccount) => {
    setModalMode(mode);
    setSelectedBankAccount(bankAccount || null);
    setFormData(bankAccount || {});
    setCurrentStep(1);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedBankAccount(null);
    setFormData({});
    setCurrentStep(1);
  };

  const handleInputChange = (field: keyof BankAccount, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateStep1 = () => {
    const requiredFields = ['bankName', 'bankCode', 'province', 'branch'];
    return requiredFields.every(field => formData[field as keyof BankAccount]?.toString().trim());
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
    // In a real app, this would save to backend
    console.log('Saving bank account:', formData);
    closeModal();
  };

  const handleDelete = (bankAccountId: string) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa tài khoản ngân hàng này?')) {
      console.log('Deleting bank account:', bankAccountId);
    }
  };

  const handleRefresh = async () => {
    setIsLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsLoading(false);
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
              <Building2 className="text-blue-600" size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Quản lý Ngân hàng</h2>
              <p className="text-gray-600 mt-1">Quản lý ngân hàng ({filteredBankAccounts.length.toLocaleString('vi-VN')} bản ghi)</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setIsImportModalOpen(true)}
              className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
            >
              <Upload size={20} />
              <span className="hidden sm:inline">Nhập Excel</span>
            </button>
            <button
              onClick={() => setIsPrintModalOpen(true)}
              className="flex items-center space-x-2 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
            >
              <Printer size={20} />
              <span className="hidden sm:inline">In ấn</span>
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
        <div className="flex items-center space-x-4 mb-6">
          <div className="flex-1 relative">
            <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm kiếm mã, tên..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <button 
            onClick={handleRefresh}
            disabled={isLoading}
            className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            <RefreshCw size={20} className={`text-gray-400 ${isLoading ? 'animate-spin' : ''}`} />
            <span className="text-gray-700 hidden sm:inline">Làm mới</span>
          </button>
          <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            <Filter size={20} className="text-gray-400" />
            <span className="text-gray-700 hidden sm:inline">Lọc</span>
          </button>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow border border-gray-200">
          <div className="overflow-x-auto">
            <table className="min-w-full table-auto">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <input type="checkbox" className="rounded border-gray-300" />
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tên ngân hàng</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mã ngân hàng</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tỉnh</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Chi nhánh</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Số tài khoản</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tên tài khoản ngân hàng</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Loại tiền</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ghi chú</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {isLoading ? (
                  <TableSkeleton />
                ) : currentBankAccounts.length > 0 ? (
                  currentBankAccounts.map((account) => (
                    <tr key={account.id} className="group hover:bg-gray-50">
                      <td className="px-4 py-3 group-hover:bg-gray-50">
                        <input type="checkbox" className="rounded border-gray-300" />
                      </td>
                      <td className="px-4 py-3 group-hover:bg-gray-50">
                        <div className="font-medium text-gray-900">{account.bankName}</div>
                      </td>
                      <td className="px-4 py-3 group-hover:bg-gray-50">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {account.bankCode}
                        </span>
                      </td>
                      <td className="px-4 py-3 group-hover:bg-gray-50">
                        <div className="text-gray-900">{account.province}</div>
                      </td>
                      <td className="px-4 py-3 group-hover:bg-gray-50">
                        <div className="text-gray-900">{account.branch}</div>
                      </td>
                      <td className="px-4 py-3 group-hover:bg-gray-50">
                        <div className="text-gray-900 font-mono">{account.accountNumber}</div>
                      </td>
                      <td className="px-4 py-3 group-hover:bg-gray-50">
                        <div className="text-gray-900">{account.accountName}</div>
                      </td>
                      <td className="px-4 py-3 group-hover:bg-gray-50">
                        <div className="text-gray-900">{account.currencyType}</div>
                      </td>
                      <td className="px-4 py-3 group-hover:bg-gray-50">
                        <div className="text-gray-900">{account.notes || '-'}</div>
                      </td>
                      <td className="px-4 py-3 group-hover:bg-gray-50">
                        <div className="flex items-center justify-center space-x-2">
                          <button
                            onClick={() => openModal('view', account)}
                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Xem"
                          >
                            <Eye size={16} />
                          </button>
                          <button
                            onClick={() => openModal('edit', account)}
                            className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                            title="Sửa"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(account.id)}
                            className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Xóa"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={10} className="px-4 py-8 text-center">
                      <Building2 size={48} className="mx-auto text-gray-300 mb-4" />
                      <p className="text-gray-500">Không tìm thấy tài khoản ngân hàng nào</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {!isLoading && filteredBankAccounts.length > 0 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={filteredBankAccounts.length}
              itemsPerPage={itemsPerPage}
              onPageChange={handlePageChange}
              onItemsPerPageChange={handleItemsPerPageChange}
              startIndex={startIndex}
              endIndex={Math.min(endIndex, filteredBankAccounts.length)}
            />
          )}
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div>
                <h3 className="text-xl font-semibold text-gray-900">
                  {modalMode === 'add' && 'Thêm tài khoản ngân hàng mới'}
                  {modalMode === 'view' && 'Thông tin tài khoản ngân hàng'}
                  {modalMode === 'edit' && 'Chỉnh sửa tài khoản ngân hàng'}
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
                          Tên ngân hàng <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={formData.bankName || ''}
                          onChange={(e) => handleInputChange('bankName', e.target.value)}
                          disabled={isViewMode}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
                          placeholder="Nhập tên ngân hàng"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Mã ngân hàng <span className="text-red-500">*</span>
                        </label>
                        <select
                          value={formData.bankCode || ''}
                          onChange={(e) => handleInputChange('bankCode', e.target.value)}
                          disabled={isViewMode}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
                        >
                          <option value="">Chọn mã ngân hàng</option>
                          {bankCodes.map(bank => (
                            <option key={bank.code} value={bank.code}>{bank.code} - {bank.name}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Tỉnh <span className="text-red-500">*</span>
                        </label>
                        <select
                          value={formData.province || ''}
                          onChange={(e) => handleInputChange('province', e.target.value)}
                          disabled={isViewMode}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
                        >
                          <option value="">Chọn tỉnh/thành phố</option>
                          {provinces.map(province => (
                            <option key={province} value={province}>{province}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Chi nhánh <span className="text-red-500">*</span>
                        </label>
                        <select
                          value={formData.branch || ''}
                          onChange={(e) => handleInputChange('branch', e.target.value)}
                          disabled={isViewMode}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
                        >
                          <option value="">Chọn chi nhánh</option>
                          {(formData.province ? branches[formData.province] || branches.default : branches.default).map(branch => (
                            <option key={branch} value={branch}>{branch}</option>
                          ))}
                        </select>
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
                          Số tài khoản
                        </label>
                        <input
                          type="text"
                          value={formData.accountNumber || ''}
                          onChange={(e) => handleInputChange('accountNumber', e.target.value)}
                          disabled={isViewMode}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
                          placeholder="Nhập số tài khoản"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Tên tài khoản ngân hàng
                        </label>
                        <input
                          type="text"
                          value={formData.accountName || ''}
                          onChange={(e) => handleInputChange('accountName', e.target.value)}
                          disabled={isViewMode}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
                          placeholder="Nhập tên tài khoản"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Loại tiền
                        </label>
                        <select
                          value={formData.currencyType || ''}
                          onChange={(e) => handleInputChange('currencyType', e.target.value)}
                          disabled={isViewMode}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
                        >
                          <option value="">Chọn loại tiền</option>
                          {currencyTypes.map(currency => (
                            <option key={currency} value={currency}>{currency}</option>
                          ))}
                        </select>
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
        <BankPrintModal
          isOpen={isPrintModalOpen}
          onClose={() => setIsPrintModalOpen(false)}
          data={filteredBankAccounts}
        />
      )}

      {/* Import Modal */}
      {isImportModalOpen && (
        <BankExcelImportModal
          isOpen={isImportModalOpen}
          onClose={() => setIsImportModalOpen(false)}
          onImport={(data) => {
            console.log('Imported data:', data);
            setIsImportModalOpen(false);
          }}
        />
      )}
    </div>
  );
}