import React from "react";
import { MappingConfig } from "../utils/excelProcessor";

interface ExcelPreviewGridProps {
  mapping: MappingConfig;
  activeField: string | null;
}

interface CellMeta {
  label: string;
  fieldKey: string;
  colorClass: string;
}

export const ExcelPreviewGrid: React.FC<ExcelPreviewGridProps> = ({
  mapping,
  activeField
}) => {
  // Helper to parse cell like "B6" -> { col: "B", row: 6 }
  const parseCell = (cellStr: string) => {
    if (!cellStr) return null;
    const match = cellStr.trim().toUpperCase().match(/^([A-Z]+)([0-9]+)$/);
    if (!match) return null;
    return {
      col: match[1],
      row: parseInt(match[2], 10)
    };
  };

  // Helper to check if a specific col and row matches a config
  const getCellMeta = (col: string, row: number): CellMeta | null => {
    const { header, table, footer } = mapping;
    const startRow = table.start_row;
    
    // 1. Check Header Cells
    if (parseCell(header.supplier_name)?.col === col && parseCell(header.supplier_name)?.row === row) {
      return { label: "Tên đầy đủ NCC", fieldKey: "header.supplier_name", colorClass: "cell-header-supplier" };
    }
    if (parseCell(header.address)?.col === col && parseCell(header.address)?.row === row) {
      return { label: "Địa chỉ NCC", fieldKey: "header.address", colorClass: "cell-header-address" };
    }
    if (parseCell(header.tax_code)?.col === col && parseCell(header.tax_code)?.row === row) {
      return { label: "Mã số thuế", fieldKey: "header.tax_code", colorClass: "cell-header-tax" };
    }
    if (parseCell(header.phone)?.col === col && parseCell(header.phone)?.row === row) {
      return { label: "Điện thoại", fieldKey: "header.phone", colorClass: "cell-header-phone" };
    }
    if (parseCell(header.date)?.col === col && parseCell(header.date)?.row === row) {
      return { label: "Ngày lập HĐ", fieldKey: "header.date", colorClass: "cell-header-date" };
    }
    if (parseCell(header.supplier_code_cell)?.col === col && parseCell(header.supplier_code_cell)?.row === row) {
      return { label: "Mã viết tắt NCC", fieldKey: "header.supplier_code_cell", colorClass: "cell-header-code" };
    }
    if (parseCell(header.invoice_number_cell)?.col === col && parseCell(header.invoice_number_cell)?.row === row) {
      return { label: "Số hóa đơn", fieldKey: "header.invoice_number_cell", colorClass: "cell-header-invoice" };
    }
    if (parseCell(header.currency)?.col === col && parseCell(header.currency)?.row === row) {
      return { label: "Tiền tệ", fieldKey: "header.currency", colorClass: "cell-header-currency" };
    }
    if (header.fax && parseCell(header.fax)?.col === col && parseCell(header.fax)?.row === row) {
      return { label: "Fax", fieldKey: "header.fax", colorClass: "cell-header-fax" };
    }

    // 2. Check Data Table Columns (simulating 2 rows starting at startRow)
    const isTableRow = row === startRow || row === startRow + 1;
    if (isTableRow) {
      const idxSuffix = row === startRow ? " (Dòng 1)" : " (Dòng cuối)";
      if (table.columns.item_code === col) {
        return { label: `Mã hàng${idxSuffix}`, fieldKey: "table.columns.item_code", colorClass: "cell-table-item" };
      }
      if (table.columns.description === col) {
        return { label: `Tên hàng${idxSuffix}`, fieldKey: "table.columns.description", colorClass: "cell-table-desc" };
      }
      if (table.columns.unit === col) {
        return { label: `Đơn vị${idxSuffix}`, fieldKey: "table.columns.unit", colorClass: "cell-table-unit" };
      }
      if (table.columns.quantity === col) {
        return { label: `Số lượng${idxSuffix}`, fieldKey: "table.columns.quantity", colorClass: "cell-table-qty" };
      }
      if (table.columns.price === col) {
        return { label: `Đơn giá${idxSuffix}`, fieldKey: "table.columns.price", colorClass: "cell-table-price" };
      }
      if (table.columns.amount === col) {
        return { label: `Thành tiền${idxSuffix}`, fieldKey: "table.columns.amount", colorClass: "cell-table-amount" };
      }
    }

    // 3. Check Footer Cells (Offsets relative to startRow + 2)
    // In template with 2 default rows, total row is (startRow + 2) + offset
    const tableEndRow = startRow + 2; 
    
    if (footer.total_payment_col === col && row === tableEndRow + footer.total_before_tax_offset) {
      return { label: "Tổng tiền chưa thuế", fieldKey: "footer.total_before_tax_offset", colorClass: "cell-footer-subtotal" };
    }
    if (footer.vat_rate_col === col && row === tableEndRow + footer.vat_rate_offset) {
      return { label: "Thuế suất GTGT", fieldKey: "footer.vat_rate_offset", colorClass: "cell-footer-vat-rate" };
    }
    if (footer.vat_amount_col === col && row === tableEndRow + footer.vat_amount_offset) {
      return { label: "Tiền thuế GTGT", fieldKey: "footer.vat_amount_offset", colorClass: "cell-footer-vat-amount" };
    }
    if (footer.total_payment_col === col && row === tableEndRow + footer.total_payment_offset) {
      return { label: "Tổng thanh toán", fieldKey: "footer.total_payment_offset", colorClass: "cell-footer-total" };
    }
    if (footer.total_words_col === col && row === tableEndRow + footer.total_words_offset) {
      return { label: "Tiền viết bằng chữ", fieldKey: "footer.total_words_offset", colorClass: "cell-footer-words" };
    }
    if (footer.delivery_place_col === col && row === tableEndRow + (footer.delivery_place_offset ?? 7)) {
      return { label: "Địa điểm giao hàng", fieldKey: "footer.delivery_place_offset", colorClass: "cell-footer-delivery" };
    }
    if (footer.payment_terms_col === col && row === tableEndRow + (footer.payment_terms_offset ?? 8)) {
      return { label: "Điều khoản thanh toán", fieldKey: "footer.payment_terms_offset", colorClass: "cell-footer-payment" };
    }
    if (footer.notes_col === col && row === tableEndRow + (footer.notes_offset ?? 9)) {
      return { label: "Ghi chú footer", fieldKey: "footer.notes_offset", colorClass: "cell-footer-notes" };
    }

    return null;
  };

  const COLS = ["A", "B", "C", "D", "E", "F", "G", "H"];
  const startRow = mapping.table.start_row || 13;
  // Calculate max row index dynamically based on largest offset
  const maxFooterOffset = Math.max(
    mapping.footer.total_before_tax_offset,
    mapping.footer.vat_rate_offset,
    mapping.footer.vat_amount_offset,
    mapping.footer.total_payment_offset,
    mapping.footer.total_words_offset,
    mapping.footer.delivery_place_offset ?? 7,
    mapping.footer.payment_terms_offset ?? 8,
    mapping.footer.notes_offset ?? 9
  );
  const rowsCount = Math.max(20, startRow + 2 + maxFooterOffset + 2);
  const rows = Array.from({ length: rowsCount }, (_, i) => i + 1);

  return (
    <div className="mapping-preview-side">
      <div className="preview-header">
        <span>BẢN XEM TRƯỚC EXCEL TEMPLATE</span>
        <div className="legend-indicators">
          <span className="legend-item"><span className="legend-dot header-dot"></span> Header</span>
          <span className="legend-item"><span className="legend-dot table-dot"></span> Sản Phẩm</span>
          <span className="legend-item"><span className="legend-dot footer-dot"></span> Footer</span>
        </div>
      </div>
      
      <div className="excel-mockup-container">
        <table className="excel-mockup-table">
          <thead>
            <tr>
              <th className="excel-row-header-col"></th>
              {COLS.map(c => <th key={c}>{c}</th>)}
            </tr>
          </thead>
          <tbody>
            {rows.map(rowNum => {
              const isProductSection = rowNum === startRow || rowNum === startRow + 1;
              let rowClass = "";
              if (isProductSection) rowClass = "excel-row-products";
              
              return (
                <tr key={rowNum} className={rowClass}>
                  <td className="excel-row-header-num">{rowNum}</td>
                  {COLS.map(col => {
                    const cellMeta = getCellMeta(col, rowNum);
                    const isFieldActive = cellMeta && activeField === cellMeta.fieldKey;
                    const cellClass = [
                      cellMeta ? cellMeta.colorClass : "",
                      isFieldActive ? "cell-active-highlight" : ""
                    ].filter(Boolean).join(" ");
                    
                    return (
                      <td 
                        key={col} 
                        className={cellClass}
                        title={cellMeta ? `${cellMeta.label} (${col}${rowNum})` : `${col}${rowNum}`}
                      >
                        {cellMeta ? (
                          <div className="cell-label-content">
                            <span className="cell-label-text">{cellMeta.label}</span>
                            <span className="cell-coord">{col}{rowNum}</span>
                          </div>
                        ) : null}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ExcelPreviewGrid;
