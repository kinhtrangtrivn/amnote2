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
  { code: 'ko', name: '한국어',     flag: '🇰🇷' }
];

const translations = {
  vi: {
    title: 'Đối tượng tập hợp chi phí',
    printDate: 'Ngày in',
    columns: {
      code:   'Mã đối tượng',
      nameVi: 'Đối tượng (Tiếng Việt)',
      nameEn: 'Đối tượng (Tiếng Anh)',
      nameKo: 'Đối tượng (Tiếng Hàn)',
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
      nameVi: 'Cost Center (Vietnamese)',
      nameEn: 'Cost Center (English)',
      nameKo: 'Cost Center (Korean)',
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
      nameVi: '비용집계 (베트남어)',
      nameEn: '비용집계 (영어)',
      nameKo: '비용집계 (한국어)',
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
  // ─────────── Các hook luôn được gọi trước mọi return ───────────
  const [selectedLanguage, setSelectedLanguage] = useState<PrintLanguage>(languages[0]);
  const [isPreviewMode, setIsPreviewMode]         = useState(false);

  useEffect(() => {
    const handleAfterPrint = () => setIsPreviewMode(false);
    window.addEventListener('afterprint', handleAfterPrint);
    return () => {
      window.removeEventListener('afterprint', handleAfterPrint);
    };
  }, []);
  // ────────────────────────────────────────────────────────────────

  // Nếu modal chưa mở thì thôi (preview mode vẫn dùng isOpen = true để giữ portal)
  if (!isOpen) return null;

  // Thông tin công ty mặc định
  const defaultCompanyInfo = {
    name:    'Công ty TNHH ABC Technology',
    address: '123 Đường ABC, Quận Ba Đình, Hà Nội',
    taxCode: '0123456789'
  };
  const company = companyInfo || defaultCompanyInfo;
  const t       = translations[selectedLanguage.code];

  // Định dạng ngày 2 chữ số
  const currentDate = new Date().toLocaleDateString(
    selectedLanguage.code === 'vi' ? 'vi-VN' :
    selectedLanguage.code === 'en' ? 'en-US' :
    'ko-KR',
    { day: '2-digit', month: '2-digit', year: 'numeric' }
  );

  const handlePrint = () => {
    setIsPreviewMode(true);
    setTimeout(() => window.print(), 100);
  };

  const handleDownloadPDF = () => {
    alert(`Đang tải xuống PDF bằng ${selectedLanguage.name}.`);
  };

  // Phần nội dung in
  const PrintContent = () => (
    <div className="print-content bg-white text-black">
      {/* Header */}
      <div className="text-center mb-6 border-b pb-4">
        <h1 className="text-xl font-bold">{company.name}</h1>
        <p className="text-sm">{company.address}</p>
        <p className="text-sm">MST: {company.taxCode}</p>
      </div>
      {/* Tiêu đề & ngày */}
      <div className="text-center mb-6">
        <h2 className="text-lg font-semibold uppercase">{t.title}</h2>
        <p className="text-sm">{t.printDate}: {currentDate}</p>
      </div>
      {/* Bảng */}
      <table className="w-full table-fixed border-collapse border border-gray-400 text-sm mb-8">
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
              <td className="border px-2 py-1">{item.code}</td>
              <td className="border px-2 py-1">{item.nameVi}</td>
              <td className="border px-2 py-1">{item.nameEn}</td>
              <td className="border px-2 py-1">{item.nameKo}</td>
              <td className="border px-2 py-1">{item.notes}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {/* Chữ ký */}
      <div className="grid grid-cols-3 text-center gap-8">
        {[t.footer.preparedBy, t.footer.accountant, t.footer.director].map((role, i) => (
          <div key={i}>
            <p className="font-semibold">{role}</p>
            <p className="text-xs mb-4">{t.footer.signature}</p>
            <div className="border-b border-gray-400 w-32 mx-auto"></div>
          </div>
        ))}
      </div>
    </div>
  );

  // Khi preview/onPrint
  if (isPreviewMode) {
    return createPortal(
      <div className="fixed inset-0 bg-white z-50 overflow-auto">
        <div className="max-w-4xl mx-auto p-8">
          <div className="flex justify-between mb-6 print:hidden">
            <h3 className="text-lg font-medium">Xem trước bản in</h3>
            <div className="flex space-x-2">
              <button onClick={handlePrint} className="flex items-center px-4 py-2 bg-blue-600 text-white rounded">
                <Printer size={16} className="mr-1" /> In
              </button>
              <button onClick={() => setIsPreviewMode(false)} className="flex items-center px-4 py-2 bg-gray-600 text-white rounded">
                <X size={16} className="mr-1" /> Đóng
              </button>
            </div>
          </div>
          <PrintContent />
        </div>
      </div>,
      document.body
    );
  }

  // Giao diện modal khi chưa preview
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* header */}
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
        {/* body */}
        <div className="p-6 space-y-6">
          {/* chọn ngôn ngữ */}
          {/* … (giữ nguyên phần này như trước) … */}
        </div>
        {/* footer */}
        <div className="flex justify-end p-6 border-t bg-gray-50 space-x-3">
          <button onClick={onClose} className="px-4 py-2 border rounded">Hủy</button>
          <button onClick={() => setIsPreviewMode(true)} className="px-4 py-2 bg-gray-600 text-white rounded">Xem trước</button>
          <button onClick={handleDownloadPDF} className="px-4 py-2 bg-green-600 text-white rounded">Tải PDF</button>
          <button onClick={handlePrint} className="px-4 py-2 bg-blue-600 text-white rounded">In ngay</button>
        </div>
      </div>
      {/* Global print styles */}
      <style>{`
        @page { size: A4 portrait; margin: 20mm; }
        @media print {
          body { margin: 0; padding: 0; }
          .print\\:hidden { display: none !important; }
          .print-content table,
          .print-content tbody,
          .print-content tr,
          .print-content td { page-break-inside: avoid; }
          .print-content thead { display: table-header-group; }
        }
      `}</style>
    </div>
  );
}
