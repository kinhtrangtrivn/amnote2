import React, { useState, useRef } from 'react';
import { 
  X, 
  Upload, 
  Download, 
  FileSpreadsheet, 
  CheckCircle, 
  AlertCircle, 
  Info,
  ArrowLeft,
  ArrowRight,
  Play,
  FileText,
  Settings,
  Eye,
  AlertTriangle
} from 'lucide-react';

interface ExcelImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (data: any[]) => void;
}

interface ColumnMapping {
  softwareColumn: string;
  excelColumn: string;
  required: boolean;
  description: string;
}

interface ValidationResult {
  rowIndex: number;
  isValid: boolean;
  errors: string[];
  data: Record<string, any>;
}

const COLUMN_MAPPINGS: ColumnMapping[] = [
  { softwareColumn: 'code', excelColumn: '', required: true, description: 'Mã đối tượng tập hợp chi phí (bắt buộc)' },
  { softwareColumn: 'nameVi', excelColumn: '', required: true, description: 'Tên tiếng Việt (bắt buộc)' },
  { softwareColumn: 'nameEn', excelColumn: '', required: false, description: 'Tên tiếng Anh (tùy chọn)' },
  { softwareColumn: 'nameKo', excelColumn: '', required: false, description: 'Tên tiếng Hàn (tùy chọn)' },
  { softwareColumn: 'parentObject', excelColumn: '', required: false, description: 'Mã đối tượng gốc (tùy chọn)' },
  { softwareColumn: 'notes', excelColumn: '', required: false, description: 'Ghi chú (tùy chọn)' }
];

