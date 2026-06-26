import ExcelJS from 'exceljs';

export interface Supplier {
  code: string;
  fullName: string;
  address: string;
  taxCode: string;
  phone: string;
  fax: string;
  currency: string;
  shortCode: string;
}

export interface MappingConfig {
  header: {
    supplier_name: string;
    address: string;
    tax_code: string;
    phone: string;
    date: string;
    supplier_code_cell: string;
    invoice_number_cell: string;
    currency: string;
    fax: string;
  };
  table: {
    start_row: number;
    template_rows_count: number;
    columns: {
      item_code: string;
      description: string;
      unit: string;
      quantity: string;
      price: string;
      amount: string;
    };
  };
  footer: {
    total_before_tax_offset: number;
    vat_rate_offset: number;
    vat_rate_col: string;
    vat_amount_offset: number;
    vat_amount_col: string;
    total_payment_offset: number;
    total_payment_col: string;
    total_words_offset: number;
    total_words_col: string;
    delivery_place_offset: number;
    delivery_place_col: string;
    payment_terms_offset: number;
    payment_terms_col: string;
    notes_offset: number;
    notes_col: string;
  };
}

export interface OrderItem {
  hsv: string;
  invoiceNo: string;
  date: string;
  price: number;
  qty: number;
  amount: number;
  ncc: string;
  itemCode: string;
}

// Helpers for Vietnamese number reading
function readGroup3(group: number, isFirst: boolean): string {
  const readDigit = ["không", "một", "hai", "ba", "bốn", "năm", "sáu", "bảy", "tám", "chín"];
  const hundred = Math.floor(group / 100);
  const ten = Math.floor((group % 100) / 10);
  const unit = group % 10;
  let res = "";
  
  if (hundred > 0 || !isFirst) {
    res += readDigit[hundred] + " trăm ";
  }
  
  if (ten === 0 && unit > 0) {
    if (hundred > 0 || !isFirst) {
      res += "lẻ ";
    }
  }
  
  if (ten > 0) {
    if (ten === 1) {
      res += "mười ";
    } else {
      res += readDigit[ten] + " mươi ";
    }
  }
  
  if (unit > 0) {
    if (unit === 1 && ten > 1) {
      res += "mốt ";
    } else if (unit === 5 && ten > 0) {
      res += "lăm ";
    } else {
      res += readDigit[unit] + " ";
    }
  }
  return res.trim();
}

export function numberToWords(number: number): string {
  if (number === 0) return "Không đồng";
  
  const units = ["", "ngàn", "triệu", "tỷ"];
  let numStr = Math.round(number).toString();
  const groups: string[] = [];
  
  while (numStr.length > 0) {
    groups.push(numStr.substring(Math.max(0, numStr.length - 3)));
    numStr = numStr.substring(0, Math.max(0, numStr.length - 3));
  }
  
  const parts: string[] = [];
  for (let i = groups.length - 1; i >= 0; i--) {
    const val = parseInt(groups[i], 10);
    if (val > 0) {
      const isFirst = (i === groups.length - 1);
      const groupText = readGroup3(val, isFirst);
      const unitIndex = i % 3;
      const billionMulti = Math.floor(i / 3);
      
      let unitText = units[unitIndex];
      if (unitIndex === 0 && billionMulti > 0) {
        unitText = "tỷ".repeat(billionMulti);
      }
      
      parts.push(groupText + (unitText ? " " + unitText : ""));
    }
  }
  
  let res = parts.join(", ") + " đồng chẵn";
  res = res.charAt(0).toUpperCase() + res.slice(1);
  return res.replace(/\s+/g, ' ').replace(/,\s*,/g, ',');
}

function evaluateRowFormula(
  formula: string,
  qty: number,
  price: number,
  rowIndex: number,
  cols: { quantity: string; price: string }
): number {
  const qtyRef = new RegExp(`\\b${cols.quantity}${rowIndex}\\b`, 'g');
  const priceRef = new RegExp(`\\b${cols.price}${rowIndex}\\b`, 'g');
  let expr = formula.replace(qtyRef, qty.toString()).replace(priceRef, price.toString());
  if (expr.startsWith('+')) {
    expr = expr.substring(1);
  }
  try {
    if (/^[0-9.+\-*/()\s]+$/.test(expr)) {
      return new Function(`return (${expr})`)();
    }
  } catch (e) {
    console.error('Error evaluating formula expression:', expr, e);
  }
  return qty * price;
}

