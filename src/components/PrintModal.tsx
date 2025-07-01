import React, { useState } from 'react';
import { X, Printer, FileText, Download, Calendar, Building2, ZoomIn, ZoomOut } from 'lucide-react';

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
    title: 'DANH SÁCH ĐỐI TƯỢNG TẬP HỢP CHI PHÍ',
    printDate: 'Ngày in',
    columns: {
      stt: 'STT',
      code: 'Mã đối tượng',
      nameVi: 'Tên đối tượng (Tiếng Việt)',
      nameEn: 'Tên đối tượng (Tiếng Anh)',
      nameKo: 'Tên đối tượng (Tiếng Hàn)',
      notes: 'Ghi chú'
    },
    footer: {
      preparedBy: 'Người lập biểu',
      accountant: 'Kế toán trưởng',
      director: 'Giám đốc',
      signature: '(Ký họ tên)',
      date: 'Ngày ... tháng ... năm ...'
    },
    summary: 'Tổng cộng có {count} đối tượng tập hợp chi phí'
  },
  en: {
    title: 'COST CENTER OBJECTS LIST',
    printDate: 'Print Date',
    columns: {
      stt: 'No.',
      code: 'Object Code',
      nameVi: 'Object Name (Vietnamese)',
      nameEn: 'Object Name (English)',
      nameKo: 'Object Name (Korean)',
      notes: 'Notes'
    },
    footer: {
      preparedBy: 'Prepared by',
      accountant: 'Chief Accountant',
      director: 'Director',
      signature: '(Signature)',
      date: 'Date ... Month ... Year ...'
    },
    summary: 'Total: {count} cost center objects'
  },
  ko: {
    title: '비용집계 대상 목록',
    printDate: '인쇄 날짜',
    columns: {
      stt: '번호',
      code: '대상 코드',
      nameVi: '대상명 (베트남어)',
      nameEn: '대상명 (영어)',
      nameKo: '대상명 (한국어)',
      notes: '비고'
    },
    footer: {
      preparedBy: '작성자',
      accountant: '회계 책임자',
      director: '이사',
      signature: '(서명)',
      date: '날짜 ... 월 ... 년 ...'
    },
    summary: '총 {count}개의 비용집계 대상'
  }
};

