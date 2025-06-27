import React, { useState, useEffect, Fragment } from 'react';
import * as Icons from 'lucide-react';

interface CostCenter {
  id: string;
  code: string;
  nameVi: string;
  nameEn: string;
  nameKo: string;
  parentObject: string;
  notes: string;
  createdDate: string;
  status: 'active' | 'inactive';
}

const CostCenterManagement: React.FC = () => {
  // Dữ liệu mẫu
  const [costCenters, setCostCenters] = useState<CostCenter[]>([ /* ... */ ]);

  // Các state khác giữ nguyên
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<CostCenter | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [showActionMenu, setShowActionMenu] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [sortField, setSortField] = useState<keyof CostCenter>('code');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [formData, setFormData] = useState({
    code: '', nameVi: '', nameEn: '', nameKo: '', parentObject: '', notes: ''
  });
  const [expandedRows, setExpandedRows] = useState<string[]>([]);

  // Các hàm thêm/sửa/xóa, filter, sort, pagination, modal… giữ nguyên như trước
  // handleEdit(item), handleDelete(id), handleSubmit, toggleRow(id), handleSort(field), v.v.

  // --- PHẦN TABLE ĐƯỢC SỬA LẠI Ở ĐÂY ---
  const filteredAndSorted = costCenters
    .filter(item => /* ... searchTerm filter ... */ )
    .sort((a, b) => /* ... sort by sortField & sortDirection ... */ );

  const parentItems = filteredAndSorted.filter(item => !item.parentObject);
  const totalPages = Math.ceil(parentItems.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, parentItems.length);
  const paginatedParents = parentItems.slice(startIndex, endIndex);

  return (
    <div className="p-6 space-y-6">
      {/* … header, filters, thống kê, action bar giữ nguyên … */}

      <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-red-50 border-b border-red-200">
              <tr>
                {/* Checkbox chọn tất cả (giữ nguyên) */}
                <th className="px-4 py-3 text-left">
                  <input
                    type="checkbox"
                    /* … */
                  />
                </th>
                <th onClick={() => handleSort('code')} className="px-4 py-3 text-left cursor-pointer">
                  <div className="flex items-center space-x-1">
                    <span>Mã đối tượng</span>
                    {sortField === 'code' &&
                      (sortDirection === 'asc'
                        ? <Icons.ChevronUp size={16}/>
                        : <Icons.ChevronDown size={16}/>)
                    }
                  </div>
                </th>
                <th onClick={() => handleSort('nameVi')} className="px-4 py-3 text-left cursor-pointer">
                  <div className="flex items-center space-x-1">
                    <span>Tiếng Việt</span>
                    {sortField === 'nameVi' &&
                      (sortDirection === 'asc'
                        ? <Icons.ChevronUp size={16}/>
                        : <Icons.ChevronDown size={16}/>)
                    }
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
                  {/* Row cha */}
                  <tr className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selectedItems.includes(parent.id)}
                        /* … */
                      />
                    </td>
                    <td className="px-4 py-3 flex items-center">
                      {costCenters.some(c => c.parentObject === parent.id) && (
                        <button
                          onClick={() => toggleRow(parent.id)}
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
                          onClick={() =>
                            setShowActionMenu(showActionMenu === parent.id ? null : parent.id)
                          }
                          className="px-2 py-1 rounded bg-gray-100 hover:bg-gray-200"
                        >
                          <Icons.MoreHorizontal size={16}/>
                        </button>
                        {showActionMenu === parent.id && (
                          <div className="absolute right-0 mt-2 w-40 bg-white border border-gray-200 rounded shadow-lg z-10">
                            <button
                              onClick={() => handleEdit(parent)}
                              className="w-full px-4 py-2 flex items-center space-x-2 hover:bg-gray-50 text-sm"
                            >
                              <Icons.Edit size={16} className="text-green-600"/>
                              <span>Chỉnh sửa</span>
                            </button>
                            <button
                              onClick={() => handleDelete(parent.id)}
                              className="w-full px-4 py-2 flex items-center space-x-2 hover:bg-gray-50 text-sm text-red-600"
                            >
                              <Icons.Trash2 size={16}/>
                              <span>Xóa</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>

                  {/* Rows con (khi expand) */}
                  {expandedRows.includes(parent.id) &&
                    filteredAndSorted
                      .filter(c => c.parentObject === parent.id)
                      .map(child => (
                        <tr key={child.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-4 py-3">
                            <input
                              type="checkbox"
                              checked={selectedItems.includes(child.id)}
                              /* … */
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
                                onClick={() =>
                                  setShowActionMenu(showActionMenu === child.id ? null : child.id)
                                }
                                className="px-2 py-1 rounded bg-gray-100 hover:bg-gray-200"
                              >
                                <Icons.MoreHorizontal size={16}/>
                              </button>
                              {showActionMenu === child.id && (
                                <div className="absolute right-0 mt-2 w-40 bg-white border border-gray-200 rounded shadow-lg z-10">
                                  <button
                                    onClick={() => handleEdit(child)}
                                    className="w-full px-4 py-2 flex items-center space-x-2 hover:bg-gray-50 text-sm"
                                  >
                                    <Icons.Edit size={16} className="text-green-600"/>
                                    <span>Chỉnh sửa</span>
                                  </button>
                                  <button
                                    onClick={() => handleDelete(child.id)}
                                    className="w-full px-4 py-2 flex items-center space-x-2 hover:bg-gray-50 text-sm text-red-600"
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

        {/* Pagination giữ nguyên */}
        <div className="bg-gray-50 px-6 py-3 flex items-center justify-between border-t border-gray-200">
          <span className="text-sm text-gray-700">
            Hiển thị {startIndex + 1}–{endIndex} của {parentItems.length} kết quả
          </span>
          <div className="flex items-center space-x-2">
            {/* … nút Prev, số trang, Next … */}
          </div>
        </div>
      </div>

      {/* Modal Add/Edit giữ nguyên */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          {/* … form thêm/sửa … */}
        </div>
      )}
    </div>
  );
};

export default CostCenterManagement;
