import React, { useState } from 'react';
import { Plus, Eye, Edit, Trash2, Search, Filter, Building2, X, Save, ChevronLeft, ChevronRight } from 'lucide-react';

import {
  Button,
  Toolbar,
  Item as ToolbarItem,
} from "devextreme-react/toolbar";
import DataGrid, {
  Column,
  Paging,
  Pager,
  SearchPanel,
  HeaderFilter,
  FilterRow,
  Editing,
} from "devextreme-react/data-grid";
import { Popup } from "devextreme-react/popup";
import { SelectBox, TextBox, TagBox, Switch } from "devextreme-react";

const initialData = [
  {
    id: 1,
    type: "Phân xưởng",
    name: "Phân xưởng A",
    description: "Sản xuất linh kiện",
    account: ["621"],
    status: true,
  },
  {
    id: 2,
    type: "Sản phẩm",
    name: "Sản phẩm B",
    description: "Thành phẩm chính",
    account: ["622"],
    status: true,
  },
];

const objectTypes = [
  "Phân xưởng",
  "Sản phẩm",
  "Quy trình sản xuất",
  "Công đoạn sản xuất",
];

export default function CostObjectPage() {
  const [data, setData] = useState(initialData);
  const [popupVisible, setPopupVisible] = useState(false);
  const [formData, setFormData] = useState({});
  const [editId, setEditId] = useState(null);

  const handleAdd = () => {
    setFormData({});
    setEditId(null);
    setPopupVisible(true);
  };

  const handleEdit = (data) => {
    setFormData(data);
    setEditId(data.id);
    setPopupVisible(true);
  };

  const handleSave = () => {
    if (editId) {
      setData((prev) =>
        prev.map((item) => (item.id === editId ? formData : item))
      );
    } else {
      const newId = Math.max(...data.map((d) => d.id)) + 1;
      setData([...data, { ...formData, id: newId }]);
    }
    setPopupVisible(false);
  };

  const handleDelete = (rowData) => {
    setData(data.filter((item) => item.id !== rowData.id));
  };

  return (
    <div className="p-4">
      <Toolbar className="bg-red-600 text-white rounded-t px-4 py-2">
        <ToolbarItem location="before">
          <span className="text-lg font-semibold">Đối tượng tập hợp chi phí</span>
        </ToolbarItem>
        <ToolbarItem location="after" widget="dxButton" options={{ text: "Thêm mới", icon: "plus", onClick: handleAdd }} />
        <ToolbarItem location="after" widget="dxButton" options={{ text: "Xuất Excel", icon: "export" }} />
        <ToolbarItem location="after" widget="dxButton" options={{ text: "Nhập Excel", icon: "upload" }} />
      </Toolbar>

      <DataGrid
        className="shadow border"
        dataSource={data}
        keyExpr="id"
        showBorders={true}
        columnAutoWidth={true}
        allowColumnResizing={true}
      >
        <SearchPanel visible={true} width={300} placeholder="Tìm kiếm tên hoặc loại đối tượng..." />
        <FilterRow visible={true} />
        <HeaderFilter visible={true} />
        <Paging defaultPageSize={5} />
        <Pager showPageSizeSelector={true} allowedPageSizes={[5, 10, 20]} showInfo={true} />

        <Column dataField="type" caption="Loại đối tượng" />
        <Column dataField="name" caption="Tên đối tượng" />
        <Column dataField="description" caption="Mô tả ngắn" />
        <Column dataField="account" caption="Tài khoản chi phí" calculateCellValue={(row) => row.account.join(", ")} />
        <Column
          dataField="status"
          caption="Trạng thái"
          cellRender={({ data }) => (data.status ? "Hoạt động" : "Không hoạt động")}
        />
        <Column
          caption="Hành động"
          cellRender={({ data }) => (
            <div className="space-x-2">
              <Button text="Sửa" onClick={() => handleEdit(data)} />
              <Button text="Xóa" onClick={() => handleDelete(data)} />
            </div>
          )}
        />
      </DataGrid>

      <Popup
        title={editId ? "Sửa đối tượng" : "Thêm đối tượng"}
        visible={popupVisible}
        onHiding={() => setPopupVisible(false)}
        width={600}
        showTitle
      >
        <div className="space-y-4 p-4">
          <SelectBox
            items={objectTypes}
            value={formData.type}
            onValueChanged={(e) => setFormData({ ...formData, type: e.value })}
            placeholder="Loại đối tượng"
          />
          <TextBox
            value={formData.name}
            placeholder="Tên đối tượng"
            onValueChanged={(e) => setFormData({ ...formData, name: e.value })}
          />
          <TextBox
            value={formData.description}
            placeholder="Mô tả"
            onValueChanged={(e) =>
              setFormData({ ...formData, description: e.value })
            }
          />
          <TagBox
            items={["621", "622", "627"]}
            value={formData.account || []}
            onValueChanged={(e) =>
              setFormData({ ...formData, account: e.value })
            }
            placeholder="Tài khoản chi phí"
          />
          <Switch
            value={formData.status ?? true}
            onValueChanged={(e) =>
              setFormData({ ...formData, status: e.value })
            }
            switchedOnText="Hoạt động"
            switchedOffText="Không hoạt động"
          />
          <div className="flex justify-end space-x-2 pt-4">
            <Button text="Hủy" onClick={() => setPopupVisible(false)} />
            <Button text="Lưu" type="default" onClick={handleSave} />
          </div>
        </div>
      </Popup>
    </div>
  );
}