export default function PrintModal({ isOpen, onClose, data, companyInfo }: PrintModalProps) {
  const [selectedLanguage, setSelectedLanguage] = useState<PrintLanguage>(languages[0]);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(100);

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
    const printElement = document.getElementById('print-content');
    if (!printElement) {
      console.error('Không tìm thấy #print-content');
      return;
    }
  
    // Tạo iframe ẩn
    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    document.body.appendChild(iframe);
  
    const doc = iframe.contentWindow?.document;
    if (!doc) return;
  
    // Lấy tất cả style hiện tại
    const styles = Array.from(document.querySelectorAll('style, link[rel="stylesheet"]'))
      .map(node => node.outerHTML)
      .join('');
  
    // Viết HTML vào iframe
    doc.open();
    doc.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Print</title>
          ${styles}
          <style>
            @page { size: A4 portrait; margin: 15mm; }
            body { margin: 0; padding: 0; }
          </style>
        </head>
        <body>
          ${printElement.innerHTML}
        </body>
      </html>
    `);
    doc.close();
  
    // Đợi nội dung load rồi in
    iframe.onload = () => {
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();
      // Dọn dẹp iframe sau khi in
      setTimeout(() => document.body.removeChild(iframe), 1000);
    };
  };


  const handleDownloadPDF = () => {
    alert(`Đang tải xuống PDF bằng ${selectedLanguage.name}...`);
  };

  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 10, 150));
  };

  const handleZoomOut = () => {
    setZoomLevel(prev => Math.max(prev - 10, 50));
  };

  const PrintContent = () => (
    <div id="print-content" className="print-content bg-white">
      {/* Header - Company Info */}
      <div className="print-header text-center mb-8 pb-4 border-b-2 border-gray-800">
        <h1 className="text-lg font-bold text-gray-900 mb-2 uppercase tracking-wide">
          {company.name}
        </h1>
        <p className="text-sm text-gray-700 mb-1">
          <strong>Địa chỉ:</strong> {company.address}
        </p>
        <p className="text-sm text-gray-700">
          <strong>Mã số thuế:</strong> {company.taxCode}
        </p>
      </div>

      {/* Title */}
      <div className="print-title text-center mb-6">
        <h2 className="text-base font-bold text-gray-900 uppercase mb-3 tracking-wider">
          {t.title}
        </h2>
        <div className="flex justify-between items-center text-sm text-gray-700">
          <span>{t.printDate}: {currentDate}</span>
          <span>Trang: 1</span>
        </div>
      </div>

      {/* Table */}
      <div className="print-table mb-8">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className="print-th border-2 border-gray-800 px-2 py-2 text-center text-xs font-bold bg-gray-100 w-12">
                {t.columns.stt}
              </th>
              <th className="print-th border-2 border-gray-800 px-2 py-2 text-center text-xs font-bold bg-gray-100 w-24">
                {t.columns.code}
              </th>
              <th className="print-th border-2 border-gray-800 px-2 py-2 text-center text-xs font-bold bg-gray-100">
                {t.columns.nameVi}
              </th>
              <th className="print-th border-2 border-gray-800 px-2 py-2 text-center text-xs font-bold bg-gray-100">
                {t.columns.nameEn}
              </th>
              <th className="print-th border-2 border-gray-800 px-2 py-2 text-center text-xs font-bold bg-gray-100">
                {t.columns.nameKo}
              </th>
              <th className="print-th border-2 border-gray-800 px-2 py-2 text-center text-xs font-bold bg-gray-100">
                {t.columns.notes}
              </th>
            </tr>
          </thead>
          <tbody>
            {data.map((item, index) => (
              <tr key={item.id || index} className="print-row">
                <td className="print-td border border-gray-600 px-2 py-1.5 text-center text-xs">
                  {index + 1}
                </td>
                <td className="print-td border border-gray-600 px-2 py-1.5 text-xs font-medium">
                  {item.code}
                </td>
                <td className="print-td border border-gray-600 px-2 py-1.5 text-xs">
                  {item.nameVi}
                </td>
                <td className="print-td border border-gray-600 px-2 py-1.5 text-xs">
                  {item.nameEn || '-'}
                </td>
                <td className="print-td border border-gray-600 px-2 py-1.5 text-xs">
                  {item.nameKo || '-'}
                </td>
                <td className="print-td border border-gray-600 px-2 py-1.5 text-xs">
                  {item.notes || '-'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Summary */}
      <div className="print-summary mb-8">
        <p className="text-sm font-medium text-gray-900">
          {t.summary.replace('{count}', data.length.toString())}
        </p>
      </div>

      {/* Footer - Signatures */}
      <div className="print-footer">
        <div className="grid grid-cols-3 gap-8 mt-12">
          <div className="text-center">
            <p className="font-bold text-sm mb-1">{t.footer.preparedBy}</p>
            <p className="text-xs text-gray-600 mb-1">{t.footer.date}</p>
            <p className="text-xs text-gray-600 mb-16">{t.footer.signature}</p>
            <div className="border-b-2 border-gray-800 w-32 mx-auto"></div>
          </div>
          <div className="text-center">
            <p className="font-bold text-sm mb-1">{t.footer.accountant}</p>
            <p className="text-xs text-gray-600 mb-1">{t.footer.date}</p>
            <p className="text-xs text-gray-600 mb-16">{t.footer.signature}</p>
            <div className="border-b-2 border-gray-800 w-32 mx-auto"></div>
          </div>
          <div className="text-center">
            <p className="font-bold text-sm mb-1">{t.footer.director}</p>
            <p className="text-xs text-gray-600 mb-1">{t.footer.date}</p>
            <p className="text-xs text-gray-600 mb-16">{t.footer.signature}</p>
            <div className="border-b-2 border-gray-800 w-32 mx-auto"></div>
          </div>
        </div>
      </div>
    </div>
  );

  if (isPreviewMode) {
    return (
      <div className="fixed inset-0 bg-gray-100 z-50 overflow-auto">
        {/* Preview Header - NO PRINT */}
        <div className="no-print bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
          <div className="max-w-6xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <h3 className="text-lg font-semibold text-gray-900">Xem trước bản in</h3>
                <div className="flex items-center space-x-2 bg-gray-100 rounded-lg p-1">
                  <button
                    onClick={handleZoomOut}
                    className="p-1.5 hover:bg-white rounded transition-colors"
                    title="Thu nhỏ"
                  >
                    <ZoomOut size={16} />
                  </button>
                  <span className="text-sm font-medium px-2">{zoomLevel}%</span>
                  <button
                    onClick={handleZoomIn}
                    className="p-1.5 hover:bg-white rounded transition-colors"
                    title="Phóng to"
                  >
                    <ZoomIn size={16} />
                  </button>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
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
                  <span>In</span>
                </button>
                <button
                  onClick={() => setIsPreviewMode(false)}
                  className="flex items-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  <X size={16} />
                  <span>Đóng</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Preview Content */}
        <div className="max-w-4xl mx-auto p-8">
          <div 
            className="bg-white shadow-2xl mx-auto print-here"
            style={{ 
              transform: `scale(${zoomLevel / 100})`,
              transformOrigin: 'top center',
              width: '210mm',
              minHeight: '297mm',
              padding: '20mm'
            }}
          >
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
                Thông tin báo cáo
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
                onClick={() => {
                  setIsPreviewMode(true);
                  setTimeout(handlePrint, 100);
                }}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Printer size={16} />
                <span>In ngay</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Print Styles - CHỈ IN PHẦN PRINT-CONTENT */}
      <style jsx global>{`
        @media print {
          /* Ẩn tất cả các thành phần */
          * {
            visibility: hidden !important;
          }
          
          /* Chỉ hiển thị nội dung cần in */
          #print-content,
          #print-content * {
            visibility: visible !important;
          }
          
          /* Đặt lại vị trí và kích thước cho nội dung in */
          #print-content {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            margin: 0 !important;
            padding: 15mm !important;
            font-family: 'Times New Roman', serif !important;
            background: white !important;
          }
          
          /* Thiết lập trang in */
          @page {
            size: A4 portrait;
            margin: 15mm;
          }
          
          /* Đảm bảo không có phần tử nào khác hiển thị */
          body {
            margin: 0 !important;
            padding: 0 !important;
          }
          
          /* Styling chi tiết cho bảng in */
          .print-content {
            font-size: 11px !important;
            line-height: 1.3 !important;
            color: black !important;
          }
          
          .print-header h1 {
            font-size: 14px !important;
            font-weight: bold !important;
            margin-bottom: 8px !important;
          }
          
          .print-title h2 {
            font-size: 13px !important;
            font-weight: bold !important;
            margin-bottom: 12px !important;
          }
          
          .print-table table {
            width: 100% !important;
            border-collapse: collapse !important;
            page-break-inside: avoid;
          }
          
          .print-th {
            background-color: #f5f5f5 !important;
            font-weight: bold !important;
            text-align: center !important;
            padding: 4px !important;
            border: 1px solid black !important;
            font-size: 10px !important;
          }
          
          .print-td {
            padding: 3px 4px !important;
            border: 1px solid black !important;
            vertical-align: top !important;
            font-size: 10px !important;
          }
          
          .print-row {
            page-break-inside: avoid;
          }
          
          .print-footer {
            page-break-inside: avoid;
            margin-top: 20px !important;
          }
          
          .print-summary {
            margin-bottom: 20px !important;
            font-weight: bold !important;
          }
          
          /* Đảm bảo màu sắc được in */
          * {
            -webkit-print-color-adjust: exact !important;
            color-adjust: exact !important;
          }
          
          /* Ẩn hoàn toàn các class no-print */
          .no-print {
            display: none !important;
            visibility: hidden !important;
          }
        }
        
        /* Styles cho preview mode */
        .print-content {
          font-family: 'Times New Roman', serif;
          line-height: 1.4;
        }
      `}</style>
    </>
  );
}