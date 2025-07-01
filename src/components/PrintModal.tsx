import React, { useState } from 'react';
import { X, Printer, FileText, Download, Calendar, Building2 } from 'lucide-react';

interface PrintModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: any[];
  companyInfo?: {
    name: string;
    address: string;
    taxCode: string;
  };
}

interface PrintLanguage {
  code: 'vi' | 'en' | 'ko';
  name: string;
  flag: string;
}

const languages: PrintLanguage[] = [
  { code: 'vi', name: 'Tiếng Việt', flag: '🇻🇳' },
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'ko', name: '한국어', flag: '🇰🇷' }
];

const translations = {
  vi: {
    title: 'Đối tượng tập hợp chi phí',
    printDate: 'Ngày in',
    columns: {
      code: 'Mã đối tượng',
      nameVi: 'Đối tượng tập hợp chi phí (Tiếng Việt)',
      nameEn: 'Đối tượng tập hợp chi phí (Tiếng Anh)',
      nameKo: 'Đối tượng tập hợp chi phí (Tiếng Hàn)',
      notes: 'Ghi chú'
    },
    footer: {
      preparedBy: 'Người lập biểu',
      accountant: 'Kế toán trưởng',
      director: 'Giám đốc',
      signature: '(Ký họ tên)'
    }
  },
  en: {
    title: 'Cost Center Objects',
    printDate: 'Print Date',
    columns: {
      code: 'Object Code',
      nameVi: 'Cost Center Object (Vietnamese)',
      nameEn: 'Cost Center Object (English)',
      nameKo: 'Cost Center Object (Korean)',
      notes: 'Notes'
    },
    footer: {
      preparedBy: 'Prepared by',
      accountant: 'Chief Accountant',
      director: 'Director',
      signature: '(Signature)'
    }
  },
  ko: {
    title: '비용집계 대상',
    printDate: '인쇄 날짜',
    columns: {
      code: '대상 코드',
      nameVi: '비용집계 대상 (베트남어)',
      nameEn: '비용집계 대상 (영어)',
      nameKo: '비용집계 대상 (한국어)',
      notes: '비고'
    },
    footer: {
      preparedBy: '작성자',
      accountant: '회계 책임자',
      director: '이사',
      signature: '(서명)'
    }
  }
};

