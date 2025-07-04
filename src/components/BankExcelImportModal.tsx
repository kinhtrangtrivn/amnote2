import React, { useState, useRef } from 'react';
import { X, Upload, Download, FileText, AlertCircle, CheckCircle, Eye, Trash2 } from 'lucide-react';
import * as XLSX from 'xlsx';

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

interface BankExcelImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (banks: Bank[]) => void;
}

interface ImportError {
  row: number;
  field: string;
  message: string;
}

const bankCodes = ['VCB', 'TCB', 'BIDV', 'VTB', 'ACB', 'MB', 'SHB', 'VPB', 'TPB', 'MSB', 'OCB', 'SCB', 'HDBank', 'LPB', 'VIB'];
const provinces = [
  'Hà Nội', 'TP. Hồ Chí Minh', 'Đà Nẵng', 'Hải Phòng', 'Cần Thơ',
  'An Giang', 'Bà Rịa - Vũng Tàu', 'Bắc Giang', 'Bắc Kạn', 'Bạc Liêu',
  'Bắc Ninh', 'Bến Tre', 'Bình Định', 'Bình Dương', 'Bình Phước'
];
const currencies = ['VND', 'USD', 'EUR', 'JPY', 'CNY', 'KRW'];

export default function BankExcelImportModal({ isOpen, onClose, onImport }: BankExcelImportModalProps) {
  const [step, setStep] = useState<'upload' | 'preview' | 'success'>('upload');
  const [importedData, setImportedData] = useState<Bank[]>([]);
  const [errors, setErrors] = useState<ImportError[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const downloadTemplate = () => {
    const templateData = [
      {
        'Tên ngân hàng': 'Ngân hàng TMCP Ngoại thương Việt Nam',
        'Mã ngân hàng': 'VCB',
        'Tỉnh/Thành phố': 'Hà Nội',
        'Chi nhánh': 'Chi nhánh Hoàn Kiếm',
        'Số tài khoản': '0123456789012',
        'Tên tài khoản': 'CÔNG TY TNHH ABC TECHNOLOGY',
        'Loại tiền': 'VND'
      },
      {
        'Tên ngân hàng': 'Ngân hàng TMCP Kỹ thương Việt Nam',
        'Mã ngân hàng': 'TCB',
        'Tỉnh/Thành phố': 'TP. Hồ Chí Minh',
        'Chi nhánh': 'Chi nhánh Quận 1',
        'Số tài khoản': '9876543210987',
        'Tên tài khoản': 'CÔNG TY CỔ PHẦN XYZ TRADING',
        'Loại tiền': 'USD'
      }
    ];

    const ws = XLSX.utils.json_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Danh sách ngân hàng');
    
    // Set column widths
    ws['!cols'] = [
      { wch: 40 }, // Tên ngân hàng
      { wch: 15 }, // Mã ngân hàng
      { wch: 20 }, // Tỉnh/Thành phố
      { wch: 25 }, // Chi nhánh
      { wch: 20 }, // Số tài khoản
      { wch: 35 }, // Tên tài khoản
      { wch: 12 }  // Loại tiền
    ];

    XLSX.writeFile(wb, 'mau_danh_sach_ngan_hang.xlsx');
  };

  const validateRow = (row: any, index: number): ImportError[] => {
    const rowErrors: ImportError[] = [];

    // Required fields validation
    if (!row['Tên ngân hàng']?.toString().trim()) {
      rowErrors.push({
        row: index + 2,
        field: 'Tên ngân hàng',
        message: 'Tên ngân hàng là bắt buộc'
      });
    }

    if (!row['Mã ngân hàng']?.toString().trim()) {
      rowErrors.push({
        row: index + 2,
        field: 'Mã ngân hàng',
        message: 'Mã ngân hàng là bắt buộc'
      });
    } else if (!bankCodes.includes(row['Mã ngân hàng']?.toString().trim())) {
      rowErrors.push({
        row: index + 2,
        field: 'Mã ngân hàng',
        message: `Mã ngân hàng không hợp lệ. Chỉ chấp nhận: ${bankCodes.join(', ')}`
      });
    }

    if (!row['Tỉnh/Thành phố']?.toString().trim()) {
      rowErrors.push({
        row: index + 2,
        field: 'Tỉnh/Thành phố',
        message: 'Tỉnh/Thành phố là bắt buộc'
      });
    } else if (!provinces.includes(row['Tỉnh/Thành phố']?.toString().trim())) {
      rowErrors.push({
        row: index + 2,
        field: 'Tỉnh/Thành phố',
        message: 'Tỉnh/Thành phố không hợp lệ'
      });
    }

    if (!row['Chi nhánh']?.toString().trim()) {
      rowErrors.push({
        row: index + 2,
        field: 'Chi nhánh',
        message: 'Chi nhánh là bắt buộc'
      });
    }

    // Optional fields validation
    if (row['Loại tiền'] && !currencies.includes(row['Loại tiền']?.toString().trim())) {
      rowErrors.push({
        row: index + 2,
        field: 'Loại tiền',
        message: `Loại tiền không hợp lệ. Chỉ chấp nhận: ${currencies.join(', ')}`
      });
    }

    return rowErrors;
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    setErrors([]);

    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);

      if (jsonData.length === 0) {
        setErrors([{
          row: 0,
          field: 'File',
          message: 'File Excel không có dữ liệu'
        }]);
        setIsLoading(false);
        return;
      }

      const allErrors: ImportError[] = [];
      const validBanks: Bank[] = [];

      jsonData.forEach((row: any, index: number) => {
        const rowErrors = validateRow(row, index);
        allErrors.push(...rowErrors);

        if (rowErrors.length === 0) {
          validBanks.push({
            id: `import_${Date.now()}_${index}`,
            bankName: row['Tên ngân hàng']?.toString().trim(),
            bankCode: row['Mã ngân hàng']?.toString().trim(),
            province: row['Tỉnh/Thành phố']?.toString().trim(),
            branch: row['Chi nhánh']?.toString().trim(),
            accountNumber: row['Số tài khoản']?.toString().trim() || undefined,
            accountHolderName: row['Tên tài khoản']?.toString().trim() || undefined,
            currency: row['Loại tiền']?.toString().trim() || undefined
          });
        }
      });

      setErrors(allErrors);
      setImportedData(validBanks);
      setStep('preview');
    } catch (error) {
      setErrors([{
        row: 0,
        field: 'File',
        message: 'Không thể đọc file Excel. Vui lòng kiểm tra định dạng file.'
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleImport = () => {
    onImport(importedData);
    setStep('success');
    setTimeout(() => {
      handleClose();
    }, 2000);
  };

  const handleClose = () => {
    setStep('upload');
    setImportedData([]);
    setErrors([]);
    setIsLoading(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onClose();
  };

  const removeRow = (index: number) => {
    setImportedData(prev => prev.filter((_, i) => i !== index));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <Upload className="text-green-600" size={20} />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900">Nhập dữ liệu từ Excel</h3>
              <p className="text-sm text-gray-600">
                {step === 'upload' && 'Tải lên file Excel chứa danh sách ngân hàng'}
                {step === 'preview' && 'Xem trước và xác nhận dữ liệu nhập'}
                {step === 'success' && 'Nhập dữ liệu thành công'}
              </p>
            </div>
          </div>
          <button onClick={handleClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {step === 'upload' && (
            <div className="space-y-6">
              {/* Instructions */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <FileText className="text-blue-600 mt-0.5" size={20} />
                  <div>
                    <h4 className="font-medium text-blue-900 mb-2">Hướng dẫn nhập dữ liệu</h4>
                    <ul className="text-sm text-blue-800 space-y-1">
                      <li>• File Excel phải có các cột: Tên ngân hàng, Mã ngân hàng, Tỉnh/Thành phố, Chi nhánh</li>
                      <li>• Các cột tùy chọn: Số tài khoản, Tên tài khoản, Loại tiền</li>
                      <li>• Dòng đầu tiên phải là tiêu đề cột</li>
                      <li>• Mã ngân hàng phải thuộc danh sách: {bankCodes.join(', ')}</li>
                      <li>• Loại tiền phải thuộc danh sách: {currencies.join(', ')}</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Download Template */}
              <div className="text-center">
                <button
                  onClick={downloadTemplate}
                  className="flex items-center space-x-2 mx-auto px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  <Download size={16} />
                  <span>Tải xuống file mẫu</span>
                </button>
                <p className="text-sm text-gray-500 mt-2">
                  Tải xuống file Excel mẫu để tham khảo định dạng
                </p>
              </div>

              {/* File Upload */}
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={handleFileUpload}
                  className="hidden"
                  disabled={isLoading}
                />
                <div className="space-y-4">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
                    <Upload className="text-gray-400" size={24} />
                  </div>
                  <div>
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isLoading}
                      className="text-blue-600 hover:text-blue-700 font-medium disabled:opacity-50"
                    >
                      {isLoading ? 'Đang xử lý...' : 'Chọn file Excel'}
                    </button>
                    <p className="text-sm text-gray-500 mt-1">
                      Hoặc kéo thả file vào đây
                    </p>
                  </div>
                  <p className="text-xs text-gray-400">
                    Hỗ trợ file .xlsx, .xls (tối đa 10MB)
                  </p>
                </div>
              </div>

              {/* Errors */}
              {errors.length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <AlertCircle className="text-red-600 mt-0.5" size={20} />
                    <div className="flex-1">
                      <h4 className="font-medium text-red-900 mb-2">Có lỗi trong dữ liệu</h4>
                      <div className="max-h-32 overflow-y-auto">
                        {errors.map((error, index) => (
                          <p key={index} className="text-sm text-red-800">
                            Dòng {error.row}, cột "{error.field}": {error.message}
                          </p>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {step === 'preview' && (
            <div className="space-y-6">
              {/* Summary */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-green-600">{importedData.length}</div>
                  <div className="text-sm text-green-800">Bản ghi hợp lệ</div>
                </div>
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-red-600">{errors.length}</div>
                  <div className="text-sm text-red-800">Lỗi phát hiện</div>
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-blue-600">{importedData.length + errors.length}</div>
                  <div className="text-sm text-blue-800">Tổng số dòng</div>
                </div>
              </div>

              {/* Errors List */}
              {errors.length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <h4 className="font-medium text-red-900 mb-3 flex items-center">
                    <AlertCircle size={16} className="mr-2" />
                    Danh sách lỗi ({errors.length})
                  </h4>
                  <div className="max-h-32 overflow-y-auto space-y-1">
                    {errors.map((error, index) => (
                      <p key={index} className="text-sm text-red-800">
                        <strong>Dòng {error.row}:</strong> {error.field} - {error.message}
                      </p>
                    ))}
                  </div>
                </div>
              )}

              {/* Preview Table */}
              {importedData.length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                    <Eye size={16} className="mr-2" />
                    Xem trước dữ liệu hợp lệ ({importedData.length} bản ghi)
                  </h4>
                  <div className="border border-gray-200 rounded-lg overflow-hidden">
                    <div className="max-h-96 overflow-y-auto">
                      <table className="w-full">
                        <thead className="bg-gray-50 sticky top-0">
                          <tr>
                            <th className="text-left py-3 px-4 font-medium text-gray-700 text-sm">Tên ngân hàng</th>
                            <th className="text-left py-3 px-4 font-medium text-gray-700 text-sm">Mã</th>
                            <th className="text-left py-3 px-4 font-medium text-gray-700 text-sm">Tỉnh/Chi nhánh</th>
                            <th className="text-left py-3 px-4 font-medium text-gray-700 text-sm">Số TK</th>
                            <th className="text-left py-3 px-4 font-medium text-gray-700 text-sm">Tên TK</th>
                            <th className="text-left py-3 px-4 font-medium text-gray-700 text-sm">Loại tiền</th>
                            <th className="text-center py-3 px-4 font-medium text-gray-700 text-sm">Thao tác</th>
                          </tr>
                        </thead>
                        <tbody>
                          {importedData.map((bank, index) => (
                            <tr key={bank.id} className="border-t border-gray-200 hover:bg-gray-50">
                              <td className="py-3 px-4 text-sm">{bank.bankName}</td>
                              <td className="py-3 px-4 text-sm">
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                  {bank.bankCode}
                                </span>
                              </td>
                              <td className="py-3 px-4 text-sm">
                                <div>{bank.province}</div>
                                <div className="text-xs text-gray-500">{bank.branch}</div>
                              </td>
                              <td className="py-3 px-4 text-sm font-mono">{bank.accountNumber || '-'}</td>
                              <td className="py-3 px-4 text-sm">{bank.accountHolderName || '-'}</td>
                              <td className="py-3 px-4 text-sm">
                                {bank.currency ? (
                                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                    {bank.currency}
                                  </span>
                                ) : '-'}
                              </td>
                              <td className="py-3 px-4 text-center">
                                <button
                                  onClick={() => removeRow(index)}
                                  className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                                  title="Xóa"
                                >
                                  <Trash2 size={14} />
                                </button>
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
          )}

          {step === 'success' && (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="text-green-600" size={32} />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Nhập dữ liệu thành công!</h3>
              <p className="text-gray-600">
                Đã nhập thành công {importedData.length} ngân hàng vào hệ thống.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={handleClose}
            className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            {step === 'success' ? 'Đóng' : 'Hủy'}
          </button>

          <div className="flex items-center space-x-3">
            {step === 'preview' && (
              <>
                <button
                  onClick={() => setStep('upload')}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Quay lại
                </button>
                <button
                  onClick={handleImport}
                  disabled={importedData.length === 0}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Nhập {importedData.length} bản ghi
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}