import React, { useState } from 'react';
import { Plus, Eye, Edit, Trash2, Search, Filter, Building2, X, Save, ChevronLeft, ChevronRight, Printer, Upload } from 'lucide-react';
import BankPrintModal from './BankPrintModal';
import BankExcelImportModal from './BankExcelImportModal';

interface Bank {
  id: string;
  bankName: string;
  bankCode: string;
  province: string;
  branch: string;
  accountNumber?: string;
  accountHolderName?: string;
  currency?: string;
}

const bankCodes = [
  { code: 'VCB', name: 'Vietcombank' },
  { code: 'TCB', name: 'Techcombank' },
  { code: 'BIDV', name: 'BIDV' },
  { code: 'VTB', name: 'Vietinbank' },
  { code: 'ACB', name: 'ACB' },
  { code: 'MB', name: 'MB Bank' },
  { code: 'SHB', name: 'SHB' },
  { code: 'VPB', name: 'VPBank' },
  { code: 'TPB', name: 'TPBank' },
  { code: 'MSB', name: 'MSB' },
  { code: 'OCB', name: 'OCB' },
  { code: 'SCB', name: 'SCB' },
  { code: 'HDBank', name: 'HDBank' },
  { code: 'LPB', name: 'LienVietPostBank' },
  { code: 'VIB', name: 'VIB' }
];

const provinces = [
  'Hà Nội', 'TP. Hồ Chí Minh', 'Đà Nẵng', 'Hải Phòng', 'Cần Thơ',
  'An Giang', 'Bà Rịa - Vũng Tàu', 'Bắc Giang', 'Bắc Kạn', 'Bạc Liêu',
  'Bắc Ninh', 'Bến Tre', 'Bình Định', 'Bình Dương', 'Bình Phước',
  'Bình Thuận', 'Cà Mau', 'Cao Bằng', 'Đắk Lắk', 'Đắk Nông'
];

const branchesByProvince: { [key: string]: string[] } = {
  'Hà Nội': ['Chi nhánh Hoàn Kiếm', 'Chi nhánh Ba Đình', 'Chi nhánh Đống Đa', 'Chi nhánh Cầu Giấy', 'Chi nhánh Thanh Xuân'],
  'TP. Hồ Chí Minh': ['Chi nhánh Quận 1', 'Chi nhánh Quận 3', 'Chi nhánh Quận 7', 'Chi nhánh Thủ Đức', 'Chi nhánh Bình Thạnh'],
  'Đà Nẵng': ['Chi nhánh Hải Châu', 'Chi nhánh Thanh Khê', 'Chi nhánh Liên Chiểu'],
  'Hải Phòng': ['Chi nhánh Hồng Bàng', 'Chi nhánh Lê Chân', 'Chi nhánh Ngô Quyền'],
  'Cần Thơ': ['Chi nhánh Ninh Kiều', 'Chi nhánh Cái Răng', 'Chi nhánh Ô Môn']
};

const currencies = [
  { code: 'VND', name: 'Việt Nam Đồng (VND)' },
  { code: 'USD', name: 'Đô la Mỹ (USD)' },
  { code: 'EUR', name: 'Euro (EUR)' },
  { code: 'JPY', name: 'Yên Nhật (JPY)' },
  { code: 'CNY', name: 'Nhân dân tệ (CNY)' },
  { code: 'KRW', name: 'Won Hàn Quốc (KRW)' }
];

const mockBanks: Bank[] = [
  {
    id: '1',
    bankName: 'Ngân hàng TMCP Ngoại thương Việt Nam',
    bankCode: 'VCB',
    province: 'Hà Nội',
    branch: 'Chi nhánh Hoàn Kiếm',
    accountNumber: '0123456789012',
    accountHolderName: 'CÔNG TY TNHH ABC TECHNOLOGY',
    currency: 'VND'
  },
  {
    id: '2',
    bankName: 'Ngân hàng TMCP Kỹ thương Việt Nam',
    bankCode: 'TCB',
    province: 'TP. Hồ Chí Minh',
    branch: 'Chi nhánh Quận 1',
    accountNumber: '9876543210987',
    accountHolderName: 'CÔNG TY CỔ PHẦN XYZ TRADING',
    currency: 'USD'
  }
];