function evaluateDescFormula(
  formula: string,
  itemCode: string,
  rowIndex: number,
  itemCodeCol: string
): string {
  const ref = `${itemCodeCol}${rowIndex}`;
  let expr = formula.replace(new RegExp(ref, 'g'), JSON.stringify(itemCode));
  expr = expr.replace(/&/g, '+');
  try {
    return new Function(`return (${expr})`)();
  } catch (e) {
    console.error('Error evaluating description formula:', formula, e);
  }
  return `Hạt nhựa ${itemCode}`;
}

function parseExcelDate(dateStr: any): Date | null {
  if (!dateStr) return null;
  if (dateStr instanceof Date) return dateStr;
  
  const str = dateStr.toString().trim();
  // Match DD/MM/YYYY or DD-MM-YYYY
  const parts = str.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/);
  if (parts) {
    const day = parseInt(parts[1], 10);
    const month = parseInt(parts[2], 10) - 1; // 0-indexed
    const year = parseInt(parts[3], 10);
    const date = new Date(year, month, day);
    if (!isNaN(date.getTime())) return date;
  }
  
  // Fallback
  const parsed = new Date(str);
  if (!isNaN(parsed.getTime())) return parsed;
  
  return null;
}

// Parse range helper
function parseRange(rangeStr: string) {
  const parts = rangeStr.split(':');
  const start = parts[0];
  const end = parts[1] || parts[0];
  
  const startCol = start.match(/[A-Z]+/)?.[0] || '';
  const startRow = parseInt(start.match(/\d+/)?.[0] || '0', 10);
  const endCol = end.match(/[A-Z]+/)?.[0] || '';
  const endRow = parseInt(end.match(/\d+/)?.[0] || '0', 10);
  
  return { startCol, startRow, endCol, endRow };
}

// Main processing function
export async function parseInputData(dataBuffer: ArrayBuffer): Promise<OrderItem[]> {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(dataBuffer);
  const worksheet = workbook.getWorksheet(1);
  if (!worksheet) throw new Error('Không tìm thấy sheet nào trong file dữ liệu.');

  const items: OrderItem[] = [];
  
  // Row 1 & 2: Header/Title, Row 3: Column Headers, Data starts from Row 4
  worksheet.eachRow((row, rowNumber) => {
    if (rowNumber < 4) return; // Skip headers
    
    const hsv = row.getCell(1).value?.toString() || '';
    if (hsv === 'TỔNG' || row.getCell(7).value?.toString() === 'TỔNG') return; // Skip footer

    const invoiceNo = row.getCell(2).value?.toString() || '';
    const dateVal = row.getCell(3).value;
    let date = '';
    if (dateVal instanceof Date) {
      const dd = String(dateVal.getDate()).padStart(2, '0');
      const mm = String(dateVal.getMonth() + 1).padStart(2, '0');
      const yyyy = dateVal.getFullYear();
      date = `${dd}/${mm}/${yyyy}`;
    } else if (dateVal) {
      date = dateVal.toString();
    }
    
    const price = parseFloat(row.getCell(4).value?.toString() || '0');
    const qty = parseFloat(row.getCell(5).value?.toString() || '0');
    const amount = parseFloat(row.getCell(6).value?.toString() || '0');
    const ncc = row.getCell(7).value?.toString()?.trim() || '';
    const itemCode = row.getCell(8).value?.toString() || '';

    if (ncc && itemCode) {
      items.push({ hsv, invoiceNo, date, price, qty, amount, ncc, itemCode });
    }
  });

  return items;
}

