import React from "react";
import { InfoIcon, ClearIcon } from "./Icons";

interface OffsetHelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const OffsetHelpModal: React.FC<OffsetHelpModalProps> = ({
  isOpen,
  onClose
}) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" style={{ zIndex: 1000 }}>
      <div className="modal-content" style={{ maxWidth: "550px", padding: "24px" }}>
        <div className="modal-header" style={{ marginBottom: "16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h3 style={{ display: "flex", alignItems: "center", gap: "8px", margin: 0, fontSize: "1.2rem" }}>
            <InfoIcon style={{ color: "var(--color-primary)" }} /> Giải thích về "Số dòng lệch" (Offset)
          </h3>
          <button
            type="button"
            className="btn-icon"
            onClick={onClose}
            style={{ display: "flex", alignItems: "center", justifyContent: "center", background: "none", border: "none", cursor: "pointer", color: "var(--color-muted)" }}
          >
            <ClearIcon style={{ width: "20px", height: "20px" }} />
          </button>
        </div>
        <div className="modal-body" style={{ fontSize: "0.9rem", lineHeight: "1.6", color: "var(--color-body)" }}>
          <p style={{ margin: "0 0 12px 0" }}>
            Vì mỗi hóa đơn xuất ra có **số lượng dòng sản phẩm khác nhau**, phần tổng tiền và chữ ký (Footer) ở cuối trang phải dịch chuyển động dựa trên dòng sản phẩm cuối cùng.
          </p>
          <p style={{ margin: "0 0 12px 0" }}>
            <strong>Số dòng lệch (Offset)</strong> xác định khoảng cách (số dòng) bên dưới dòng sản phẩm cuối cùng để điền thông tin tương ứng:
          </p>
          
          <div style={{
            background: "var(--color-surface-soft)",
            border: "1px solid var(--color-hairline)",
            borderRadius: "8px",
            padding: "12px 16px",
            fontFamily: "monospace",
            fontSize: "0.8rem",
            lineHeight: "1.4",
            margin: "16px 0",
            color: "var(--color-body-strong)"
          }}>
            <div>[Dòng 13] Sản phẩm A</div>
            <div>[Dòng 14] Sản phẩm B (Dòng sản phẩm cuối)</div>
            <div style={{ borderBottom: "1px dashed var(--color-hairline)", margin: "6px 0" }}></div>
            <div style={{ color: "var(--color-primary)" }}>[Dòng 15] (Mốc = Dòng cuối + 1) ➔ Offset 0 (Tổng tiền chưa thuế)</div>
            <div style={{ color: "var(--color-primary)" }}>[Dòng 16] (Mốc + 1 dòng) ➔ Offset 1 (Tiền thuế GTGT)</div>
            <div style={{ color: "var(--color-primary)" }}>[Dòng 17] (Mốc + 2 dòng) ➔ Offset 2 (Tổng thanh toán)</div>
            <div style={{ color: "var(--color-primary)" }}>[Dòng 18] (Mốc + 3 dòng) ➔ Offset 3 (Tiền viết bằng chữ)</div>
          </div>

          <p style={{ margin: 0 }}>
            Bạn chỉ cần đếm xem trên file Excel mẫu (Template), các ô tổng cộng nằm cách dòng sản phẩm cuối cùng bao nhiêu dòng trống để điền con số chính xác vào đây.
          </p>
        </div>
        <div className="modal-footer" style={{ marginTop: "20px", display: "flex", justifyContent: "flex-end" }}>
          <button
            type="button"
            className="btn-primary"
            onClick={onClose}
            style={{ padding: "8px 20px" }}
          >
            Đã Hiểu
              </button>
            </div>
          </div>
        </div>
  );
};

export default OffsetHelpModal;
