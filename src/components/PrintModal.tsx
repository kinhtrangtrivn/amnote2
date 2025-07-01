import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
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
  { code: 'en', name: 'English',   flag: '🇺🇸' },
  { code: 'ko', name: '한국어',       flag: '🇰🇷' }
];

const translations = {
  vi: {
    title: 'Đối tượng tập hợp chi phí',
    printDate: 'Ngày in',
    columns: {
      code:   'Mã đối tượng',
      nameVi: 'Đối tượng tập hợp chi phí (Tiếng Việt)',
      nameEn: 'Đối tượng tập hợp chi phí (Tiếng Anh)',
      nameKo: 'Đối tượng tập hợp chi phí (Tiếng Hàn)',
      notes:  'Ghi chú'
    },
    footer: {
      preparedBy: 'Người lập biểu',
      accountant: 'Kế toán trưởng',
      director:   'Giám đốc',
      signature:  '(Ký họ tên)'
    }
  },
  en: {
    title: 'Cost Center Objects',
    printDate: 'Print Date',
    columns: {
      code:   'Object Code',
      nameVi: 'Cost Center Object (Vietnamese)',
      nameEn: 'Cost Center Object (English)',
      nameKo: 'Cost Center Object (Korean)',
      notes:  'Notes'
    },
    footer: {
      preparedBy: 'Prepared by',
      accountant: 'Chief Accountant',
      director:   'Director',
      signature:  '(Signature)'
    }
  },
  ko: {
    title: '비용집계 대상',
    printDate: '인쇄 날짜',
    columns: {
      code:   '대상 코드',
      nameVi: '비용집계 대상 (베트남어)',
      nameEn: '비용집계 대상 (영어)',
      nameKo: '비용집계 대상 (한국어)',
      notes:  '비고'
    },
    footer: {
      preparedBy: '작성자',
      accountant: '회계 책임자',
      director:   '이사',
      signature:  '(서명)'
    }
  }
};

