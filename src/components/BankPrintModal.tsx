import React, { useState, useCallback, useMemo } from 'react';
import { X, Printer, FileText, Download, Calendar, Building2, ZoomIn, ZoomOut } from 'lucide-react';

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

interface BankPrintModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: Bank[];
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
  { code: 'ko', name: '한국어', flag: '🇰🇷' },
];

const translations = {
  vi: {
    title: 'DANH SÁCH NGÂN HÀNG',
    printDate: 'Ngày in',
    columns: {
      stt: 'STT',
      bankName: 'Tên ngân hàng',
      bankCode: 'Mã ngân hàng',
      province: 'Tỉnh/Thành phố',
      branch: 'Chi nhánh',
      accountNumber: 'Số tài khoản',
      accountHolderName: 'Tên tài khoản',
      currency: 'Loại tiền',
    },
    footer: {
      preparedBy: 'Người lập biểu',
      accountant: 'Kế toán trưởng',
      director: 'Giám đốc',
      signature: '(Ký họ tên)',
      date: 'Ngày ... tháng ... năm ...',
    },
    summary: 'Tổng cộng có {count} ngân hàng',
  },
  en: {
    title: 'BANK LIST',
    printDate: 'Print Date',
    columns: {
      stt: 'No.',
      bankName: 'Bank Name',
      bankCode: 'Bank Code',
      province: 'Province/City',
      branch: 'Branch',
      accountNumber: 'Account Number',
      accountHolderName: 'Account Holder',
      currency: 'Currency',
    },
    footer: {
      preparedBy: 'Prepared by',
      accountant: 'Chief Accountant',
      director: 'Director',
      signature: '(Signature)',
      date: 'Date ... Month ... Year ...',
    },
    summary: 'Total: {count} banks',
  },
  ko: {
    title: '은행 목록',
    printDate: '인쇄 날짜',
    columns: {
      stt: '번호',
      bankName: '은행명',
      bankCode: '은행 코드',
      province: '지역',
      branch: '지점',
      accountNumber: '계좌번호',
      accountHolderName: '계좌명',
      currency: '통화',
    },
    footer: {
      preparedBy: '작성자',
      accountant: '회계 책임자',
      director: '이사',
      signature: '(서명)',
      date: '날짜 ... 월 ... 년 ...',
    },
    summary: '총 {count}개 은행',
  },
};

