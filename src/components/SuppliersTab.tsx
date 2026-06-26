import React, { useState } from "react";
import { Supplier } from "../utils/excelProcessor";
import { EditIcon, TrashIcon, PlusIcon, SupplierIcon } from "./Icons";

interface SuppliersTabProps {
  suppliers: Supplier[];
  onEditSupplier: (supplier: Supplier) => void;
  onDeleteSupplier: (code: string) => void;
  onAddSupplier: () => void;
}

export const SuppliersTab: React.FC<SuppliersTabProps> = ({
  suppliers,
  onEditSupplier,
  onDeleteSupplier,
  onAddSupplier
}) => {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredSuppliers = suppliers.filter(
    s =>
      s.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.taxCode.includes(searchQuery)
  );

  return (
    <div className="glass-card">
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "20px"
        }}
      >
        <h2 className="card-title" style={{ margin: 0, display: "flex", alignItems: "center", gap: "8px" }}>
          <SupplierIcon /> Danh Sách Bộ Lọc & Thông Tin NCC
        </h2>
        <div style={{ display: "flex", gap: "12px" }}>
          <input
            type="text"
            placeholder="Tìm kiếm NCC..."
            className="form-control"
            style={{ width: "240px", padding: "6px 12px" }}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button className="btn-primary" style={{ padding: "8px 16px", display: "flex", alignItems: "center", gap: "6px" }} onClick={onAddSupplier}>
            <PlusIcon /> Thêm Mới
          </button>
        </div>
      </div>

      <div className="modern-table-container">
        <table className="modern-table">
          <thead>
            <tr>
              <th>Mã Lọc (NCC)</th>
              <th>Tên Đầy Đủ</th>
              <th>Mã Số Thuế</th>
              <th>Địa Chỉ</th>
              <th>Điện Thoại</th>
              <th>Hành Động</th>
            </tr>
          </thead>
          <tbody>
            {filteredSuppliers.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ textAlign: "center", color: "#64748b" }}>
                  Chưa có nhà cung cấp nào được cấu hình hoặc không tìm thấy kết quả phù hợp.
                </td>
              </tr>
            ) : (
              filteredSuppliers.map((s, idx) => (
                <tr key={idx}>
                  <td style={{ fontWeight: 600, color: "#60a5fa" }}>{s.code}</td>
                  <td>{s.fullName}</td>
                  <td>{s.taxCode}</td>
                  <td style={{ fontSize: "0.85rem", maxWidth: "200px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }} title={s.address}>
                    {s.address}
                  </td>
                  <td>{s.phone || "-"}</td>
                  <td>
                    <div className="table-actions">
                      <button
                        className="btn-icon edit"
                        title="Chỉnh sửa"
                        onClick={() => onEditSupplier(s)}
                        style={{ display: "flex", alignItems: "center", justifyContent: "center" }}
                      >
                        <EditIcon style={{ width: "16px", height: "16px" }} />
                      </button>
                      <button
                        className="btn-icon delete"
                        title="Xóa cấu hình"
                        onClick={() => onDeleteSupplier(s.code)}
                        style={{ display: "flex", alignItems: "center", justifyContent: "center" }}
                      >
                        <TrashIcon style={{ width: "16px", height: "16px" }} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
export default SuppliersTab;