export default function BankManagementPage() {
  const [banks, setBanks] = useState<Bank[]>(mockBanks);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'view' | 'edit'>('add');
  const [selectedBank, setSelectedBank] = useState<Bank | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState<Partial<Bank>>({});
  const [currentStep, setCurrentStep] = useState(1);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [isExcelImportModalOpen, setIsExcelImportModalOpen] = useState(false);

  const filteredBanks = banks.filter(bank =>
    bank.bankName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    bank.bankCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
    bank.accountNumber?.includes(searchTerm) ||
    bank.accountHolderName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const openModal = (mode: 'add' | 'view' | 'edit', bank?: Bank) => {
    setModalMode(mode);
    setSelectedBank(bank || null);
    setFormData(bank || {});
    setCurrentStep(1);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedBank(null);
    setFormData({});
    setCurrentStep(1);
  };

  const handleInputChange = (field: keyof Bank, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Reset branch when province changes
    if (field === 'province') {
      setFormData(prev => ({ ...prev, branch: '' }));
    }
  };

  const validateStep1 = () => {
    const requiredFields = ['bankName', 'bankCode', 'province', 'branch'];
    return requiredFields.every(field => formData[field as keyof Bank]?.toString().trim());
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
      const newBank: Bank = {
        id: Date.now().toString(),
        bankName: formData.bankName || '',
        bankCode: formData.bankCode || '',
        province: formData.province || '',
        branch: formData.branch || '',
        accountNumber: formData.accountNumber,
        accountHolderName: formData.accountHolderName,
        currency: formData.currency
      };
      setBanks(prev => [...prev, newBank]);
    } else if (modalMode === 'edit' && selectedBank) {
      setBanks(prev => prev.map(bank => 
        bank.id === selectedBank.id 
          ? { ...bank, ...formData }
          : bank
      ));
    }
    closeModal();
  };

  const handleDelete = (bankId: string) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa ngân hàng này?')) {
      setBanks(prev => prev.filter(bank => bank.id !== bankId));
    }
  };

  const handleExcelImport = (importedBanks: Bank[]) => {
    setBanks(prev => [...prev, ...importedBanks]);
    setIsExcelImportModalOpen(false);
  };

  const isViewMode = modalMode === 'view';
  const canProceedToStep2 = validateStep1();
  const availableBranches = formData.province ? branchesByProvince[formData.province] || [] : [];

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
              <p className="text-gray-600 mt-1">Quản lý thông tin các ngân hàng trong hệ thống ({banks.length} bản ghi)</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setIsPrintModalOpen(true)}
              className="flex items-center space-x-2 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
            >
              <Printer size={20} />
              <span>In ấn</span>
            </button>
            <button
              onClick={() => setIsExcelImportModalOpen(true)}
              className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
            >
              <Upload size={20} />
              <span>Nhập Excel</span>
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
              placeholder="Tìm kiếm theo tên ngân hàng, mã, số tài khoản..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            <Filter size={20} className="text-gray-400" />
            <span className="text-gray-700">Lọc</span>
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-medium text-gray-700">Tên ngân hàng</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Mã ngân hàng</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Tỉnh/Chi nhánh</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Số tài khoản</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Tên tài khoản</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Loại tiền</th>
                <th className="text-center py-3 px-4 font-medium text-gray-700">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filteredBanks.map((bank) => (
                <tr key={bank.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <div className="font-medium text-gray-900">{bank.bankName}</div>
                  </td>
                  <td className="py-3 px-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {bank.bankCode}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="text-gray-900">{bank.province}</div>
                    <div className="text-sm text-gray-500">{bank.branch}</div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="font-mono text-gray-900">{bank.accountNumber || '-'}</div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="text-gray-900">{bank.accountHolderName || '-'}</div>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      bank.currency === 'VND' ? 'bg-green-100 text-green-800' :
                      bank.currency === 'USD' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {bank.currency || '-'}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center justify-center space-x-2">
                      <button
                        onClick={() => openModal('view', bank)}
                        className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Xem"
                      >
                        <Eye size={16} />
                      </button>
                      <button
                        onClick={() => openModal('edit', bank)}
                        className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                        title="Sửa"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(bank.id)}
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

          {filteredBanks.length === 0 && (
            <div className="text-center py-8">
              <Building2 size={48} className="mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500">Không tìm thấy ngân hàng nào</p>
            </div>
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
                  {modalMode === 'add' && 'Thêm ngân hàng mới'}
                  {modalMode === 'view' && 'Thông tin ngân hàng'}
                  {modalMode === 'edit' && 'Chỉnh sửa thông tin ngân hàng'}
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
                      <div className="lg:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Tên ngân hàng <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={formData.bankName || ''}
                          onChange={(e) => handleInputChange('bankName', e.target.value)}
                          disabled={isViewMode}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
                          placeholder="Nhập tên đầy đủ của ngân hàng"
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
                            <option key={bank.code} value={bank.code}>
                              {bank.code} - {bank.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Tỉnh/Thành phố <span className="text-red-500">*</span>
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

                      <div className="lg:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Chi nhánh <span className="text-red-500">*</span>
                        </label>
                        <select
                          value={formData.branch || ''}
                          onChange={(e) => handleInputChange('branch', e.target.value)}
                          disabled={isViewMode || !formData.province}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
                        >
                          <option value="">
                            {formData.province ? 'Chọn chi nhánh' : 'Vui lòng chọn tỉnh/thành phố trước'}
                          </option>
                          {availableBranches.map(branch => (
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
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500 font-mono"
                          placeholder="Nhập số tài khoản"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Loại tiền
                        </label>
                        <select
                          value={formData.currency || ''}
                          onChange={(e) => handleInputChange('currency', e.target.value)}
                          disabled={isViewMode}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
                        >
                          <option value="">Chọn loại tiền</option>
                          {currencies.map(currency => (
                            <option key={currency.code} value={currency.code}>
                              {currency.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="lg:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Tên tài khoản ngân hàng
                        </label>
                        <input
                          type="text"
                          value={formData.accountHolderName || ''}
                          onChange={(e) => handleInputChange('accountHolderName', e.target.value)}
                          disabled={isViewMode}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
                          placeholder="Nhập tên chủ tài khoản"
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
          data={banks}
        />
      )}

      {/* Excel Import Modal */}
      {isExcelImportModalOpen && (
        <BankExcelImportModal
          isOpen={isExcelImportModalOpen}
          onClose={() => setIsExcelImportModalOpen(false)}
          onImport={handleExcelImport}
        />
      )}
    </div>
  );
}