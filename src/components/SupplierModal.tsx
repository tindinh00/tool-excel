import React, { useState, useEffect } from "react";
import { Supplier } from "../utils/excelProcessor";
import { EditIcon, PlusIcon, ClearIcon, SaveIcon } from "./Icons";

interface SupplierModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingSupplier: Supplier | null;
  onSubmit: (supplier: Supplier) => void;
  initialCode?: string;
}

export const SupplierModal: React.FC<SupplierModalProps> = ({
  isOpen,
  onClose,
  editingSupplier,
  onSubmit,
  initialCode
}) => {
  const [form, setForm] = useState<Supplier>({
    code: "",
    fullName: "",
    address: "",
    taxCode: "",
    phone: "",
    fax: "",
    currency: "VND",
    shortCode: ""
  });

  useEffect(() => {
    if (editingSupplier) {
      setForm({ ...editingSupplier });
    } else {
      setForm({
        code: initialCode || "",
        fullName: "",
        address: "",
        taxCode: "",
        phone: "",
        fax: "",
        currency: "VND",
        shortCode: ""
      });
    }
  }, [editingSupplier, initialCode, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.code.trim() || !form.fullName.trim()) {
      alert("Vui lòng điền mã lọc và tên đầy đủ nhà cung cấp!");
      return;
    }
    onSubmit({
      ...form,
      code: form.code.trim()
    });
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <form onSubmit={handleSubmit}>
          <div className="modal-header">
            <h3 style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              {editingSupplier ? <EditIcon style={{ width: "20px", height: "20px" }} /> : <PlusIcon style={{ width: "20px", height: "20px" }} />}
              {editingSupplier ? "Chỉnh Sửa Nhà Cung Cấp" : "Thêm Mới Nhà Cung Cấp"}
            </h3>
            <button
              type="button"
              className="btn-icon"
              onClick={onClose}
              style={{ display: "flex", alignItems: "center", justifyContent: "center" }}
            >
              <ClearIcon style={{ width: "20px", height: "20px" }} />
            </button>
          </div>
          <div className="modal-body">
            <div className="form-group">
              <label>Mã Bộ Lọc (Phải khớp chính xác cột NCC trong file Excel tổng)</label>
              <input
                type="text"
                className="form-control"
                required
                value={form.code}
                onChange={e => setForm({ ...form, code: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Mã viết tắt NCC (Điền vào ô G6, vd: BBBT, HĐ)</label>
              <input
                type="text"
                className="form-control"
                value={form.shortCode}
                onChange={e => setForm({ ...form, shortCode: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Tên đầy đủ nhà cung cấp (Điền vào B6)</label>
              <input
                type="text"
                className="form-control"
                required
                value={form.fullName}
                onChange={e => setForm({ ...form, fullName: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Địa chỉ công ty (Điền vào B7)</label>
              <input
                type="text"
                className="form-control"
                value={form.address}
                onChange={e => setForm({ ...form, address: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Mã số thuế (Điền vào B8)</label>
              <input
                type="text"
                className="form-control"
                value={form.taxCode}
                onChange={e => setForm({ ...form, taxCode: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Điện thoại (Điền vào B9)</label>
              <input
                type="text"
                className="form-control"
                value={form.phone}
                onChange={e => setForm({ ...form, phone: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Số Fax (Điền vào F9)</label>
              <input
                type="text"
                className="form-control"
                value={form.fax}
                onChange={e => setForm({ ...form, fax: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Đồng tiền giao dịch (F8)</label>
              <input
                type="text"
                className="form-control"
                value={form.currency}
                onChange={e => setForm({ ...form, currency: e.target.value })}
              />
            </div>
          </div>
          <div className="modal-footer">
            <button
              type="button"
              className="btn-secondary"
              onClick={onClose}
              style={{ height: "40px", display: "inline-flex", alignItems: "center", justifyContent: "center", padding: "0 20px" }}
            >
              Hủy
            </button>
            <button
              type="submit"
              className="btn-primary"
              style={{ height: "40px", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "6px", padding: "0 20px" }}
            >
              <SaveIcon /> Lưu Lại
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
export default SupplierModal;