export default function PrintModal({ isOpen, onClose, data, companyInfo }: PrintModalProps) {
  const [selectedLanguage, setSelectedLanguage] = useState<PrintLanguage>(languages[0]);
  const [isPreviewMode, setIsPreviewMode] = useState(false);

  if (!isOpen) return null;

  const defaultCompanyInfo = {
    name: 'Công ty TNHH ABC Technology',
    address: '123 Đường ABC, Quận Ba Đình, Hà Nội',
    taxCode: '0123456789'
  };

  const company = companyInfo || defaultCompanyInfo;
  const t = translations[selectedLanguage.code];
  const currentDate = new Date().toLocaleDateString(
    selectedLanguage.code === 'vi' ? 'vi-VN' : 
    selectedLanguage.code === 'en' ? 'en-US' : 'ko-KR'
  );

  const handlePrint = () => {
    setIsPreviewMode(true);
    setTimeout(() => {
      window.print();
    }, 100);
  };

  const handleDownloadPDF = () => {
    // In a real application, you would use a library like jsPDF or html2pdf
    alert(`Đang tải xuống PDF bằng ${selectedLanguage.name}...`);
  };

  const PrintContent = () => (
    <div className="print-content bg-white">
      {/* Header */}
      <div className="text-center mb-8 border-b-2 border-gray-300 pb-6">
        <h1 className="text-xl font-bold text-gray-900 mb-2">{company.name}</h1>
        <p className="text-sm text-gray-700 mb-1">{company.address}</p>
        <p className="text-sm text-gray-700">MST: {company.taxCode}</p>
      </div>

      {/* Title */}
      <div className="text-center mb-6">
        <h2 className="text-lg font-bold text-gray-900 uppercase mb-2">{t.title}</h2>
        <p className="text-sm text-gray-600">{t.printDate}: {currentDate}</p>
      </div>

      {/* Table */}
      <div className="mb-12">
        <table className="w-full border-collapse border border-gray-400">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-gray-400 px-3 py-2 text-left text-sm font-semibold">
                {t.columns.code}
              </th>
              <th className="border border-gray-400 px-3 py-2 text-left text-sm font-semibold">
                {t.columns.nameVi}
              </th>
              <th className="border border-gray-400 px-3 py-2 text-left text-sm font-semibold">
                {t.columns.nameEn}
              </th>
              <th className="border border-gray-400 px-3 py-2 text-left text-sm font-semibold">
                {t.columns.nameKo}
              </th>
              <th className="border border-gray-400 px-3 py-2 text-left text-sm font-semibold">
                {t.columns.notes}
              </th>
            </tr>
          </thead>
          <tbody>
            {data.map((item, index) => (
              <tr key={item.id || index}>
                <td className="border border-gray-400 px-3 py-2 text-sm">{item.code}</td>
                <td className="border border-gray-400 px-3 py-2 text-sm">{item.nameVi}</td>
                <td className="border border-gray-400 px-3 py-2 text-sm">{item.nameEn}</td>
                <td className="border border-gray-400 px-3 py-2 text-sm">{item.nameKo}</td>
                <td className="border border-gray-400 px-3 py-2 text-sm">{item.notes}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="grid grid-cols-3 gap-8 mt-16">
        <div className="text-center">
          <p className="font-semibold text-sm mb-1">{t.footer.preparedBy}</p>
          <p className="text-xs text-gray-600 mb-12">{t.footer.signature}</p>
          <div className="border-b border-gray-400 w-32 mx-auto"></div>
        </div>
        <div className="text-center">
          <p className="font-semibold text-sm mb-1">{t.footer.accountant}</p>
          <p className="text-xs text-gray-600 mb-12">{t.footer.signature}</p>
          <div className="border-b border-gray-400 w-32 mx-auto"></div>
        </div>
        <div className="text-center">
          <p className="font-semibold text-sm mb-1">{t.footer.director}</p>
          <p className="text-xs text-gray-600 mb-12">{t.footer.signature}</p>
          <div className="border-b border-gray-400 w-32 mx-auto"></div>
        </div>
      </div>
    </div>
  );

  if (isPreviewMode) {
    return (
      <div className="fixed inset-0 bg-white z-50 overflow-auto">
        <div className="max-w-4xl mx-auto p-8">
          <div className="flex items-center justify-between mb-6 no-print">
            <h3 className="text-lg font-semibold">Xem trước bản in</h3>
            <div className="flex items-center space-x-3">
              <button
                onClick={handlePrint}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Printer size={16} />
                <span>In</span>
              </button>
              <button
                onClick={() => setIsPreviewMode(false)}
                className="flex items-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
              >
                <X size={16} />
                <span>Đóng</span>
              </button>
            </div>
          </div>
          <div className="bg-white shadow-lg">
            <PrintContent />
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Modal Overlay */}
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Printer className="text-blue-600" size={20} />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900">In báo cáo</h3>
                <p className="text-sm text-gray-600">Chọn ngôn ngữ và định dạng in</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X size={20} className="text-gray-500" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Language Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Chọn ngôn ngữ in
              </label>
              <div className="grid grid-cols-1 gap-3">
                {languages.map((language) => (
                  <button
                    key={language.code}
                    onClick={() => setSelectedLanguage(language)}
                    className={`flex items-center space-x-3 p-4 border-2 rounded-lg transition-all ${
                      selectedLanguage.code === language.code
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <span className="text-2xl">{language.flag}</span>
                    <div className="flex-1 text-left">
                      <div className="font-medium text-gray-900">{language.name}</div>
                      <div className="text-sm text-gray-500">
                        {language.code === 'vi' && 'Báo cáo bằng tiếng Việt'}
                        {language.code === 'en' && 'Report in English'}
                        {language.code === 'ko' && '한국어 보고서'}
                      </div>
                    </div>
                    {selectedLanguage.code === language.code && (
                      <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Print Options */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Tùy chọn in
              </label>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <FileText size={20} className="text-gray-600" />
                    <div>
                      <div className="font-medium text-gray-900">Định dạng</div>
                      <div className="text-sm text-gray-600">A4, Portrait</div>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Calendar size={20} className="text-gray-600" />
                    <div>
                      <div className="font-medium text-gray-900">Ngày in</div>
                      <div className="text-sm text-gray-600">{currentDate}</div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Building2 size={20} className="text-gray-600" />
                    <div>
                      <div className="font-medium text-gray-900">Công ty</div>
                      <div className="text-sm text-gray-600">{company.name}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Data Summary */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <FileText size={16} className="text-blue-600" />
                <span className="font-medium text-blue-900">Thông tin báo cáo</span>
              </div>
              <div className="text-sm text-blue-800">
                <p>Số lượng bản ghi: <strong>{data.length}</strong></p>
                <p>Ngôn ngữ: <strong>{selectedLanguage.name}</strong></p>
                <p>Tiêu đề: <strong>{t.title}</strong></p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Hủy
            </button>
            
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setIsPreviewMode(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                <FileText size={16} />
                <span>Xem trước</span>
              </button>
              
              <button
                onClick={handleDownloadPDF}
                className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Download size={16} />
                <span>Tải PDF</span>
              </button>
              
              <button
                onClick={handlePrint}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Printer size={16} />
                <span>In ngay</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Print Styles */}
      <style jsx global>{`
        @media print {
          .no-print {
            display: none !important;
          }
          
          .print-content {
            font-size: 12px;
            line-height: 1.4;
            color: black;
          }
          
          .print-content table {
            page-break-inside: avoid;
          }
          
          .print-content thead {
            display: table-header-group;
          }
          
          .print-content tr {
            page-break-inside: avoid;
          }
          
          body {
            margin: 0;
            padding: 20px;
          }
          
          * {
            -webkit-print-color-adjust: exact !important;
            color-adjust: exact !important;
          }
        }
      `}</style>
    </>
  );
}