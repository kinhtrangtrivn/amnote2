import React, { useState } from 'react';
import * as Icons from 'lucide-react';

interface CostCenter {
  id: string;
  code: string;
  nameVi: string;
  nameEn: string;
  nameKo: string;
  parentObject: string; // dùng id của parent hoặc '' nếu là root
  notes: string;
  createdDate: string;
  status: 'active' | 'inactive';
  children?: CostCenter[]; // thêm để dùng cho phân cấp
}

const CostCenterManagement: React.FC = () => {
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
      nameVi: 'Tổ Lắp Ráp',
      nameEn: 'Assembly Team',
      nameKo: '조립팀',
      parentObject: '1',
      notes: 'Nhóm lắp ráp sản phẩm cuối cùng',
      createdDate: '2024-01-16',
      status: 'active'
    },
    {
      id: '3',
      code: 'CC003',
      nameVi: 'Tổ Đóng Gói',
      nameEn: 'Packing Team',
      nameKo: '포장팀',
      parentObject: '1',
      notes: 'Nhóm phụ trách đóng gói thành phẩm',
      createdDate: '2024-01-17',
      status: 'active'
    },
    {
      id: '4',
      code: 'CC004',
      nameVi: 'Phòng Kế Toán',
      nameEn: 'Accounting Department',
      nameKo: '회계부',
      parentObject: '',
      notes: 'Quản lý tài chính kế toán',
      createdDate: '2024-01-05',
      status: 'active'
    }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  const filteredData = costCenters.filter(item => 
    item.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.nameVi.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.nameEn.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.nameKo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const buildTree = (data: CostCenter[]): CostCenter[] => {
    const map = new Map<string, CostCenter & { children: CostCenter[] }>();
    const roots: CostCenter[] = [];

    data.forEach(item => map.set(item.id, { ...item, children: [] }));
    data.forEach(item => {
      const parent = map.get(item.parentObject);
      if (parent) {
        parent.children.push(map.get(item.id)!);
      } else {
        roots.push(map.get(item.id)!);
      }
    });

    return roots;
  };

  const toggleRow = (id: string) => {
    setExpandedRows(prev => {
      const newSet = new Set(prev);
      newSet.has(id) ? newSet.delete(id) : newSet.add(id);
      return newSet;
    });
  };

  const handleSelectItem = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedItems(prev => [...prev, id]);
    } else {
      setSelectedItems(prev => prev.filter(itemId => itemId !== id));
    }
  };

  const renderRows = (nodes: CostCenter[], level: number = 0): JSX.Element[] => {
    return nodes.flatMap(node => {
      const isExpanded = expandedRows.has(node.id);
      const hasChildren = node.children && node.children.length > 0;

      const row = (
        <tr key={node.id}>
          <td>
            <input
              type="checkbox"
              checked={selectedItems.includes(node.id)}
              onChange={(e) => handleSelectItem(node.id, e.target.checked)}
            />
          </td>
          <td style={{ paddingLeft: `${level * 20}px` }}>
            {hasChildren && (
              <button onClick={() => toggleRow(node.id)} className="mr-2">
                {isExpanded ? <Icons.ChevronDown size={16} /> : <Icons.ChevronRight size={16} />}
              </button>
            )}
            {node.code}
          </td>
          <td>{node.nameVi}</td>
          <td>{node.nameEn}</td>
          <td>{node.nameKo}</td>
          <td>{node.parentObject}</td>
          <td>{node.notes}</td>
          <td>{node.status === 'active' ? 'Hoạt động' : 'Ngừng hoạt động'}</td>
        </tr>
      );

      const children = isExpanded && node.children ? renderRows(node.children, level + 1) : [];
      return [row, ...children];
    });
  };

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">Đối tượng tập hợp chi phí</h1>
      <input
        type="text"
        placeholder="Tìm kiếm..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="mb-4 p-2 border rounded"
      />
      <table className="w-full border">
        <thead className="bg-gray-100">
          <tr>
            <th></th>
            <th>Mã</th>
            <th>Tiếng Việt</th>
            <th>Tiếng Anh</th>
            <th>Tiếng Hàn</th>
            <th>Parent</th>
            <th>Ghi chú</th>
            <th>Trạng thái</th>
          </tr>
        </thead>
        <tbody>
          {renderRows(buildTree(filteredData))}
        </tbody>
      </table>
    </div>
  );
};

export default CostCenterManagement;
