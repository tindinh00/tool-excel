import React, { useState, useEffect } from "react";
import { MappingConfig } from "../utils/excelProcessor";
import { ConfigIcon, SaveIcon, InfoIcon } from "./Icons";
import ExcelPreviewGrid from "./ExcelPreviewGrid";
import OffsetHelpModal from "./OffsetHelpModal";

interface MappingTabProps {
  initialMapping: MappingConfig;
  onSave: (mapping: MappingConfig) => void;
}

export const MappingTab: React.FC<MappingTabProps> = ({
  initialMapping,
  onSave
}) => {
  const [mapping, setMapping] = useState<MappingConfig>({ ...initialMapping });
  const [activeField, setActiveField] = useState<string | null>(null);
  const [showOffsetHelp, setShowOffsetHelp] = useState(false);

  useEffect(() => {
    setMapping({ ...initialMapping });
  }, [initialMapping]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(mapping);
  };

  // Field focus/hover event helpers
  const focusProps = (fieldKey: string) => ({
    onFocus: () => setActiveField(fieldKey),
    onBlur: () => setActiveField(null),
    onMouseEnter: () => setActiveField(fieldKey),
    onMouseLeave: () => setActiveField(null)
  });

  return (
    <div className="glass-card" style={{ maxWidth: "1280px", margin: "0 auto" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
        <ConfigIcon style={{ fontSize: "1.8rem", color: "var(--color-primary)" }} />
        <div>
          <h2 className="card-title" style={{ margin: 0 }}>Cấu Hình Toạ Độ Ô Mapping Trên Template</h2>
          <p style={{ margin: "4px 0 0 0", color: "var(--color-muted)", fontSize: "0.85rem" }}>
            Di chuột hoặc nhấn vào các ô nhập liệu bên trái để xem vị trí tương ứng trên Excel Mockup bên phải.
          </p>
        </div>
      </div>

      <div className="mapping-split-container">
        {/* Form Settings Side */}
        <div className="mapping-form-side">
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            
            {/* SECTION 1: HEADER */}
            <div className="form-section-card">
              <h3 className="section-title">1. Thông Tin Chung (Header)</h3>
              <div className="form-grid">
                <div className="form-group">
                  <label>Tên nhà cung cấp đầy đủ</label>
                  <span className="form-group-desc">Ô điền tên nhà cung cấp trên file mẫu (B6)</span>
                  <input
                    type="text"
                    className="form-control"
                    value={mapping.header.supplier_name}
                    onChange={e => setMapping({
                      ...mapping,
                      header: { ...mapping.header, supplier_name: e.target.value }
                    })}
                    {...focusProps("header.supplier_name")}
                  />
                </div>
                <div className="form-group">
                  <label>Địa chỉ công ty</label>
                  <span className="form-group-desc">Ô điền địa chỉ công ty trên file mẫu (B7)</span>
                  <input
                    type="text"
                    className="form-control"
                    value={mapping.header.address}
                    onChange={e => setMapping({
                      ...mapping,
                      header: { ...mapping.header, address: e.target.value }
                    })}
                    {...focusProps("header.address")}
                  />
                </div>
                <div className="form-group">
                  <label>Mã số thuế</label>
                  <span className="form-group-desc">Ô điền mã số thuế trên file mẫu (B8)</span>
                  <input
                    type="text"
                    className="form-control"
                    value={mapping.header.tax_code}
                    onChange={e => setMapping({
                      ...mapping,
                      header: { ...mapping.header, tax_code: e.target.value }
                    })}
                    {...focusProps("header.tax_code")}
                  />
                </div>
                <div className="form-group">
                  <label>Điện thoại</label>
                  <span className="form-group-desc">Ô điền số điện thoại liên hệ (B9)</span>
                  <input
                    type="text"
                    className="form-control"
                    value={mapping.header.phone}
                    onChange={e => setMapping({
                      ...mapping,
                      header: { ...mapping.header, phone: e.target.value }
                    })}
                    {...focusProps("header.phone")}
                  />
                </div>
                <div className="form-group">
                  <label>Ngày lập hóa đơn</label>
                  <span className="form-group-desc">Ô điền ngày xuất hóa đơn (F6)</span>
                  <input
                    type="text"
                    className="form-control"
                    value={mapping.header.date}
                    onChange={e => setMapping({
                      ...mapping,
                      header: { ...mapping.header, date: e.target.value }
                    })}
                    {...focusProps("header.date")}
                  />
                </div>
                <div className="form-group">
                  <label>Ô Số Đơn Hàng (Invoice No)</label>
                  <span className="form-group-desc">Ô điền số hiệu đơn đặt hàng (G7)</span>
                  <input
                    type="text"
                    className="form-control"
                    value={mapping.header.invoice_number_cell}
                    onChange={e => setMapping({
                      ...mapping,
                      header: { ...mapping.header, invoice_number_cell: e.target.value }
                    })}
                    {...focusProps("header.invoice_number_cell")}
                  />
                </div>
                <div className="form-group">
                  <label>Ô Mã Rút Gọn NCC</label>
                  <span className="form-group-desc">Mã viết tắt nhà cung cấp viết vào ô G6</span>
                  <input
                    type="text"
                    className="form-control"
                    value={mapping.header.supplier_code_cell}
                    onChange={e => setMapping({
                      ...mapping,
                      header: { ...mapping.header, supplier_code_cell: e.target.value }
                    })}
                    {...focusProps("header.supplier_code_cell")}
                  />
                </div>
                <div className="form-group">
                  <label>Loại tiền tệ</label>
                  <span className="form-group-desc">Ô chứa đơn vị tiền tệ VND, USD... (F8)</span>
                  <input
                    type="text"
                    className="form-control"
                    value={mapping.header.currency}
                    onChange={e => setMapping({
                      ...mapping,
                      header: { ...mapping.header, currency: e.target.value }
                    })}
                    {...focusProps("header.currency")}
                  />
                </div>
                <div className="form-group">
                  <label>Fax</label>
                  <span className="form-group-desc">Ô điền số Fax liên hệ nếu có (F9)</span>
                  <input
                    type="text"
                    className="form-control"
                    value={mapping.header.fax}
                    onChange={e => setMapping({
                      ...mapping,
                      header: { ...mapping.header, fax: e.target.value }
                    })}
                    {...focusProps("header.fax")}
                  />
                </div>
              </div>
            </div>

            {/* SECTION 2: BẢNG SẢN PHẨM */}
            <div className="form-section-card">
              <h3 className="section-title">2. Bảng Danh Sách Sản Phẩm</h3>
              
              <div className="form-grid" style={{ marginBottom: "16px" }}>
                <div className="form-group">
                  <label>Dòng bắt đầu điền dữ liệu</label>
                  <span className="form-group-desc">Dòng đầu tiên bắt đầu danh sách sản phẩm (Dòng 13)</span>
                  <input
                    type="number"
                    className="form-control"
                    value={mapping.table.start_row}
                    onChange={e => setMapping({
                      ...mapping,
                      table: { ...mapping.table, start_row: parseInt(e.target.value, 10) }
                    })}
                    {...focusProps("table.start_row")}
                  />
                </div>
                <div className="form-group">
                  <label>Số dòng mẫu mặc định (template)</label>
                  <span className="form-group-desc">Số lượng dòng sản phẩm mẫu có sẵn trong file gốc (2)</span>
                  <input
                    type="number"
                    className="form-control"
                    value={mapping.table.template_rows_count}
                    onChange={e => setMapping({
                      ...mapping,
                      table: { ...mapping.table, template_rows_count: parseInt(e.target.value, 10) }
                    })}
                    {...focusProps("table.template_rows_count")}
                  />
                </div>
              </div>

              <div style={{ fontSize: "0.85rem", fontWeight: "600", color: "var(--color-ink)", marginBottom: "10px" }}>Cấu hình Cột dữ liệu:</div>
              <div className="form-grid">
                <div className="form-group">
                  <label>Cột Mã hàng</label>
                  <span className="form-group-desc">Cột điền mã hiệu sản phẩm (Cột A)</span>
                  <input
                    type="text"
                    className="form-control"
                    value={mapping.table.columns.item_code}
                    onChange={e => setMapping({
                      ...mapping,
                      table: {
                        ...mapping.table,
                        columns: { ...mapping.table.columns, item_code: e.target.value }
                      }
                    })}
                    {...focusProps("table.columns.item_code")}
                  />
                </div>
                <div className="form-group">
                  <label>Cột Tên hàng (Description)</label>
                  <span className="form-group-desc">Cột điền tên mô tả chi tiết sản phẩm (Cột B)</span>
                  <input
                    type="text"
                    className="form-control"
                    value={mapping.table.columns.description}
                    onChange={e => setMapping({
                      ...mapping,
                      table: {
                        ...mapping.table,
                        columns: { ...mapping.table.columns, description: e.target.value }
                      }
                    })}
                    {...focusProps("table.columns.description")}
                  />
                </div>
                <div className="form-group">
                  <label>Cột Đơn vị tính (Unit)</label>
                  <span className="form-group-desc">Cột điền đơn vị tính kg, bộ, cái... (Cột C)</span>
                  <input
                    type="text"
                    className="form-control"
                    value={mapping.table.columns.unit}
                    onChange={e => setMapping({
                      ...mapping,
                      table: {
                        ...mapping.table,
                        columns: { ...mapping.table.columns, unit: e.target.value }
                      }
                    })}
                    {...focusProps("table.columns.unit")}
                  />
                </div>
                <div className="form-group">
                  <label>Cột Số lượng</label>
                  <span className="form-group-desc">Cột điền số lượng mua (Cột D)</span>
                  <input
                    type="text"
                    className="form-control"
                    value={mapping.table.columns.quantity}
                    onChange={e => setMapping({
                      ...mapping,
                      table: {
                        ...mapping.table,
                        columns: { ...mapping.table.columns, quantity: e.target.value }
                      }
                    })}
                    {...focusProps("table.columns.quantity")}
                  />
                </div>
                <div className="form-group">
                  <label>Cột Đơn giá</label>
                  <span className="form-group-desc">Cột điền đơn giá sản phẩm (Cột E)</span>
                  <input
                    type="text"
                    className="form-control"
                    value={mapping.table.columns.price}
                    onChange={e => setMapping({
                      ...mapping,
                      table: {
                        ...mapping.table,
                        columns: { ...mapping.table.columns, price: e.target.value }
                      }
                    })}
                    {...focusProps("table.columns.price")}
                  />
                </div>
                <div className="form-group">
                  <label>Cột Thành tiền</label>
                  <span className="form-group-desc">Cột điền thành tiền sản phẩm (Cột F)</span>
                  <input
                    type="text"
                    className="form-control"
                    value={mapping.table.columns.amount}
                    onChange={e => setMapping({
                      ...mapping,
                      table: {
                        ...mapping.table,
                        columns: { ...mapping.table.columns, amount: e.target.value }
                      }
                    })}
                    {...focusProps("table.columns.amount")}
                  />
                </div>
              </div>
            </div>

            {/* SECTION 3: FOOTER */}
            <div className="form-section-card">
              <h3 className="section-title">3. Tổng Cộng & Chữ Ký (Footer)</h3>
              <p style={{ color: "var(--color-muted)", fontSize: "0.8rem", marginTop: "-8px", marginBottom: "16px", display: "flex", alignItems: "center", gap: "6px" }}>
                Các toạ độ bên dưới tính bằng số dòng lệch (offset) so với dòng cuối cùng của bảng sản phẩm.
                <button 
                  type="button" 
                  onClick={() => setShowOffsetHelp(true)}
                  style={{
                    background: "none",
                    border: "none",
                    color: "var(--color-primary)",
                    cursor: "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    padding: 0
                  }}
                  title="Xem giải thích chi tiết"
                >
                  <InfoIcon style={{ width: "14px", height: "14px" }} />
                </button>
              </p>
              
              <div className="form-grid">
                <div className="form-group">
                  <label>Dòng Tổng chưa thuế (Offset)</label>
                  <span className="form-group-desc">Số dòng cách từ cuối bảng đến dòng Tổng tiền (VD: 0)</span>
                  <input
                    type="number"
                    className="form-control"
                    value={mapping.footer.total_before_tax_offset}
                    onChange={e => setMapping({
                      ...mapping,
                      footer: { ...mapping.footer, total_before_tax_offset: parseInt(e.target.value, 10) }
                    })}
                    {...focusProps("footer.total_before_tax_offset")}
                  />
                </div>
                <div className="form-group">
                  <label>Cột tổng chưa thuế</label>
                  <span className="form-group-desc">Cột chứa ô tổng tiền trước thuế (thường là F)</span>
                  <input
                    type="text"
                    className="form-control"
                    value={mapping.footer.total_payment_col}
                    onChange={e => setMapping({
                      ...mapping,
                      footer: { ...mapping.footer, total_payment_col: e.target.value }
                    })}
                    {...focusProps("footer.total_before_tax_offset")}
                  />
                </div>
                
                <div className="form-group">
                  <label>Dòng Thuế suất VAT (Offset)</label>
                  <span className="form-group-desc">Số dòng cách đến dòng ghi phần trăm thuế (VD: 1)</span>
                  <input
                    type="number"
                    className="form-control"
                    value={mapping.footer.vat_rate_offset}
                    onChange={e => setMapping({
                      ...mapping,
                      footer: { ...mapping.footer, vat_rate_offset: parseInt(e.target.value, 10) }
                    })}
                    {...focusProps("footer.vat_rate_offset")}
                  />
                </div>
                <div className="form-group">
                  <label>Cột thuế suất VAT</label>
                  <span className="form-group-desc">Cột chứa tỷ lệ phần trăm thuế (thường là C)</span>
                  <input
                    type="text"
                    className="form-control"
                    value={mapping.footer.vat_rate_col}
                    onChange={e => setMapping({
                      ...mapping,
                      footer: { ...mapping.footer, vat_rate_col: e.target.value }
                    })}
                    {...focusProps("footer.vat_rate_offset")}
                  />
                </div>

                <div className="form-group">
                  <label>Dòng Tiền thuế GTGT (Offset)</label>
                  <span className="form-group-desc">Số dòng cách đến dòng điền số tiền thuế (VD: 1)</span>
                  <input
                    type="number"
                    className="form-control"
                    value={mapping.footer.vat_amount_offset}
                    onChange={e => setMapping({
                      ...mapping,
                      footer: { ...mapping.footer, vat_amount_offset: parseInt(e.target.value, 10) }
                    })}
                    {...focusProps("footer.vat_amount_offset")}
                  />
                </div>
                <div className="form-group">
                  <label>Cột tiền thuế GTGT</label>
                  <span className="form-group-desc">Cột chứa tiền thuế GTGT đã tính (thường là F)</span>
                  <input
                    type="text"
                    className="form-control"
                    value={mapping.footer.vat_amount_col}
                    onChange={e => setMapping({
                      ...mapping,
                      footer: { ...mapping.footer, vat_amount_col: e.target.value }
                    })}
                    {...focusProps("footer.vat_amount_offset")}
                  />
                </div>

                <div className="form-group">
                  <label>Dòng Tổng thanh toán (Offset)</label>
                  <span className="form-group-desc">Số dòng cách đến dòng thanh toán sau thuế (VD: 2)</span>
                  <input
                    type="number"
                    className="form-control"
                    value={mapping.footer.total_payment_offset}
                    onChange={e => setMapping({
                      ...mapping,
                      footer: { ...mapping.footer, total_payment_offset: parseInt(e.target.value, 10) }
                    })}
                    {...focusProps("footer.total_payment_offset")}
                  />
                </div>
                <div className="form-group">
                  <label>Cột tổng thanh toán</label>
                  <span className="form-group-desc">Cột tổng số tiền phải trả sau thuế (thường là F)</span>
                  <input
                    type="text"
                    className="form-control"
                    value={mapping.footer.total_payment_col}
                    disabled
                  />
                </div>

                <div className="form-group">
                  <label>Dòng Số tiền bằng chữ (Offset)</label>
                  <span className="form-group-desc">Số dòng cách đến ô viết số tiền bằng chữ (VD: 3)</span>
                  <input
                    type="number"
                    className="form-control"
                    value={mapping.footer.total_words_offset}
                    onChange={e => setMapping({
                      ...mapping,
                      footer: { ...mapping.footer, total_words_offset: parseInt(e.target.value, 10) }
                    })}
                    {...focusProps("footer.total_words_offset")}
                  />
                </div>
                <div className="form-group">
                  <label>Cột viết bằng chữ</label>
                  <span className="form-group-desc">Cột chứa ô ghi chữ tiếng Việt (thường là C)</span>
                  <input
                    type="text"
                    className="form-control"
                    value={mapping.footer.total_words_col}
                    onChange={e => setMapping({
                      ...mapping,
                      footer: { ...mapping.footer, total_words_col: e.target.value }
                    })}
                    {...focusProps("footer.total_words_offset")}
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="btn-primary"
              style={{
                height: "46px",
                fontSize: "1rem",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                marginTop: "12px",
                width: "100%"
              }}
            >
              <SaveIcon /> LƯU CẤU HÌNH MAPPING
            </button>
          </form>
        </div>

        {/* Excel Mockup Preview Side (Delegated to sub-component) */}
        <ExcelPreviewGrid mapping={mapping} activeField={activeField} />
      </div>

      {/* Explanatory Help Modal (Delegated to sub-component) */}
      <OffsetHelpModal isOpen={showOffsetHelp} onClose={() => setShowOffsetHelp(false)} />
    </div>
  );
};

export default MappingTab;