export async function generateInvoice(
  templateBuffer: ArrayBuffer,
  nccName: string,
  orders: OrderItem[],
  supplierInfo: Supplier | undefined,
  mapping: MappingConfig
): Promise<ArrayBuffer> {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(templateBuffer);
  const sh = workbook.getWorksheet(1);
  if (!sh) throw new Error('Không tìm thấy sheet trong template.');

  let earliestDate: Date | null = null;

  const N = orders.length;
  const startRow = mapping.table.start_row;
  const tempRows = mapping.table.template_rows_count;
  const rowsToAdd = N - tempRows;

  // 1. Shift merges in footer
  const mergesToShift: any[] = [];
  const originalMerges = [...(sh.model.merges || [])];
  
  originalMerges.forEach(rangeStr => {
    const range = parseRange(rangeStr);
    if (range.startRow >= startRow + tempRows) {
      mergesToShift.push(range);
      sh.unMergeCells(rangeStr);
    }
  });

  // 2. Insert/Delete rows in table
  if (rowsToAdd > 0) {
    for (let i = 0; i < rowsToAdd; i++) {
      sh.insertRow(startRow + tempRows, [], 'n');
    }
  } else if (rowsToAdd < 0) {
    // If we only have 1 item, delete row 14 (second template row)
    const rowToDelete = startRow + 1;
    sh.spliceRows(rowToDelete, 1);
  }

  // 3. Copy style and formulas for data table
  const sourceRow = sh.getRow(startRow + 1); // Row 14 style template
  if (rowsToAdd > 0) {
    for (let i = 0; i < rowsToAdd; i++) {
      const targetRowIndex = startRow + tempRows + i;
      const targetRow = sh.getRow(targetRowIndex);
      targetRow.height = sourceRow.height;

      sourceRow.eachCell({ includeEmpty: true }, (cell, colNumber) => {
        const targetCell = targetRow.getCell(colNumber);
        targetCell.style = cell.style;
        if (cell.value && typeof cell.value === 'object' && 'formula' in cell.value) {
          const formula = cell.value.formula || '';
          const adjustedFormula = formula
            .replace(new RegExp(`${startRow + 1}`, 'g'), `${targetRowIndex}`)
            .replace(new RegExp(`${startRow}`, 'g'), `${targetRowIndex}`);
          targetCell.value = { formula: adjustedFormula };
        }
      });
    }
  }

  // 4. Re-apply shifted merges
  const actualShift = rowsToAdd;
  mergesToShift.forEach(range => {
    const newStartRow = range.startRow + actualShift;
    const newEndRow = range.endRow + actualShift;
    sh.mergeCells(`${range.startCol}${newStartRow}:${range.endCol}${newEndRow}`);
  });

  // 5. Fill header data
  const { header, table, footer } = mapping;
  
  if (supplierInfo) {
    sh.getCell(header.supplier_name).value = supplierInfo.fullName;
    sh.getCell(header.address).value = supplierInfo.address;
    sh.getCell(header.tax_code).value = supplierInfo.taxCode;
    sh.getCell(header.phone).value = supplierInfo.phone;
    sh.getCell(header.fax).value = supplierInfo.fax;
    sh.getCell(header.currency).value = supplierInfo.currency || 'VND';
    sh.getCell(header.supplier_code_cell).value = supplierInfo.shortCode || '';
  } else {
    // Fallback if no config matches
    sh.getCell(header.supplier_name).value = nccName;
  }

  // Fill Date and Invoice Details
  if (orders.length > 0) {
    // Find the earliest date among all orders for this supplier
    earliestDate = null;
    orders.forEach(order => {
      if (order.date) {
        const d = parseExcelDate(order.date);
        if (d) {
          if (!earliestDate || d < earliestDate) {
            earliestDate = d;
          }
        }
      }
    });

    if (earliestDate) {
      const cell = sh.getCell(header.date);
      cell.value = earliestDate;
      cell.numFmt = 'dd/mm/yyyy';
    } else {
      const firstOrder = orders[0];
      if (firstOrder && firstOrder.date) {
        const cell = sh.getCell(header.date);
        cell.value = parseExcelDate(firstOrder.date);
        cell.numFmt = 'dd/mm/yyyy';
      }
    }

    // Set Invoice Number
    const firstOrder = orders[0];
    sh.getCell(header.invoice_number_cell).value = firstOrder.invoiceNo;
  }

  // 6. Fill Table items
  const cols = table.columns;
  let subtotal = 0;
  for (let i = 0; i < N; i++) {
    const order = orders[i];
    const rowIndex = startRow + i;
    const row = sh.getRow(rowIndex);

    // Code
    row.getCell(cols.item_code).value = order.itemCode;
    // Qty
    row.getCell(cols.quantity).value = order.qty;
    // Price
    row.getCell(cols.price).value = order.price;

    const descCell = row.getCell(cols.description);
    let descFormula = `\"Hạt nhựa \"&${cols.item_code}${rowIndex}`;
    if (descCell.value && typeof descCell.value === 'object' && 'formula' in descCell.value) {
      descFormula = descCell.value.formula || descFormula;
    }
    const descResult = evaluateDescFormula(descFormula, order.itemCode, rowIndex, cols.item_code);
    descCell.value = {
      formula: descFormula,
      result: descResult
    };
    
    const amountCell = row.getCell(cols.amount);
    let amountFormula = `+${cols.quantity}${rowIndex}*${cols.price}${rowIndex}`;
    if (amountCell.value && typeof amountCell.value === 'object' && 'formula' in amountCell.value) {
      amountFormula = amountCell.value.formula || amountFormula;
    }
    const rowAmount = evaluateRowFormula(amountFormula, order.qty, order.price, rowIndex, cols);
    subtotal += rowAmount;
    amountCell.value = {
      formula: amountFormula,
      result: rowAmount
    };
  }

  // 7. Update Footer Formulas and written words
  const totalRowIndex = startRow + N + footer.total_before_tax_offset;
  const vatRowIndex = startRow + N + footer.vat_rate_offset;
  const payRowIndex = startRow + N + footer.total_payment_offset;
  const wordsRowIndex = startRow + N + footer.total_words_offset;

  // Read VAT rate from template
  const vatRateCell = sh.getCell(`${footer.vat_rate_col}${vatRowIndex}`);
  let vatRate = 0.08; // default 8%
  if (vatRateCell.value !== null && vatRateCell.value !== undefined) {
    const val = vatRateCell.value;
    let valStr = '';
    if (typeof val === 'number') {
      vatRate = val;
    } else if (typeof val === 'object' && 'result' in val) {
      valStr = val.result?.toString() || '';
    } else {
      valStr = val.toString() || '';
    }
    if (valStr) {
      if (valStr.includes('%')) {
        vatRate = parseFloat(valStr.replace('%', '').trim()) / 100;
      } else {
        vatRate = parseFloat(valStr);
      }
    }
  }

  const vatAmount = subtotal * vatRate;
  const totalPayment = Math.round(subtotal + vatAmount);

  sh.getCell(`${footer.total_payment_col}${totalRowIndex}`).value = {
    formula: `SUM(${cols.amount}${startRow}:${cols.amount}${startRow + N - 1})`,
    result: subtotal
  };
  sh.getCell(`${footer.vat_amount_col}${vatRowIndex}`).value = {
    formula: `${footer.total_payment_col}${totalRowIndex}*${vatRate}`,
    result: vatAmount
  };
  sh.getCell(`${footer.total_payment_col}${payRowIndex}`).value = {
    formula: `ROUND(${footer.total_payment_col}${totalRowIndex}+${footer.vat_amount_col}${vatRowIndex},0)`,
    result: totalPayment
  };

  sh.getCell(`${footer.total_words_col}${wordsRowIndex}`).value = numberToWords(totalPayment);

  // Sync dates inside text descriptions (e.g. C21 delivery place cell)
  const finalDateForSync = earliestDate || (orders[0]?.date ? new Date(orders[0].date) : null);
  if (finalDateForSync) {
    const syncCellDate = (col: string, offset: number) => {
      if (!col || offset === undefined || offset === null) return;
      const rowIndex = startRow + N + offset;
      const cell = sh.getRow(rowIndex).getCell(col);
      let val = cell.value?.toString() || '';
      if (!val) return;
      
      const dateRegex = /\d{1,2}[\/\-]\d{1,2}[\/\-]\d{4}/g;
      if (dateRegex.test(val)) {
        const dd = String(finalDateForSync.getDate()).padStart(2, '0');
        const mm = String(finalDateForSync.getMonth() + 1).padStart(2, '0');
        const yyyy = finalDateForSync.getFullYear();
        const formatted = `${dd}/${mm}/${yyyy}`;
        cell.value = val.replace(dateRegex, formatted);
      }
    };

    syncCellDate(footer.delivery_place_col, footer.delivery_place_offset);
    syncCellDate(footer.payment_terms_col, footer.payment_terms_offset);
    syncCellDate(footer.notes_col, footer.notes_offset);
  }

  // 8. Generate Buffer
  const outBuffer = await workbook.xlsx.writeBuffer() as any;
  // ExcelJS returns a Buffer, we convert it to ArrayBuffer for compatibility
  if (outBuffer.buffer) {
    return outBuffer.buffer.slice(outBuffer.byteOffset, outBuffer.byteOffset + outBuffer.byteLength);
  }
  return outBuffer;
}
