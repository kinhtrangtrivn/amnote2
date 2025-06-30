             disabled={!column.visible}
                          />
                        </div>
                        
                        <div className="col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Width
                          </label>
                          <input
                            type="number"
                            value={column.width}
                            onChange={(e) => handleColumnConfigChange(column.id, 'width', parseInt(e.target.value) || 100)}
                            min="50"
                            max="500"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            disabled={!column.visible}
                          />
                        </div>
                      </div>
                      
                      {/* Ghim cột */}
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={column.pinned}
                          onChange={(e) => handleColumnConfigChange(column.id, 'pinned', e.target.checked)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          disabled={!column.visible}
                        />
                        <label className="text-sm text-gray-700">
                          Ghim cột bên trái
                        </label>
                      </div>
                      
                      {/* Hiển thị vị trí sticky nếu được ghim */}
                      {column.pinned && column.visible && (
                        <div className="bg-blue-50 border border-blue-200 rounded p-2">
                          <div className="text-xs text-blue-700">
                            <Icons.Info size={12} className="inline mr-1" />
                            Vị trí sticky: {stickyPositions[column.id]}px từ trái
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Action buttons - Fixed at bottom */}
              <div className="p-6 border-t border-gray-200 flex space-x-3">
                <button
                  onClick={() => {
                    // Reset to default
                    setColumnConfigs([
                      { id: '1', dataField: 'code', displayName: 'Mã đối tượng', width: 150, visible: true, pinned: false, originalOrder: 0 },
                      { id: '2', dataField: 'nameVi', displayName: 'Tiếng Việt', width: 200, visible: true, pinned: false, originalOrder: 1 },
                      { id: '3', dataField: 'nameEn', displayName: 'Tiếng Anh', width: 200, visible: true, pinned: false, originalOrder: 2 },
                      { id: '4', dataField: 'nameKo', displayName: 'Tiếng Hàn', width: 200, visible: true, pinned: false, originalOrder: 3 },
                      { id: '5', dataField: 'notes', displayName: 'Ghi chú', width: 250, visible: true, pinned: false, originalOrder: 4 },
                    ]);
                  }}
                  className="flex-1 px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Đặt lại mặc định
                </button>
                <button
                  onClick={() => setShowSettingsPanel(false)}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Áp dụng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL THÊM/SỬA */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-bold text-gray-900">
                {editingItem ? 'Chỉnh sửa đối tượng' : 'Thêm mới đối tượng'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <Icons.X size={20} className="text-gray-500"/>
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Mã & Đối tượng gốc */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mã đối tượng <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text" required
                    value={formData.code}
                    onChange={e => setFormData(d => ({ ...d, code: e.target.value }))}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
                    placeholder="Nhập mã đối tượng"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Đối tượng gốc
                    {editingItem && (
                      <span className="text-xs text-gray-500 ml-2">
                        (Ẩn đối tượng hiện tại và các con)
                      </span>
                    )}
                  </label>
                  <select
                    value={formData.parentObject}
                    onChange={e => setFormData(d => ({ ...d, parentObject: e.target.value }))}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
                  >
                    <option value="">Không có cha</option>
                    {parentOptions.map(opt => (
                      <option key={opt.id} value={opt.id}>
                        {opt.code} – {opt.nameVi}
                      </option>
                    ))}
                  </select>
                  {editingItem && parentOptions.length < doiTuongList.length - 1 && (
                    <div className="mt-1 text-xs text-amber-600 flex items-center">
                      <Icons.Info size={12} className="mr-1" />
                      Một số tùy chọn bị ẩn để tránh vòng lặp phân cấp
                    </div>
                  )}
                </div>
              </div>

              {/* Tên & Ghi chú */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tên tiếng Việt <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text" required
                    value={formData.nameVi}
                    onChange={e => setFormData(d => ({ ...d, nameVi: e.target.value }))}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
                    placeholder="Nhập tên tiếng Việt"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tên tiếng Anh
                  </label>
                  <input
                    type="text"
                    value={formData.nameEn}
                    onChange={e => setFormData(d => ({ ...d, nameEn: e.target.value }))}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
                    placeholder="Nhập tên tiếng Anh"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tên tiếng Hàn
                  </label>
                  <input
                    type="text"
                    value={formData.nameKo}
                    onChange={e => setFormData(d => ({ ...d, nameKo: e.target.value }))}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
                    placeholder="Nhập tên tiếng Hàn"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ghi chú
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={e => setFormData(d => ({ ...d, notes: e.target.value }))}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
                    placeholder="Nhập ghi chú"
                  />
                </div>
              </div>

              {/* Buttons */}
              <div className="flex justify-end space-x-4 pt-4 border-t">
                <button type="button" onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200"
                >
                  Hủy
                </button>
                <button type="submit"
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center space-x-2"
                >
                  <Icons.Save size={16}/> <span>{editingItem ? 'Cập nhật' : 'Thêm mới'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CostObjectPage;