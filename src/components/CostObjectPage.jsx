import React, { useState } from 'react';

const initialData = [
  {
    id: 1,
    type: "Phân xưởng",
    name: "Phân xưởng A",
    description: "Sản xuất linh kiện",
    account: "621",
    status: true,
  },
  {
    id: 2,
    type: "Sản phẩm",
    name: "Sản phẩm B",
    description: "Thành phẩm chính",
    account: "622",
    status: true,
  },
];

const objectTypes = ["Phân xưởng", "Sản phẩm", "Quy trình sản xuất", "Công đoạn sản xuất"];

export default function CostObjectPage() {
  const [data, setData] = useState(initialData);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [search, setSearch] = useState("");

  const filteredData = data.filter((item) =>
    item.name.toLowerCase().includes(search.toLowerCase()) ||
    item.type.toLowerCase().includes(search.toLowerCase())
  );

  const [form, setForm] = useState({
    type: "",
    name: "",
    description: "",
    account: "",
    status: true,
  });

  const openModal = (item = null) => {
    setEditing(item);
    setForm(item || { type: "", name: "", description: "", account: "", status: true });
    setShowModal(true);
  };

  const save = () => {
    if (editing) {
      setData(data.map(d => d.id === editing.id ? { ...editing, ...form } : d));
    } else {
      setData([...data, { ...form, id: Date.now() }]);
    }
    setShowModal(false);
  };

  const remove = (id) => {
    if (window.confirm("Bạn có chắc chắn muốn xoá?")) {
      setData(data.filter(d => d.id !== id));
    }
  };

  return (
    <div className="p-4">
      {/* Toolbar */}
      <div className="flex flex-wrap justify-between items-center bg-red-600 text-white p-3 rounded">
        <div className="font-bold text-lg">Đối tượng tập hợp chi phí</div>
        <div className="space-x-2 mt-2 md:mt-0">
          <button className="bg-white text-red-600 px-3 py-1 rounded" onClick={() => openModal()}>+ Thêm</button>
          <button className="bg-white text-red-600 px-3 py-1 rounded">Nhập Excel</button>
          <button className="bg-white text-red-600 px-3 py-1 rounded">Xuất Excel</button>
        </div>
      </div>

      {/* Search */}
      <div className="mt-4">
        <input
          type="text"
          className="w-full md:w-1/3 border px-3 py-2 rounded"
          placeholder="Tìm kiếm theo tên hoặc loại đối tượng..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Table */}
      <div className="overflow-x-auto mt-4">
        <table className="min-w-full border rounded">
          <thead className="bg-gray-100 text-left">
            <tr>
              <th className="p-2 border">Loại đối tượng</th>
              <th className="p-2 border">Tên</th>
              <th className="p-2 border">Mô tả</th>
              <th className="p-2 border">Tài khoản</th>
              <th className="p-2 border">Trạng thái</th>
              <th className="p-2 border">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.map((item) => (
              <tr key={item.id}>
                <td className="p-2 border">{item.type}</td>
                <td className="p-2 border">{item.name}</td>
                <td className="p-2 border">{item.description}</td>
                <td className="p-2 border">{item.account}</td>
                <td className="p-2 border">{item.status ? "Hoạt động" : "Không hoạt động"}</td>
                <td className="p-2 border space-x-2">
                  <button className="text-blue-600" onClick={() => openModal(item)}>Sửa</button>
                  <button className="text-red-600" onClick={() => remove(item.id)}>Xoá</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white w-full max-w-lg p-6 rounded shadow">
            <h2 className="text-lg font-bold mb-4">{editing ? "Sửa" : "Thêm"} đối tượng</h2>
            <div className="space-y-3">
              <select
                className="w-full border p-2 rounded"
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
              >
                <option value="">-- Loại đối tượng --</option>
                {objectTypes.map((type) => (
                  <option key={type}>{type}</option>
                ))}
              </select>
              <input
                className="w-full border p-2 rounded"
                placeholder="Tên đối tượng"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
              <textarea
                className="w-full border p-2 rounded"
                placeholder="Mô tả chi tiết"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
              <input
                className="w-full border p-2 rounded"
                placeholder="Tài khoản chi phí"
                value={form.account}
                onChange={(e) => setForm({ ...form, account: e.target.value })}
              />
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.checked })}
                />
                <span>Hoạt động</span>
              </label>
            </div>
            <div className="mt-4 flex justify-end space-x-2">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 bg-gray-300 rounded">Huỷ</button>
              <button onClick={save} className="px-4 py-2 bg-red-600 text-white rounded">Lưu</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
