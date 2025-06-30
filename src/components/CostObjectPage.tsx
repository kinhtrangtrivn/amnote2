import React, { useState, useEffect } from 'react';
import * as Icons from 'lucide-react';
import ExcelImportModal from './ExcelImportModal';

/** Mô tả cấu trúc một đối tượng tập hợp chi phí */
interface DoiTuongTapHopChiPhi {
  id: string;
  code: string;
  nameVi: string;
  nameEn: string;
  nameKo: string;
  parentObject: string; // id cha hoặc '' nếu root
  notes: string;
  createdDate: string;
  status: 'active' | 'inactive';
}

interface ColumnConfig {
  id: string;
  dataField: string;
  displayName: string;
  width: number;
  visible: boolean;
  pinned: boolean;
  originalOrder: number;
}

const CostObjectPage: React.FC = () => {
  // --- State dữ liệu ---
  const [doiTuongList, setDoiTuongList] = useState<DoiTuongTapHopChiPhi[]>([
    { id: '1', code: 'CC001', nameVi: 'Phòng Sản Xuất', nameEn: 'Production Dept', nameKo: '생산부', parentObject: '', notes: 'Bộ phận sản xuất', createdDate: '2024-01-15', status: 'active' },
    { id: '2', code: 'CC002', nameVi: 'Phòng Marketing',   nameEn: 'Marketing Dept',  nameKo: '마케팅부', parentObject: '1', notes: 'Con của CC001',      createdDate: '2024-01-16', status: 'active' },
    { id: '3', code: 'CC003', nameVi: 'Phòng Kế Toán',     nameEn: 'Accounting Dept', nameKo: '회계부',  parentObject: '', notes: 'Bộ phận kế toán',       createdDate: '2024-01-05', status: 'active' },
    { id: '4', code: 'CC004', nameVi: 'Phòng IT',          nameEn: 'IT Dept',         nameKo: 'IT부',   parentObject: '1', notes: 'Con của CC001',       createdDate: '2024-01-17', status: 'active' },
    { id: '5', code: 'CC005', nameVi: 'Team Frontend',     nameEn: 'Frontend Team',   nameKo: '프론트엔드팀', parentObject: '4', notes: 'Con của CC004',       createdDate: '2024-01-18', status: 'active' },
  ]);

  // Modal nhập Excel
  const [isExcelModalOpen, setIsExcelModalOpen] = useState(false);

  // Modal thêm/sửa
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<DoiTuongTapHopChiPhi | null>(null);
  const [formData, setFormData] = useState({ code: '', nameVi: '', nameEn: '', nameKo: '', parentObject: '', notes: '' });

  // Hàm mở modal thêm mới
  const handleAdd = () => {
    setEditingItem(null);
    setFormData({ code: '', nameVi: '', nameEn: '', nameKo: '', parentObject: '', notes: '' });
    setIsModalOpen(true);
  };

  // Xử lý import từ Excel
  const handleImportFromExcel = (data: any[]) => {
    const newItems = data.map((row, idx) => ({
      id: `${Date.now()}-${idx}`,
      code: row.code,
      nameVi: row.nameVi,
      nameEn: row.nameEn || '',
      nameKo: row.nameKo || '',
      parentObject: row.parentObject || '',
      notes: row.notes || '',
      createdDate: new Date().toISOString().split('T')[0],
      status: 'active' as const
    }));
    setDoiTuongList(prev => [...prev, ...newItems]);
    setIsExcelModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* HEADER & ACTIONS */}
      <div className="flex flex-col sm:flex-row items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Đối tượng tập hợp chi phí</h1>
          <p className="text-gray-600 mt-1">Quản lý các đối tượng tập hợp chi phí</p>
        </div>
        <div className="flex items-center space-x-3 mt-4 sm:mt-0">
          {/* In ấn */}
          <div className="relative print-dropdown">
            {/* Print dropdown remains unchanged */}
          </div>
          {/* Nhập Excel */}
          <button onClick={() => setIsExcelModalOpen(true)}
            className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm flex items-center space-x-2 hover:bg-green-700"
          >
            <Icons.Download size={16}/> <span className="hidden sm:block">Nhập Excel</span>
          </button>
          {/* Thêm mới */}
          <button onClick={handleAdd}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm flex items-center space-x-2 hover:bg-blue-700"
          >
            <Icons.Plus size={16}/> <span className="hidden sm:block">Thêm mới</span>
          </button>
        </div>
      </div>

      {/* Content: Search, Table, Settings, CRUD Modal unchanged */}

      {/* Excel Import Modal */}
      <ExcelImportModal
        isOpen={isExcelModalOpen}
        onClose={() => setIsExcelModalOpen(false)}
        onImport={handleImportFromExcel}
      />
    </div>
  );
};

export default CostObjectPage;