export default function BankPrintModal({ isOpen, onClose, data, companyInfo }: BankPrintModalProps) {
  const [selectedLanguage, setSelectedLanguage] = useState<PrintLanguage>(languages[0]);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(100);

  const defaultCompanyInfo = useMemo(
    () => ({
      name: 'Công ty TNHH ABC Technology',
      address: '123 Đường ABC, Quận Ba Đình, Hà Nội',
      taxCode: '0123456789',
    }),
    [],
  );

  const company = companyInfo || defaultCompanyInfo;
  const t = translations[selectedLanguage.code];

  const currentDate = useMemo(
    () =>
      new Date().toLocaleDateString(
        selectedLanguage.code === 'vi' ? 'vi-VN' : selectedLanguage.code === 'en' ? 'en-US' : 'ko-KR',
      ),
    [selectedLanguage.code],
  );

  const handlePrintAll = useCallback(() => {
    if (!data || data.length === 0) {
      alert('Không có dữ liệu để in!');
      return;
    }

    const currentTranslations = translations[selectedLanguage.code];
    const currentDate = new Date().toLocaleDateString(
      selectedLanguage.code === 'vi' ? 'vi-VN' : selectedLanguage.code === 'en' ? 'en-US' : 'ko-KR',
    );

    const htmlContent = `
    <!DOCTYPE html>
    <html lang="${selectedLanguage.code}">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Print - ${currentTranslations.title}</title>
        <style>
          @page { 
            size: A4 landscape; 
            margin: 15mm; 
          }
          
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          
          body { 
            margin: 0; 
            padding: 0; 
            font-family: 'Times New Roman', serif;
            font-size: 13px;
            line-height: 1.3;
            color: black;
            background: white;
          }
          
          .print-content {
            width: 100%;
            padding: 0;
          }
          
          .print-header {
            text-align: center;
            margin-bottom: 32px;
            padding-bottom: 16px;
            border-bottom: 2px solid #1f2937;
          }
          
          .print-header h1 {
            font-size: 16px;
            font-weight: bold;
            margin-bottom: 8px;
            text-transform: uppercase;
            letter-spacing: 0.05em;
          }
          
          .print-header p {
            font-size: 13px;
            margin-bottom: 4px;
          }
          
          .print-title {
            text-align: center;
            margin-bottom: 24px;
          }
          
          .print-title h2 {
            font-size: 15px;
            font-weight: bold;
            margin-bottom: 12px;
            text-transform: uppercase;
            letter-spacing: 0.1em;
          }
          
          .title-info {
            display: flex;
            justify-content: space-between;
            font-size: 13px;
            margin-top: 8px;
          }
          
          .print-table {
            margin-bottom: 32px;
            width: 100%;
          }
          
          .print-table table {
            width: 100%;
            border-collapse: collapse;
            border: 1px solid black;
          }
          
          .print-th {
            background-color: #f5f5f5;
            font-weight: bold;
            text-align: center;
            padding: 6px 4px;
            border: 1px solid black;
            font-size: 12px;
            vertical-align: middle;
          }
          
          .print-td {
            padding: 4px;
            border: 1px solid black;
            vertical-align: top;
            font-size: 12px;
          }
          
          .print-td.center {
            text-align: center;
          }
          
          .print-td.bold {
            font-weight: bold;
          }
          
          .print-summary {
            margin-bottom: 24px;
            font-weight: bold;
            font-size: 13px;
          }
          
          .print-footer {
            margin-top: 32px;
            page-break-inside: avoid;
          }
          
          .signature-grid {
            display: grid;
            grid-template-columns: 1fr 1fr 1fr;
            gap: 32px;
          }
          
          .signature-item {
            text-align: center;
          }
          
          .signature-item .title {
            font-weight: bold;
            font-size: 13px;
            margin-bottom: 4px;
          }
          
          .signature-item .date {
            font-size: 12px;
            color: #666;
            margin-bottom: 4px;
          }
          
          .signature-item .note {
            font-size: 12px;
            color: #666;
            margin-bottom: 64px;
          }
          
          .signature-item .line {
            border-bottom: 2px solid black;
            width: 128px;
            margin: 0 auto;
          }
          
          * { 
            -webkit-print-color-adjust: exact;
            color-adjust: exact;
          }
        </style>
      </head>
      <body>
        <div class="print-content">
          <div class="print-header">
            <h1>${company.name}</h1>
            <p><strong>Địa chỉ:</strong> ${company.address}</p>
            <p><strong>Mã số thuế:</strong> ${company.taxCode}</p>
          </div>

          <div class="print-title">
            <h2>${currentTranslations.title}</h2>
            <div class="title-info">
              <span>${currentTranslations.printDate}: ${currentDate}</span>
              <span>Trang: 1</span>
            </div>
          </div>

          <div class="print-table">
            <table>
              <thead>
                <tr>
                  <th class="print-th" style="width: 40px;">${currentTranslations.columns.stt}</th>
                  <th class="print-th">${currentTranslations.columns.bankName}</th>
                  <th class="print-th" style="width: 80px;">${currentTranslations.columns.bankCode}</th>
                  <th class="print-th">${currentTranslations.columns.province}</th>
                  <th class="print-th">${currentTranslations.columns.branch}</th>
                  <th class="print-th">${currentTranslations.columns.accountNumber}</th>
                  <th class="print-th">${currentTranslations.columns.accountHolderName}</th>
                  <th class="print-th" style="width: 60px;">${currentTranslations.columns.currency}</th>
                </tr>
              </thead>
              <tbody>
                ${data
                  .map(
                    (item, index) => `
                  <tr>
                    <td class="print-td center">${index + 1}</td>
                    <td class="print-td">${item.bankName || ''}</td>
                    <td class="print-td center bold">${item.bankCode || ''}</td>
                    <td class="print-td">${item.province || ''}</td>
                    <td class="print-td">${item.branch || ''}</td>
                    <td class="print-td center">${item.accountNumber || '-'}</td>
                    <td class="print-td">${item.accountHolderName || '-'}</td>
                    <td class="print-td center">${item.currency || '-'}</td>
                  </tr>
                `,
                  )
                  .join('')}
              </tbody>
            </table>
          </div>

          <div class="print-summary">
            <p>${currentTranslations.summary.replace('{count}', data.length.toString())}</p>
          </div>

          <div class="print-footer">
            <div class="signature-grid">
              <div class="signature-item">
                <div class="title">${currentTranslations.footer.preparedBy}</div>
                <div class="date">${currentTranslations.footer.date}</div>
                <div class="note">${currentTranslations.footer.signature}</div>
                <div class="line"></div>
              </div>
              <div class="signature-item">
                <div class="title">${currentTranslations.footer.accountant}</div>
                <div class="date">${currentTranslations.footer.date}</div>
                <div class="note">${currentTranslations.footer.signature}</div>
                <div class="line"></div>
              </div>
              <div class="signature-item">
                <div class="title">${currentTranslations.footer.director}</div>
                <div class="date">${currentTranslations.footer.date}</div>
                <div class="note">${currentTranslations.footer.signature}</div>
                <div class="line"></div>
              </div>
            </div>
          </div>
        </div>
      </body>
    </html>
  `;

    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.left = '-9999px';
    iframe.style.top = '-9999px';
    iframe.style.width = '1px';
    iframe.style.height = '1px';
    iframe.style.opacity = '0';
    iframe.style.border = 'none';

    document.body.appendChild(iframe);

    iframe.onload = () => {
      const doc = iframe.contentWindow?.document;
      if (!doc) {
        console.error('Không thể truy cập document của iframe');
        document.body.removeChild(iframe);
        return;
      }

      doc.open();
      doc.write(htmlContent);
      doc.close();

      setTimeout(() => {
        try {
          iframe.contentWindow?.focus();
          iframe.contentWindow?.print();

          setTimeout(() => {
            if (document.body.contains(iframe)) {
              document.body.removeChild(iframe);
            }
          }, 1000);
        } catch (error) {
          console.error('Lỗi khi in:', error);
          if (document.body.contains(iframe)) {
            document.body.removeChild(iframe);
          }
        }
      }, 500);
    };

    iframe.onerror = () => {
      console.error('Lỗi khi tải iframe');
      if (document.body.contains(iframe)) {
        document.body.removeChild(iframe);
      }
    };

    iframe.src = 'about:blank';
  }, [data, company, selectedLanguage]);

  const handleDownloadPDF = useCallback(() => {
    alert(`Đang tải xuống PDF bằng ${selectedLanguage.name}...`);
  }, [selectedLanguage.name]);

  const handleZoomIn = useCallback(() => {
    setZoomLevel((prev) => Math.min(prev + 10, 150));
  }, []);

  const handleZoomOut = useCallback(() => {
    setZoomLevel((prev) => Math.max(prev - 10, 50));
  }, []);

  const handleLanguageChange = useCallback((language: PrintLanguage) => {
    setSelectedLanguage(language);
  }, []);

  const handlePreviewModeToggle = useCallback(() => {
    setIsPreviewMode((prev) => !prev);
  }, []);

  const PrintContent = useMemo(() => {
    return (
      <div id="print-content" className="print-content bg-white">
        <div className="print-header text-center mb-8 pb-4 border-b-2 border-gray-800">
          <h1 className="text-lg font-bold text-gray-900 mb-2 uppercase tracking-wide">{company.name}</h1>
          <p className="text-sm text-gray-700 mb-1">
            <strong>Địa chỉ:</strong> {company.address}
          </p>
          <p className="text-sm text-gray-700">
            <strong>Mã số thuế:</strong> {company.taxCode}
          </p>
        </div>

        <div className="print-title text-center mb-6">
          <h2 className="text-base font-bold text-gray-900 uppercase mb-3 tracking-wider">{t.title}</h2>
          <div className="flex justify-between items-center text-sm text-gray-700">
            <span>
              {t.printDate}: {currentDate}
            </span>
            <span>Trang: 1</span>
          </div>
        </div>

        <div className="print-table mb-8">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="print-th border-2 border-gray-800 px-2 py-2 text-center text-xs font-bold bg-gray-100 w-12">
                  {t.columns.stt}
                </th>
                <th className="print-th border-2 border-gray-800 px-2 py-2 text-center text-xs font-bold bg-gray-100">
                  {t.columns.bankName}
                </th>
                <th className="print-th border-2 border-gray-800 px-2 py-2 text-center text-xs font-bold bg-gray-100 w-20">
                  {t.columns.bankCode}
                </th>
                <th className="print-th border-2 border-gray-800 px-2 py-2 text-center text-xs font-bold bg-gray-100">
                  {t.columns.province}
                </th>
                <th className="print-th border-2 border-gray-800 px-2 py-2 text-center text-xs font-bold bg-gray-100">
                  {t.columns.branch}
                </th>
                <th className="print-th border-2 border-gray-800 px-2 py-2 text-center text-xs font-bold bg-gray-100">
                  {t.columns.accountNumber}
                </th>
                <th className="print-th border-2 border-gray-800 px-2 py-2 text-center text-xs font-bold bg-gray-100">
                  {t.columns.accountHolderName}
                </th>
                <th className="print-th border-2 border-gray-800 px-2 py-2 text-center text-xs font-bold bg-gray-100 w-16">
                  {t.columns.currency}
                </th>
              </tr>
            </thead>
            <tbody>
              {data.map((item, index) => (
                <tr key={item.id || index} className="print-row">
                  <td className="print-td border border-gray-600 px-2 py-1.5 text-center text-xs">{index + 1}</td>
                  <td className="print-td border border-gray-600 px-2 py-1.5 text-xs">{item.bankName}</td>
                  <td className="print-td border border-gray-600 px-2 py-1.5 text-xs text-center font-medium">{item.bankCode}</td>
                  <td className="print-td border border-gray-600 px-2 py-1.5 text-xs">{item.province}</td>
                  <td className="print-td border border-gray-600 px-2 py-1.5 text-xs">{item.branch}</td>
                  <td className="print-td border border-gray-600 px-2 py-1.5 text-xs text-center font-mono">{item.accountNumber || '-'}</td>
                  <td className="print-td border border-gray-600 px-2 py-1.5 text-xs">{item.accountHolderName || '-'}</td>
                  <td className="print-td border border-gray-600 px-2 py-1.5 text-xs text-center">{item.currency || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="print-summary mb-8">
          <p className="text-sm font-medium text-gray-900">
            {t.summary.replace('{count}', data.length.toString())}
          </p>
        </div>

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
  }, [data, selectedLanguage.code, company, currentDate, t]);

  if (!isOpen) return null;

  if (isPreviewMode) {
    return (
      <div className="fixed inset-0 bg-gray-100 z-50 overflow-auto">
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
                  onClick={handlePreviewModeToggle}
                  className="flex items-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  <X size={16} />
                  <span>Đóng</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto p-8">
          <div
            className="bg-white shadow-2xl mx-auto print-here"
            style={{
              transform: `scale(${zoomLevel / 100})`,
              transformOrigin: 'top center',
              width: '297mm',
              minHeight: '210mm',
              padding: '20mm',
            }}
          >
            {PrintContent}
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Printer className="text-blue-600" size={20} />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900">In báo cáo ngân hàng</h3>
                <p className="text-sm text-gray-600">Chọn ngôn ngữ và định dạng in</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <X size={20} className="text-gray-500" />
            </button>
          </div>

          <div className="p-6 space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">Chọn ngôn ngữ in</label>
              <div className="grid grid-cols-1 gap-3">
                {languages.map((language) => (
                  <button
                    key={language.code}
                    onClick={() => handleLanguageChange(language)}
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

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">Thông tin báo cáo</label>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <FileText size={20} className="text-gray-600" />
                    <div>
                      <div className="font-medium text-gray-900">Định dạng</div>
                      <div className="text-sm text-gray-600">A4, Landscape</div>
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

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <FileText size={16} className="text-blue-600" />
                <span className="font-medium text-blue-900">Thông tin báo cáo</span>
              </div>
              <div className="text-sm text-blue-800">
                <p>
                  Số lượng bản ghi: <strong>{data.length}</strong>
                </p>
                <p>
                  Ngôn ngữ: <strong>{selectedLanguage.name}</strong>
                </p>
                <p>
                  Tiêu đề: <strong>{t.title}</strong>
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
            <button
              onClick={onClose}
              className="flex items-center px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <X size={16} className="text-gray-500" />
              <span className="hidden sm:block ml-2">Hủy</span>
            </button>

            <div className="flex items-center space-x-3">
              <button
                onClick={handlePreviewModeToggle}
                className="flex items-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                <FileText size={16} />
                <span className="hidden sm:block">Xem trước</span>
              </button>

              <button
                onClick={handleDownloadPDF}
                className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Download size={16} />
                <span className="hidden sm:block">Tải PDF</span>
              </button>

              <button
                onClick={handlePrintAll}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Printer size={16} />
                <span className="hidden sm:block">In ngay</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @media print {
          * {
            visibility: hidden !important;
          }
          
          #print-content,
          #print-content * {
            visibility: visible !important;
          }

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
          
          @page {
            size: A4 landscape;
            margin: 15mm;
          }
          
          body {
            margin: 0 !important;
            padding: 0 !important;
          }
          
          .print-content {
            font-size: 13px !important;
            line-height: 1.3 !important;
            color: black !important;
          }
          
          .print-header h1 {
            font-size: 16px !important;
            font-weight: bold !important;
            margin-bottom: 8px !important;
          }
          
          .print-title h2 {
            font-size: 15px !important;
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
            font-size: 12px !important;
          }
          
          .print-td {
            padding: 3px 4px !important;
            border: 1px solid black !important;
            vertical-align: top !important;
            font-size: 12px !important;
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
          
          * { 
            -webkit-print-color-adjust: exact !important;
            color-adjust: exact !important;
          }
          
          .no-print {
            display: none !important;
            visibility: hidden !important;
          }
        }
        
        .print-content {
          font-family: 'Times New Roman', serif;
          line-height: 1.4;
        }
      `}</style>
    </>
  );
}