export default function ExcelImportModal({ isOpen, onClose, onImport }: ExcelImportModalProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedSheet, setSelectedSheet] = useState('');
  const [headerRow, setHeaderRow] = useState(1);
  const [importMethod, setImportMethod] = useState<'add' | 'update' | 'overwrite'>('add');
  const [availableSheets, setAvailableSheets] = useState<string[]>([]);
  const [availableColumns, setAvailableColumns] = useState<string[]>([]);
  const [columnMappings, setColumnMappings] = useState<ColumnMapping[]>(COLUMN_MAPPINGS);
  const [validationResults, setValidationResults] = useState<ValidationResult[]>([]);
  const [selectedRows, setSelectedRows] = useState<number[]>([]);
  const [filterType, setFilterType] = useState<'all' | 'valid' | 'invalid'>('all');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Mock data for demonstration
  const mockSheets = ['Sheet1', 'Data', 'Import'];
  const mockColumns = ['Mã', 'Tên Việt', 'Tên Anh', 'Tên Hàn', 'Ghi chú', 'Đối tượng cha'];
  const mockValidationData: ValidationResult[] = [
    {
      rowIndex: 1,
      isValid: true,
      errors: [],
      data: { code: 'CC001', nameVi: 'Phòng Sản Xuất', nameEn: 'Production Dept', nameKo: '생산부', notes: 'Bộ phận sản xuất' }
    },
    {
      rowIndex: 2,
      isValid: false,
      errors: ['Mã đối tượng không được để trống', 'Tên tiếng Việt không được để trống'],
      data: { code: '', nameVi: '', nameEn: 'Marketing Dept', nameKo: '마케팅부', notes: 'Bộ phận marketing' }
    },
    {
      rowIndex: 3,
      isValid: true,
      errors: [],
      data: { code: 'CC003', nameVi: 'Phòng Kế Toán', nameEn: 'Accounting Dept', nameKo: '회계부', notes: 'Bộ phận kế toán' }
    },
    {
      rowIndex: 4,
      isValid: false,
      errors: ['Mã đối tượng đã tồn tại trong hệ thống'],
      data: { code: 'CC001', nameVi: 'Phòng Nhân Sự', nameEn: 'HR Dept', nameKo: '인사부', notes: 'Bộ phận nhân sự' }
    }
  ];

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      // Mock loading sheets
      setAvailableSheets(mockSheets);
      setSelectedSheet(mockSheets[0]);
      // Mock loading columns
      setAvailableColumns(mockColumns);
    }
  };

  const handleDownloadTemplate = () => {
    // Create CSV template
    const headers = ['Mã đối tượng*', 'Tên tiếng Việt*', 'Tên tiếng Anh', 'Tên tiếng Hàn', 'Đối tượng gốc', 'Ghi chú'];
    const sampleData = [
      ['CC001', 'Phòng Sản Xuất', 'Production Dept', '생산부', '', 'Bộ phận sản xuất chính'],
      ['CC002', 'Phòng Marketing', 'Marketing Dept', '마케팅부', 'CC001', 'Bộ phận marketing']
    ];
    
    const csvContent = [headers, ...sampleData].map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'mau-doi-tuong-tap-hop-chi-phi.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleColumnMappingChange = (index: number, excelColumn: string) => {
    const newMappings = [...columnMappings];
    newMappings[index].excelColumn = excelColumn;
    setColumnMappings(newMappings);
  };

  const validateMappings = () => {
    const requiredMappings = columnMappings.filter(m => m.required);
    return requiredMappings.every(m => m.excelColumn.trim() !== '');
  };

  const handleNextStep = () => {
    if (currentStep === 1) {
      if (!selectedFile || !selectedSheet) {
        alert('Vui lòng chọn file và sheet!');
        return;
      }
      setCurrentStep(2);
    } else if (currentStep === 2) {
      if (!validateMappings()) {
        alert('Vui lòng ghép đầy đủ các cột bắt buộc!');
        return;
      }
      // Mock validation
      setValidationResults(mockValidationData);
      setSelectedRows(mockValidationData.filter(r => r.isValid).map(r => r.rowIndex));
      setCurrentStep(3);
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSelectRows = (type: 'all' | 'valid' | 'invalid') => {
    setFilterType(type);
    switch (type) {
      case 'all':
        setSelectedRows(validationResults.map(r => r.rowIndex));
        break;
      case 'valid':
        setSelectedRows(validationResults.filter(r => r.isValid).map(r => r.rowIndex));
        break;
      case 'invalid':
        setSelectedRows(validationResults.filter(r => !r.isValid).map(r => r.rowIndex));
        break;
    }
  };

  const handleRowSelect = (rowIndex: number, checked: boolean) => {
    if (checked) {
      setSelectedRows(prev => [...prev, rowIndex]);
    } else {
      setSelectedRows(prev => prev.filter(r => r !== rowIndex));
    }
  };

  const handleDownloadErrors = () => {
    const errorRows = validationResults.filter(r => !r.isValid);
    const headers = ['Dòng', 'Lỗi', 'Mã', 'Tên Việt', 'Tên Anh', 'Tên Hàn', 'Ghi chú'];
    const errorData = errorRows.map(row => [
      row.rowIndex.toString(),
      row.errors.join('; '),
      row.data.code || '',
      row.data.nameVi || '',
      row.data.nameEn || '',
      row.data.nameKo || '',
      row.data.notes || ''
    ]);
    
    const csvContent = [headers, ...errorData].map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'loi-nhap-du-lieu.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleImport = () => {
    const selectedData = validationResults
      .filter(r => selectedRows.includes(r.rowIndex) && r.isValid)
      .map(r => r.data);
    
    onImport(selectedData);
    onClose();
    alert(`Đã nhập thành công ${selectedData.length} bản ghi!`);
  };

  const handleClose = () => {
    if (currentStep > 1) {
      if (window.confirm('Bạn có chắc chắn muốn hủy quá trình nhập dữ liệu?')) {
        onClose();
      }
    } else {
      onClose();
    }
  };

  const getFilteredResults = () => {
    switch (filterType) {
      case 'valid':
        return validationResults.filter(r => r.isValid);
      case 'invalid':
        return validationResults.filter(r => !r.isValid);
      default:
        return validationResults;
    }
  };

  const validCount = validationResults.filter(r => r.isValid).length;
  const invalidCount = validationResults.filter(r => !r.isValid).length;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gray-100 p-6 text-black">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-white/20 rounded-lg">
                <Upload size={24} />
              </div>
              <div>
                <h2 className="text-xl font-bold">Nhập dữ liệu từ Excel</h2>
                <p className="text-gray-600 text-sm">
                  Nhập danh sách đối tượng tập hợp chi phí từ file Excel
                </p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <X size={24} />
            </button>
          </div>
        
          {/* Progress Bar */}
<div className="mt-6 w-full">
  <div className="flex items-center justify-between mb-2 w-full">
    {[1, 2, 3].map((step, idx, arr) => (
      <React.Fragment key={step}>
        <div
          className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
            currentStep >= step ? 'bg-white text-black' : 'bg-white/20 text-gray-400'
          }`}
        >
          {currentStep > step ? <CheckCircle size={16} /> : step}
        </div>
        {idx < arr.length - 1 && (
          <div
            className={`flex-1 h-1 mx-2 ${
              currentStep > step ? 'bg-gray-300' : 'bg-gray-600'
            }`}
          />
        )}
      </React.Fragment>
    ))}
  </div>
  <div className="flex justify-between text-sm text-gray-500 w-full">
    <span className={currentStep >= 1 ? 'text-black font-medium' : ''}>Chọn tệp</span>
    <span className={currentStep >= 2 ? 'text-black font-medium' : ''}>Ghép dữ liệu</span>
    <span className={currentStep >= 3 ? 'text-black font-medium' : ''}>Kiểm tra</span>
  </div>
</div>

        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {/* Step 1: File Selection */}
          {currentStep === 1 && (
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* File Selection */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Chọn tệp Excel <span className="text-red-500">*</span>
                    </label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-green-400 transition-colors">
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept=".xlsx,.xls"
                        onChange={handleFileSelect}
                        className="hidden"
                      />
                      <FileSpreadsheet className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                      >
                        Chọn tệp Excel
                      </button>
                      <p className="text-sm text-gray-500 mt-2">
                        Hỗ trợ định dạng .xlsx, .xls
                      </p>
                      {selectedFile && (
                        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                          <div className="flex items-center space-x-2">
                            <FileSpreadsheet size={16} className="text-green-600" />
                            <span className="text-sm font-medium text-green-800">
                              {selectedFile.name}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <button
                      onClick={handleDownloadTemplate}
                      className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 text-sm"
                    >
                      <Download size={16} />
                      <span>Tải tệp mẫu cơ bản</span>
                    </button>
                  </div>
                </div>

                {/* Configuration */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Sheet chứa dữ liệu <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={selectedSheet}
                      onChange={(e) => setSelectedSheet(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      disabled={!selectedFile}
                    >
                      <option value="">Chọn sheet</option>
                      {availableSheets.map(sheet => (
                        <option key={sheet} value={sheet}>{sheet}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Dòng tiêu đề
                      <div className="text-xs text-gray-500 mt-1">
                        Nhập số dòng tiêu đề trong sheet (ví dụ: 1)
                      </div>
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={headerRow}
                      onChange={(e) => setHeaderRow(parseInt(e.target.value) || 1)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Phương pháp nhập dữ liệu
                    </label>
                    <div className="space-y-2">
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="importMethod"
                          value="add"
                          checked={importMethod === 'add'}
                          onChange={(e) => setImportMethod(e.target.value as any)}
                          className="text-green-600 focus:ring-green-500"
                        />
                        <span className="ml-2 text-sm">Thêm mới</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="importMethod"
                          value="update"
                          checked={importMethod === 'update'}
                          onChange={(e) => setImportMethod(e.target.value as any)}
                          className="text-green-600 focus:ring-green-500"
                        />
                        <span className="ml-2 text-sm">Cập nhật</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="importMethod"
                          value="overwrite"
                          checked={importMethod === 'overwrite'}
                          onChange={(e) => setImportMethod(e.target.value as any)}
                          className="text-green-600 focus:ring-green-500"
                        />
                        <span className="ml-2 text-sm">Ghi đè</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Column Mapping */}
          {currentStep === 2 && (
            <div className="p-6">
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Ghép cột dữ liệu</h3>
                <p className="text-sm text-gray-600">
                  Ghép các cột trong phần mềm với các cột trong file Excel của bạn
                </p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full border border-gray-200 rounded-lg">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 w-16">
                        Bắt buộc
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                        Cột trên phần mềm
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                        Cột trên Excel
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                        Diễn giải
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {columnMappings.map((mapping, index) => (
                      <tr key={mapping.softwareColumn} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-center">
                          {mapping.required ? (
                            <div className="flex items-center justify-center">
                              <AlertCircle size={16} className="text-red-500" />
                            </div>
                          ) : (
                            <div className="flex items-center justify-center">
                              <Info size={16} className="text-gray-400" />
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <div className="font-medium text-gray-900">
                            {mapping.softwareColumn}
                            {mapping.required && <span className="text-red-500 ml-1">*</span>}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <select
                            value={mapping.excelColumn}
                            onChange={(e) => handleColumnMappingChange(index, e.target.value)}
                            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                              mapping.required && !mapping.excelColumn 
                                ? 'border-red-300 bg-red-50' 
                                : 'border-gray-300'
                            }`}
                          >
                            <option value="">Chọn cột Excel</option>
                            {availableColumns.map(col => (
                              <option key={col} value={col}>{col}</option>
                            ))}
                          </select>
                          {mapping.required && !mapping.excelColumn && (
                            <p className="text-xs text-red-600 mt-1">Cột bắt buộc phải được ghép</p>
                          )}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {mapping.description}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-start space-x-2">
                  <Info size={16} className="text-blue-600 mt-0.5" />
                  <div className="text-sm text-blue-800">
                    <p className="font-medium mb-1">Lưu ý:</p>
                    <ul className="list-disc list-inside space-y-1">
                      <li>Các cột có dấu (*) là bắt buộc phải ghép</li>
                      <li>Click vào dropdown để chọn cột tương ứng trong file Excel</li>
                      <li>Hệ thống sẽ kiểm tra dữ liệu sau khi ghép xong</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Data Validation */}
          {currentStep === 3 && (
            <div className="p-6">
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Kiểm tra dữ liệu</h3>
                
                {/* Summary */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center space-x-2">
                      <CheckCircle size={20} className="text-green-600" />
                      <div>
                        <p className="text-sm text-green-600">Dòng hợp lệ</p>
                        <p className="text-2xl font-bold text-green-700">{validCount}</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex items-center space-x-2">
                      <AlertTriangle size={20} className="text-red-600" />
                      <div>
                        <p className="text-sm text-red-600">Dòng không hợp lệ</p>
                        <p className="text-2xl font-bold text-red-700">{invalidCount}</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-center space-x-2">
                      <Eye size={20} className="text-blue-600" />
                      <div>
                        <p className="text-sm text-blue-600">Đã chọn nhập</p>
                        <p className="text-2xl font-bold text-blue-700">{selectedRows.length}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => handleSelectRows('all')}
                      className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm"
                    >
                      Chọn tất cả
                    </button>
                    <button
                      onClick={() => handleSelectRows('valid')}
                      className="px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 text-sm"
                    >
                      Chọn dòng hợp lệ
                    </button>
                    <button
                      onClick={() => handleSelectRows('invalid')}
                      className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 text-sm"
                    >
                      Chọn dòng lỗi
                    </button>
                  </div>
                  
                  {invalidCount > 0 && (
                    <button
                      onClick={handleDownloadErrors}
                      className="flex items-center space-x-2 px-4 py-2 bg-orange-100 text-orange-700 rounded-lg hover:bg-orange-200 text-sm"
                    >
                      <Download size={16} />
                      <span>Tải file lỗi</span>
                    </button>
                  )}
                </div>

                {/* Filter Tabs */}
                <div className="flex space-x-1 mb-4">
                  {[
                    { key: 'all', label: 'Tất cả', count: validationResults.length },
                    { key: 'valid', label: 'Hợp lệ', count: validCount },
                    { key: 'invalid', label: 'Không hợp lệ', count: invalidCount }
                  ].map(tab => (
                    <button
                      key={tab.key}
                      onClick={() => setFilterType(tab.key as any)}
                      className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                        filterType === tab.key
                          ? 'bg-green-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {tab.label} ({tab.count})
                    </button>
                  ))}
                </div>
              </div>

              {/* Data Table */}
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <div className="overflow-x-auto max-h-96">
                  <table className="w-full">
                    <thead className="bg-gray-50 sticky top-0">
                      <tr>
                        <th className="px-4 py-3 text-left w-12">
                          <input
                            type="checkbox"
                            checked={selectedRows.length === getFilteredResults().length && getFilteredResults().length > 0}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedRows(getFilteredResults().map(r => r.rowIndex));
                              } else {
                                setSelectedRows([]);
                              }
                            }}
                            className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                          />
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Dòng</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Trạng thái</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Mã</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Tên Việt</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Tên Anh</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Ghi chú</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Chi tiết lỗi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {getFilteredResults().map((result) => (
                        <tr key={result.rowIndex} className="hover:bg-gray-50">
                          <td className="px-4 py-3">
                            <input
                              type="checkbox"
                              checked={selectedRows.includes(result.rowIndex)}
                              onChange={(e) => handleRowSelect(result.rowIndex, e.target.checked)}
                              className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                            />
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900">{result.rowIndex}</td>
                          <td className="px-4 py-3">
                            <div className="flex items-center space-x-2">
                              {result.isValid ? (
                                <>
                                  <CheckCircle size={16} className="text-green-500" />
                                  <span className="text-sm text-green-700">Hợp lệ</span>
                                </>
                              ) : (
                                <>
                                  <AlertTriangle size={16} className="text-red-500" />
                                  <span className="text-sm text-red-700">Lỗi</span>
                                </>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900">{result.data.code}</td>
                          <td className="px-4 py-3 text-sm text-gray-900">{result.data.nameVi}</td>
                          <td className="px-4 py-3 text-sm text-gray-900">{result.data.nameEn}</td>
                          <td className="px-4 py-3 text-sm text-gray-900">{result.data.notes}</td>
                          <td className="px-4 py-3">
                            {result.errors.length > 0 && (
                              <div className="text-sm text-red-600">
                                {result.errors.map((error, idx) => (
                                  <div key={idx} className="flex items-start space-x-1">
                                    <span>•</span>
                                    <span>{error}</span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {currentStep > 1 && (
                <button
                  onClick={handlePrevStep}
                  className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  <ArrowLeft size={16} />
                  <span>Quay lại</span>
                </button>
              )}
            </div>

            <div className="flex items-center space-x-3">
              <button
                onClick={handleClose}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Hủy
              </button>
              
              {currentStep < 3 ? (
                <button
                  onClick={handleNextStep}
                  disabled={
                    (currentStep === 1 && (!selectedFile || !selectedSheet)) ||
                    (currentStep === 2 && !validateMappings())
                  }
                  className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <span>Tiếp tục</span>
                  <ArrowRight size={16} />
                </button>
              ) : (
                <button
                  onClick={handleImport}
                  disabled={selectedRows.filter(r => validationResults.find(v => v.rowIndex === r)?.isValid).length === 0}
                  className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Play size={16} />
                  <span>Thực hiện ({selectedRows.filter(r => validationResults.find(v => v.rowIndex === r)?.isValid).length})</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}