export default function PrintModal({ isOpen, onClose, data, companyInfo }: PrintModalProps) {
  const [selectedLanguage, setSelectedLanguage] = useState<PrintLanguage>(languages[0]);
  const [isPreviewMode, setIsPreviewMode]     = useState(false);

  // Nếu modal đang đóng, không render gì
  if (!isOpen) return null;

  // Reset về chế độ bình thường sau khi in xong
  useEffect(() => {
    const handleAfterPrint = () => setIsPreviewMode(false);
    window.addEventListener('afterprint', handleAfterPrint);
    return () => window.removeEventListener('afterprint', handleAfterPrint);
  }, []);

  // Thông tin công ty mặc định
  const defaultCompanyInfo = {
    name:    'Công ty TNHH ABC Technology',
    address: '123 Đường ABC, Quận Ba Đình, Hà Nội',
    taxCode: '0123456789'
  };
  const company = companyInfo || defaultCompanyInfo;
  const t       = translations[selectedLanguage.code];

  // Định dạng ngày 2-digit ngày/tháng/năm
  const currentDate = new Date().toLocaleDateString(
    selectedLanguage.code === 'vi' ? 'vi-VN' :
    selectedLanguage.code === 'en' ? 'en-US' :
    'ko-KR',
    { day: '2-digit', month: '2-digit', year: 'numeric' }
  );

  const handlePrint = () => {
    setIsPreviewMode(true);
    // Đảm bảo state có thời gian update
    setTimeout(() => window.print(), 100);
  };

  const handleDownloadPDF = () => {
    alert(`Đang tải xuống PDF bằng ${selectedLanguage.name}.`);
  };

  // Phần nội dung thực sự để in
  const PrintContent = () => (
    <div className="print-content bg-white">
      {/* Header in */}
      <div className="text-center mb-8 border-b-2 border-gray-300 pb-6">
        <h1 className="text-xl font-bold mb-1">{company.name}</h1>
        <p className="text-sm mb-1">{company.address}</p>
        <p className="text-sm">MST: {company.taxCode}</p>
      </div>

      {/* Tiêu đề và ngày */}
      <div className="text-center mb-6">
        <h2 className="text-lg font-bold uppercase mb-1">{t.title}</h2>
        <p className="text-sm">{t.printDate}: {currentDate}</p>
      </div>

      {/* Bảng dữ liệu */}
      <div className="mb-12">
        <table className="w-full table-fixed border-collapse border border-gray-400">
          <thead className="bg-gray-100">
            <tr>
              <th className="w-1/12 border px-2 py-1">{t.columns.code}</th>
              <th className="w-3/12 border px-2 py-1">{t.columns.nameVi}</th>
              <th className="w-3/12 border px-2 py-1">{t.columns.nameEn}</th>
              <th className="w-3/12 border px-2 py-1">{t.columns.nameKo}</th>
              <th className="w-2/12 border px-2 py-1">{t.columns.notes}</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item, idx) => (
              <tr key={item.id ?? idx} className="avoid-break">
                <td className="border px-2 py-1 text-sm">{item.code}</td>
                <td className="border px-2 py-1 text-sm">{item.nameVi}</td>
                <td className="border px-2 py-1 text-sm">{item.nameEn}</td>
                <td className="border px-2 py-1 text-sm">{item.nameKo}</td>
                <td className="border px-2 py-1 text-sm">{item.notes}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Chữ ký */}
      <div className="grid grid-cols-3 gap-8 mt-16 text-center">
        {[t.footer.preparedBy, t.footer.accountant, t.footer.director].map((role, i) => (
          <div key={i}>
            <p className="font-semibold text-sm mb-1">{role}</p>
            <p className="text-xs mb-8">{t.footer.signature}</p>
            <div className="border-b border-gray-400 w-32 mx-auto"></div>
          </div>
        ))}
      </div>
    </div>
  );

  // Khi ở chế độ preview, render riêng ra portal để in
  if (isPreviewMode) {
    return createPortal(
      <div className="fixed inset-0 bg-white z-50 overflow-auto">
        <div className="max-w-4xl mx-auto p-8">
          <div className="flex justify-between mb-6 print:hidden">
            <h3 className="text-lg font-semibold">Xem trước bản in</h3>
            <div className="flex space-x-2">
              <button
                onClick={handlePrint}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                <Printer size={16} className="mr-1" /> In
              </button>
              <button
                onClick={() => setIsPreviewMode(false)}
                className="flex items-center px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
              >
                <X size={16} className="mr-1" /> Đóng
              </button>
            </div>
          </div>
          <div className="shadow-lg">
            <PrintContent />
          </div>
        </div>
      </div>,
      document.body
    );
  }

  // Giao diện chọn ngôn ngữ / in ban đầu
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header modal */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center space-x-3">
            <Printer size={24} className="text-blue-600" />
            <div>
              <h3 className="text-xl font-semibold">In báo cáo</h3>
              <p className="text-sm text-gray-600">Chọn ngôn ngữ và định dạng</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded">
            <X size={20} />
          </button>
        </div>

        {/* Body modal */}
        <div className="p-6 space-y-6">
          {/* Chọn ngôn ngữ */}
          <div>
            <label className="block text-sm font-medium mb-2">Chọn ngôn ngữ in</label>
            <div className="grid grid-cols-1 gap-3">
              {languages.map(lang => (
                <button
                  key={lang.code}
                  onClick={() => setSelectedLanguage(lang)}
                  className={`flex items-center space-x-3 p-4 border rounded transition ${
                    selectedLanguage.code === lang.code
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <span className="text-2xl">{lang.flag}</span>
                  <div className="flex-1 text-left">
                    <p className="font-medium">{lang.name}</p>
                    <p className="text-sm text-gray-500">
                      {lang.code === 'vi' ? 'Báo cáo bằng tiếng Việt' :
                       lang.code === 'en' ? 'Report in English' :
                       '한국어 보고서'}
                    </p>
                  </div>
                  {selectedLanguage.code === lang.code && (
                    <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Tùy chọn in */}
          <div>
            <label className="block text-sm font-medium mb-2">Tùy chọn in</label>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                <div className="flex items-center space-x-3">
                  <FileText size={20} /><div><p>Định dạng</p><p className="text-sm">A4, Portrait</p></div>
                </div>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                <div className="flex items-center space-x-3">
                  <Calendar size={20} /><div><p>Ngày in</p><p className="text-sm">{currentDate}</p></div>
                </div>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                <div className="flex items-center space-x-3">
                  <Building2 size={20} /><div><p>Công ty</p><p className="text-sm">{company.name}</p></div>
                </div>
              </div>
            </div>
          </div>

          {/* Thông tin nhanh */}
          <div className="bg-blue-50 border border-blue-200 rounded p-4">
            <div className="flex items-center mb-2"><FileText size={16} /><span className="ml-2 font-medium">Thông tin báo cáo</span></div>
            <p className="text-sm">Số bản ghi: {data.length}</p>
            <p className="text-sm">Ngôn ngữ: {selectedLanguage.name}</p>
            <p className="text-sm">Tiêu đề: {t.title}</p>
          </div>
        </div>

        {/* Footer modal */}
        <div className="flex justify-end p-6 border-t bg-gray-50 space-x-3">
          <button onClick={onClose} className="px-4 py-2 border rounded">Hủy</button>
          <button onClick={() => setIsPreviewMode(true)} className="px-4 py-2 bg-gray-600 text-white rounded">Xem trước</button>
          <button onClick={handleDownloadPDF}      className="px-4 py-2 bg-green-600 text-white rounded">Tải PDF</button>
          <button onClick={handlePrint}            className="px-4 py-2 bg-blue-600 text-white rounded">In ngay</button>
        </div>
      </div>

      {/* Style cho print toàn cục */}
      <style jsx global>{`
        @page { size: A4 portrait; margin: 20mm; }
        @media print {
          body { margin:0; padding:0; }
          .print\\:hidden { display: none !important; }
          .print-content { font-size:12px; line-height:1.4; color:#000; }
          .print-content table, .print-content tbody, .print-content tr, .print-content td {
            page-break-inside: avoid;
          }
          .print-content thead { display: table-header-group; }
        }
      `}</style>
    </div>
  );
}
