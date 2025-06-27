import React, { useState, useEffect, Fragment } from 'react';
import * as Icons from 'lucide-react';

interface CostCenter {
  id: string;
  code: string;
  nameVi: string;
  nameEn: string;
  nameKo: string;
  parentObject: string; // lưu id của parent, hoặc '' nếu không có
  notes: string;
  createdDate: string; // định dạng 'YYYY-MM-DD'
  status: 'active' | 'inactive';
}

const CostCenterManagement: React.FC = () => {
  // ----- State chính -----
  const [costCenters, setCostCenters] = useState<CostCenter[]>([
    {
      id: '1',
      code: 'CC001',
      nameVi: 'Phòng Sản Xuất',
      nameEn: 'Production Department',
      nameKo: '생산부',
      parentObject: '',
      notes: 'Phòng ban chịu trách nhiệm sản xuất sản phẩm',
      createdDate: '2024-01-15',
      status: 'active'
    },
    {
      id: '2',
      code: 'CC002',
      nameVi: 'Phòng Marketing',
      nameEn: 'Marketing Department',
      nameKo: '마케팅부',
      parentObject: '1',
      notes: 'Phòng ban phụ trách marketing và bán hàng',
      createdDate: '2024-01-10',
      status: 'active'
    },
    {
      id: '3',
      code: 'CC003',
      nameVi: 'Phòng Kế Toán',
      nameEn: 'Accounting Department',
      nameKo: '회계부',
      parentObject: '',
      notes: 'Phòng ban quản lý tài chính và kế toán',
      createdDate: '2024-01-05',
      status: 'active'
    }
  ]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<keyof CostCenter>('code');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [expandedRows, setExpandedRows] = useState<string[]>([]);
  const [showActionMenu, setShowActionMenu] = useState<string | null>(null);
  const [showPrintMenu, setShowPrintMenu] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<CostCenter | null>(null);
  const [formData, setFormData] = useState({
    code: '',
    nameVi: '',
    nameEn: '',
    nameKo: '',
    parentObject: '',
    notes: ''
  });

  // ----- Derived data: filter + sort -----
  const filteredAndSorted = costCenters
    .filter(item =>
      item.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.nameVi.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.nameEn.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.nameKo.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      const aVal = a[sortField];
      const bVal = b[sortField];
      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

  // ----- Pagination trên chỉ các parent -----
  const parentItems = filteredAndSorted.filter(item => !item.parentObject);
  const totalPages = Math.ceil(parentItems.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, parentItems.length);
  const paginatedParents = parentItems.slice(startIndex, endIndex);

  // ----- Các options cho select Parent trong modal -----
  const parentOptions = costCenters.filter(cc =>
    !cc.parentObject && cc.id !== editingItem?.id
  );

  // ----- HANDLERS -----
  const handleSort = (field: keyof CostCenter) => {
    if (sortField === field) {
      setSortDirection(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const toggleRow = (id: string) => {
    setExpandedRows(r =>
      r.includes(id) ? r.filter(x => x !== id) : [...r, id]
    );
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      // chọn tất cả parent + nếu expand thì cả child
      const allIds = paginatedParents.reduce<string[]>((acc, p) => {
        acc.push(p.id);
        if (expandedRows.includes(p.id)) {
          const childIds = filteredAndSorted
            .filter(c => c.parentObject === p.id)
            .map(c => c.id);
          acc.push(...childIds);
        }
        return acc;
      }, []);
      setSelectedItems(Array.from(new Set(allIds)));
    } else {
      setSelectedItems([]);
    }
  };

  const handleSelectItem = (id: string, checked: boolean) => {
    if (checked) setSelectedItems(prev => [...prev, id]);
    else setSelectedItems(prev => prev.filter(x => x !== id));
  };

  const handleDelete = (id: string) => {
    if (!window.confirm('Bạn có chắc muốn xóa mục này không?')) return;
    setCostCenters(prev =>
      prev.filter(item => item.id !== id && item.parentObject !== id)
    );
    setSelectedItems(prev => prev.filter(x => x !== id));
    setShowActionMenu(null);
  };

  const handleBulkDelete = () => {
    if (selectedItems.length === 0) return;
    if (!window.confirm(`Xóa ${selectedItems.length} mục đã chọn?`)) return;
    setCostCenters(prev =>
      prev.filter(item => !selectedItems.includes(item.id))
    );
    setSelectedItems([]);
  };

  const handleExport = () => {
    const header = ['ID','Code','Tiếng Việt','Tiếng Anh','Tiếng Hàn','Ghi chú','Ngày tạo'];
    const rows = filteredAndSorted.map(item => [
      item.id, item.code, item.nameVi, item.nameEn, item.nameKo, item.notes, item.createdDate
    ]);
    const csv = [header, ...rows]
      .map(r => r.map(field => `"${field.replace(/"/g,'""')}"`).join(','))
      .join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'cost_centers.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handlePrint = (_lang: 'vi' | 'en') => {
    window.print();
    setShowPrintMenu(false);
  };

  const openAddModal = () => {
    setEditingItem(null);
    setFormData({ code:'', nameVi:'', nameEn:'', nameKo:'', parentObject:'', notes:'' });
    setIsModalOpen(true);
  };

  const handleEdit = (item: CostCenter) => {
    setEditingItem(item);
    setFormData({
      code: item.code,
      nameVi: item.nameVi,
      nameEn: item.nameEn,
      nameKo: item.nameKo,
      parentObject: item.parentObject,
      notes: item.notes
    });
    setIsModalOpen(true);
    setShowActionMenu(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingItem) {
      // Cập nhật
      setCostCenters(prev =>
        prev.map(item =>
          item.id === editingItem.id
            ? { ...item, ...formData }
            : item
        )
      );
    } else {
      // Thêm mới
      const newItem: CostCenter = {
        id: Date.now().toString(),
        code: formData.code,
        nameVi: formData.nameVi,
        nameEn: formData.nameEn,
        nameKo: formData.nameKo,
        parentObject: formData.parentObject,
        notes: formData.notes,
        createdDate: new Date().toISOString().slice(0,10),
        status: 'active'
      };
      setCostCenters(prev => [newItem, ...prev]);
    }
    setIsModalOpen(false);
  };

  // Reset trang khi filter/search thay đổi
  useEffect(() => {
    setCurrentPage(1);
    setSelectedItems([]);
  }, [searchTerm, sortField, sortDirection]);

  // ----- RENDER -----
  return (
    <div className="p-6 space-y-6">
      {/* === Toolbar === */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Quản lý Đối tượng chi phí</h2>
        <div className="flex items-center space-x-2">
          <button
            onClick={openAddModal}
            className="px-4 py-2 bg-red-600 text-white rounded-lg flex items-center space-x-1 hover:bg-red-700 transition"
          >
            <Icons.Plus size={16}/> <span>Thêm mới</span>
          </button>
          <button
            onClick={handleBulkDelete}
            disabled={selectedItems.length===0}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg flex items-center space-x-1 disabled:opacity-50"
          >
            <Icons.Trash2 size={16}/> <span>Xóa</span>
          </button>
          <div className="relative">
            <button
              onClick={()=> setShowPrintMenu(p=>!p)}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg flex items-center space-x-1"
            >
              <Icons.Printer size={16}/> <span>In</span>
            </button>
            {showPrintMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow border">
                <button
                  onClick={()=>handlePrint('vi')}
                  className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center space-x-2"
                >
                  <Icons.FileText size={16} className="text-blue-500"/> <span>Tiếng Việt</span>
                </button>
                <button
                  onClick={()=>handlePrint('en')}
                  className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center space-x-2"
                >
                  <Icons.FileText size={16} className="text-green-500"/> <span>English</span>
                </button>
              </div>
            )}
          </div>
          <button
            onClick={handleExport}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg flex items-center space-x-1 hover:bg-gray-300 transition"
          >
            <Icons.Download size={16}/> <span>Export</span>
          </button>
        </div>
      </div>

      {/* === Search === */}
      <div>
        <input
          type="text"
          placeholder="Tìm kiếm..."
          value={searchTerm}
          onChange={e=>setSearchTerm(e.target.value)}
          className="w-full md:w-1/3 px-3 py-2 border border-gray-300 rounded-lg focus:ring-red-500 focus:border-red-500"
        />
      </div>

      {/* === Table === */}
      <div className="bg-white rounded-xl shadow border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-red-50 border-b border-red-200">
              <tr>
                <th className="px-4 py-3">
                  <input
                    type="checkbox"
                    checked={
                      selectedItems.length > 0 &&
                      paginatedParents.every(p => selectedItems.includes(p.id))
                    }
                    onChange={e=>handleSelectAll(e.target.checked)}
                    className="rounded border-gray-300 text-red-600"
                  />
                </th>
                <th onClick={()=>handleSort('code')} className="px-4 py-3 text-left cursor-pointer">
                  <div className="flex items-center space-x-1">
                    <span>Mã đối tượng</span>
                    {sortField==='code' && (sortDirection==='asc'
                      ? <Icons.ChevronUp size={16}/>
                      : <Icons.ChevronDown size={16}/>)}
                  </div>
                </th>
                <th onClick={()=>handleSort('nameVi')} className="px-4 py-3 text-left cursor-pointer">
                  <div className="flex items-center space-x-1">
                    <span>Tiếng Việt</span>
                    {sortField==='nameVi' && (sortDirection==='asc'
                      ? <Icons.ChevronUp size={16}/>
                      : <Icons.ChevronDown size={16}/>)}
                  </div>
                </th>
                <th className="px-4 py-3 text-left">Tiếng Anh</th>
                <th className="px-4 py-3 text-left">Tiếng Hàn</th>
                <th className="px-4 py-3 text-left">Ghi chú</th>
                <th className="px-4 py-3 text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {paginatedParents.map(parent => (
                <Fragment key={parent.id}>
                  {/* Parent row */}
                  <tr className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selectedItems.includes(parent.id)}
                        onChange={e=>handleSelectItem(parent.id, e.target.checked)}
                        className="rounded border-gray-300 text-red-600"
                      />
                    </td>
                    <td className="px-4 py-3 flex items-center">
                      {filteredAndSorted.some(c=>c.parentObject===parent.id) && (
                        <button
                          onClick={()=>toggleRow(parent.id)}
                          className="mr-2 p-1 hover:bg-gray-100 rounded"
                        >
                          {expandedRows.includes(parent.id)
                            ? <Icons.ChevronDown size={16}/>
                            : <Icons.ChevronRight size={16}/>}
                        </button>
                      )}
                      <span className="font-medium">{parent.code}</span>
                    </td>
                    <td className="px-4 py-3">{parent.nameVi}</td>
                    <td className="px-4 py-3">{parent.nameEn}</td>
                    <td className="px-4 py-3">{parent.nameKo}</td>
                    <td className="px-4 py-3 truncate max-w-xs" title={parent.notes}>
                      {parent.notes}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="relative inline-block">
                        <button
                          onClick={()=>setShowActionMenu(s=>s===parent.id?null:parent.id)}
                          className="px-2 py-1 bg-gray-100 rounded hover:bg-gray-200"
                        >
                          <Icons.MoreHorizontal size={16}/>
                        </button>
                        {showActionMenu===parent.id && (
                          <div className="absolute right-0 mt-2 w-40 bg-white border rounded shadow">
                            <button
                              onClick={()=>handleEdit(parent)}
                              className="w-full px-4 py-2 flex items-center space-x-2 hover:bg-gray-50"
                            >
                              <Icons.Edit size={16} className="text-green-600"/>
                              <span>Chỉnh sửa</span>
                            </button>
                            <button
                              onClick={()=>handleDelete(parent.id)}
                              className="w-full px-4 py-2 flex items-center space-x-2 hover:bg-gray-50 text-red-600"
                            >
                              <Icons.Trash2 size={16}/>
                              <span>Xóa</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                  {/* Child rows */}
                  {expandedRows.includes(parent.id) && filteredAndSorted
                    .filter(c=>c.parentObject===parent.id)
                    .map(child=>(
                      <tr key={child.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <input
                            type="checkbox"
                            checked={selectedItems.includes(child.id)}
                            onChange={e=>handleSelectItem(child.id, e.target.checked)}
                            className="rounded border-gray-300 text-red-600"
                          />
                        </td>
                        <td className="px-4 py-3 pl-8">{child.code}</td>
                        <td className="px-4 py-3">{child.nameVi}</td>
                        <td className="px-4 py-3">{child.nameEn}</td>
                        <td className="px-4 py-3">{child.nameKo}</td>
                        <td className="px-4 py-3 truncate max-w-xs" title={child.notes}>
                          {child.notes}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <div className="relative inline-block">
                            <button
                              onClick={()=>setShowActionMenu(s=>s===child.id?null:child.id)}
                              className="px-2 py-1 bg-gray-100 rounded hover:bg-gray-200"
                            >
                              <Icons.MoreHorizontal size={16}/>
                            </button>
                            {showActionMenu===child.id && (
                              <div className="absolute right-0 mt-2 w-40 bg-white border rounded shadow">
                                <button
                                  onClick={()=>handleEdit(child)}
                                  className="w-full px-4 py-2 flex items-center space-x-2 hover:bg-gray-50"
                                >
                                  <Icons.Edit size={16} className="text-green-600"/>
                                  <span>Chỉnh sửa</span>
                                </button>
                                <button
                                  onClick={()=>handleDelete(child.id)}
                                  className="w-full px-4 py-2 flex items-center space-x-2 hover:bg-gray-50 text-red-600"
                                >
                                  <Icons.Trash2 size={16}/>
                                  <span>Xóa</span>
                                </button>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  }
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>

        {/* === Pagination === */}
        <div className="bg-gray-50 px-6 py-3 flex items-center justify-between border-t">
          <span className="text-sm text-gray-700">
            Hiển thị {startIndex+1}–{endIndex} trên {parentItems.length} kết quả
          </span>
          <div className="flex items-center space-x-1">
            <button
              onClick={()=>setCurrentPage(p=>Math.max(1,p-1))}
              disabled={currentPage===1}
              className="px-3 py-1 border rounded disabled:opacity-50"
            >
              Trước
            </button>
            {Array.from({length: totalPages}, (_, i)=>i+1).map(p=>(
              <button
                key={p}
                onClick={()=>setCurrentPage(p)}
                className={`px-3 py-1 border rounded ${p===currentPage?'bg-red-600 text-white':''}`}
              >
                {p}
              </button>
            ))}
            <button
              onClick={()=>setCurrentPage(p=>Math.min(totalPages,p+1))}
              disabled={currentPage===totalPages}
              className="px-3 py-1 border rounded disabled:opacity-50"
            >
              Sau
            </button>
          </div>
        </div>
      </div>

      {/* === Modal Add / Edit === */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-lg mx-4">
            <div className="flex justify-between items-center border-b px-6 py-3">
              <h3 className="text-lg font-medium">
                {editingItem ? 'Chỉnh sửa đối tượng' : 'Thêm mới đối tượng'}
              </h3>
              <button onClick={()=>setIsModalOpen(false)}>
                <Icons.X size={20}/>
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Mã đối tượng</label>
                <input
                  required
                  value={formData.code}
                  onChange={e=>setFormData(f=>({...f,code:e.target.value}))}
                  className="w-full px-3 py-2 border rounded focus:ring-red-500 focus:border-red-500"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Tiếng Việt</label>
                  <input
                    required
                    value={formData.nameVi}
                    onChange={e=>setFormData(f=>({...f,nameVi:e.target.value}))}
                    className="w-full px-3 py-2 border rounded focus:ring-red-500 focus:border-red-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Tiếng Anh</label>
                  <input
                    value={formData.nameEn}
                    onChange={e=>setFormData(f=>({...f,nameEn:e.target.value}))}
                    className="w-full px-3 py-2 border rounded focus:ring-red-500 focus:border-red-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Tiếng Hàn</label>
                  <input
                    value={formData.nameKo}
                    onChange={e=>setFormData(f=>({...f,nameKo:e.target.value}))}
                    className="w-full px-3 py-2 border rounded focus:ring-red-500 focus:border-red-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Đối tượng gốc</label>
                  <select
                    value={formData.parentObject}
                    onChange={e=>setFormData(f=>({...f,parentObject:e.target.value}))}
                    className="w-full px-3 py-2 border rounded focus:ring-red-500 focus:border-red-500"
                  >
                    <option value="">Không có cha</option>
                    {parentOptions.map(opt=>(
                      <option key={opt.id} value={opt.id}>{opt.code}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Ghi chú</label>
                <textarea
                  value={formData.notes}
                  onChange={e=>setFormData(f=>({...f,notes:e.target.value}))}
                  className="w-full px-3 py-2 border rounded focus:ring-red-500 focus:border-red-500"
                  rows={3}
                />
              </div>
               
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={()=>setIsModalOpen(false)}
                  className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-red-600 text-white rounded flex items-center space-x-1 hover:bg-red-700"
                >
                  <Icons.Save size={16}/>
                  <span>{editingItem ? 'Cập nhật' : 'Thêm mới'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CostCenterManagement;
