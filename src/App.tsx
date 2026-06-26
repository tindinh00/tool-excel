import { useState, useEffect } from "react";
import { open, ask, message } from "@tauri-apps/plugin-dialog";
import { openPath } from "@tauri-apps/plugin-opener";
import { readFile, writeFile, exists } from "@tauri-apps/plugin-fs";
import {
  Supplier,
  MappingConfig,
  OrderItem,
  parseInputData,
  generateInvoice
} from "./utils/excelProcessor";
import {
  loadSuppliers,
  saveSuppliers,
  loadMapping,
  saveMapping
} from "./utils/configManager";
import DashboardTab from "./components/DashboardTab";
import SuppliersTab from "./components/SuppliersTab";
import MappingTab from "./components/MappingTab";
import SupplierModal from "./components/SupplierModal";
import { DashboardIcon, SupplierIcon, ConfigIcon, SparkleIcon } from "./components/Icons";
import "./App.css";

type Tab = "dashboard" | "suppliers" | "mapping";

function App() {
  const [activeTab, setActiveTab] = useState<Tab>("dashboard");
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [mapping, setMapping] = useState<MappingConfig | null>(null);

  // File Paths
  const [inputFile, setInputFile] = useState<string>("");
  const [templateFile, setTemplateFile] = useState<string>("");
  const [templateBuffer, setTemplateBuffer] = useState<ArrayBuffer | null>(null);
  const [outputDir, setOutputDir] = useState<string>("");

  // Parsing & Export States
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [detectedNCCs, setDetectedNCCs] = useState<{ name: string; count: number; matched: boolean }[]>([]);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [exportProgress, setExportProgress] = useState<{ current: number; total: number; ncc: string }>({ current: 0, total: 0, ncc: "" });
  const [statusMsg, setStatusMsg] = useState<string>("");

  const safeMessage = async (msg: string, title = "Thông báo", kind: "info" | "error" = "info") => {
    try {
      await message(msg, { title, kind });
    } catch (e) {
      alert(msg);
    }
  };

  const safeAsk = async (msg: string, title = "Xác nhận") => {
    try {
      return await ask(msg, { title, kind: "warning" });
    } catch (e) {
      return confirm(msg);
    }
  };

  // Modals / Editing States for Suppliers
  const [showSupplierModal, setShowSupplierModal] = useState<boolean>(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [initialModalCode, setInitialModalCode] = useState<string>("");

  // Load configs on start
  useEffect(() => {
    async function initConfigs() {
      const loadedSuppliers = await loadSuppliers();
      const loadedMapping = await loadMapping();
      setSuppliers(loadedSuppliers);
      setMapping(loadedMapping);

      // Load default template from public folder
      try {
        const response = await fetch("/template.xlsx");
        const arrayBuffer = await response.arrayBuffer();
        setTemplateBuffer(arrayBuffer);
        setTemplateFile("Mẫu mặc định (Đã tích hợp)");
      } catch (err) {
        console.error("Error loading default template:", err);
      }
    }
    initConfigs();
  }, []);

  // Update detected NCC state
  useEffect(() => {
    if (orderItems.length === 0) {
      setDetectedNCCs([]);
      return;
    }

    const counts: Record<string, number> = {};
    orderItems.forEach(item => {
      counts[item.ncc] = (counts[item.ncc] || 0) + 1;
    });

    const list = Object.keys(counts).map(nccName => {
      const isMatched = suppliers.some(
        s => s.code.toLowerCase().trim() === nccName.toLowerCase().trim()
      );
      return {
        name: nccName,
        count: counts[nccName],
        matched: isMatched
      };
    });

    setDetectedNCCs(list);
  }, [orderItems, suppliers]);

  // Select Input File
  const handleSelectInputFile = async () => {
    try {
      const selected = await open({
        multiple: false,
        filters: [{ name: "Excel", extensions: ["xlsx"] }]
      });
      if (selected && typeof selected === "string") {
        setInputFile(selected);
        setStatusMsg("Đang đọc file dữ liệu...");
        const fileData = await readFile(selected);
        const parsedItems = await parseInputData(fileData.buffer);
        setOrderItems(parsedItems);
        setStatusMsg(`Đã đọc ${parsedItems.length} đơn hàng.`);
      }
    } catch (err: any) {
      console.error(err);
      setStatusMsg(`Lỗi khi đọc file: ${err.message || err}`);
    }
  };

  // Select Template File
  const handleSelectTemplateFile = async () => {
    try {
      const selected = await open({
        multiple: false,
        filters: [{ name: "Excel", extensions: ["xlsx"] }]
      });
      if (selected && typeof selected === "string") {
        setTemplateFile(selected);
        setStatusMsg("Đang nạp file mẫu...");
        const fileData = await readFile(selected);
        setTemplateBuffer(fileData.buffer);
        setStatusMsg("Đã nạp file mẫu thành công.");
      }
    } catch (err: any) {
      console.error(err);
      setStatusMsg(`Lỗi khi chọn file mẫu: ${err.message || err}`);
    }
  };

  // Select Output Directory
  const handleSelectOutputDir = async () => {
    try {
      const selected = await open({
        directory: true,
        multiple: false
      });
      if (selected && typeof selected === "string") {
        setOutputDir(selected);
      }
    } catch (err: any) {
      console.error(err);
      setStatusMsg(`Lỗi khi chọn thư mục lưu: ${err.message || err}`);
    }
  };

  const handleClearInputFile = () => {
    setInputFile("");
    setOrderItems([]);
    setDetectedNCCs([]);
    setStatusMsg("");
  };

  const handleClearTemplateFile = () => {
    setTemplateFile("");
    setTemplateBuffer(null);
    setStatusMsg("");
  };

  const handleClearOutputDir = () => {
    setOutputDir("");
    setStatusMsg("");
  };

  // Run Export Process
  const handleRunExport = async () => {
    if (!inputFile || !templateBuffer || !outputDir || !mapping) {
      setStatusMsg("Vui lòng cấu hình đầy đủ đường dẫn các file và thư mục!");
      return;
    }

    try {
      setIsExporting(true);
      setStatusMsg("Đang bắt đầu xuất hóa đơn...");

      // Group orders by NCC
      const groupedOrders: Record<string, OrderItem[]> = {};
      orderItems.forEach(item => {
        if (!groupedOrders[item.ncc]) {
          groupedOrders[item.ncc] = [];
        }
        groupedOrders[item.ncc].push(item);
      });

      const nccKeys = Object.keys(groupedOrders);
      setExportProgress({ current: 0, total: nccKeys.length, ncc: "" });

      for (let i = 0; i < nccKeys.length; i++) {
        const nccName = nccKeys[i];
        const orders = groupedOrders[nccName];
        setExportProgress({ current: i + 1, total: nccKeys.length, ncc: nccName });
        setStatusMsg(`Đang xuất hóa đơn cho NCC: ${nccName}...`);

        const supplierInfo = suppliers.find(
          s => s.code.toLowerCase().trim() === nccName.toLowerCase().trim()
        );

        const invoiceBuffer = await generateInvoice(
          templateBuffer,
          nccName,
          orders,
          supplierInfo,
          mapping
        );

        const cleanNccName = nccName.replace(/[^a-zA-Z0-9\sÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚÝàáâãèéêìíòóôõùúýĂăĐđĨĩŨũƠơƯưẠ-ỹ]/g, "").trim();
        const firstOrder = orders[0];
        const invoiceSuffix = firstOrder ? `_So_${firstOrder.invoiceNo}` : "";
        
        // Date suffix formatted as _YYYY-MM-DD
        const today = new Date();
        const yyyy = today.getFullYear();
        const mm = String(today.getMonth() + 1).padStart(2, '0');
        const dd = String(today.getDate()).padStart(2, '0');
        const dateSuffix = `_${yyyy}-${mm}-${dd}`;

        const baseFileName = `Don_Mua_Hang_${cleanNccName}${invoiceSuffix}${dateSuffix}`;
        let outputFilePath = `${outputDir}/${baseFileName}.xlsx`;
        let counter = 1;
        while (await exists(outputFilePath)) {
          outputFilePath = `${outputDir}/${baseFileName} (${counter}).xlsx`;
          counter++;
        }

        await writeFile(outputFilePath, new Uint8Array(invoiceBuffer));
      }

      setExportProgress({ current: nccKeys.length, total: nccKeys.length, ncc: "Hoàn tất!" });
      setStatusMsg(`Xuất hóa đơn thành công! Đã tạo ${nccKeys.length} file tại thư mục.`);
      
      // Auto-open output folder
      try {
        await openPath(outputDir);
      } catch (openErr) {
        console.error("Auto-open folder failed:", openErr);
      }
    } catch (err: any) {
      console.error(err);
      setStatusMsg(`Lỗi khi xuất hóa đơn: ${err.message || err}`);
    } finally {
      setIsExporting(false);
    }
  };

  const handleOpenOutputDir = async () => {
    if (!outputDir) return;
    try {
      await openPath(outputDir);
    } catch (err: any) {
      console.error(err);
      alert(`Không thể mở thư mục: ${err.message || err}`);
    }
  };

  // Supplier Add / Edit / Delete triggers
  const handleOpenAddSupplier = (defaultCode?: string) => {
    setEditingSupplier(null);
    setInitialModalCode(defaultCode || "");
    setShowSupplierModal(true);
  };

  const handleOpenEditSupplier = (supplier: Supplier) => {
    setEditingSupplier(supplier);
    setInitialModalCode("");
    setShowSupplierModal(true);
  };

  const handleSaveSupplier = async (supplierForm: Supplier) => {
    let updatedSuppliers: Supplier[];
    const isEditing = !!editingSupplier;

    if (isEditing) {
      updatedSuppliers = suppliers.map(s =>
        s.code.toLowerCase().trim() === editingSupplier.code.toLowerCase().trim() ? supplierForm : s
      );
    } else {
      if (suppliers.some(s => s.code.toLowerCase().trim() === supplierForm.code.toLowerCase().trim())) {
        await safeMessage("Mã bộ lọc nhà cung cấp này đã tồn tại!", "Lỗi", "error");
        return;
      }
      updatedSuppliers = [...suppliers, supplierForm];
    }

    try {
      setSuppliers(updatedSuppliers);
      await saveSuppliers(updatedSuppliers);
      setShowSupplierModal(false);
      setEditingSupplier(null);
      
      if (isEditing) {
        await safeMessage("Cập nhật thông tin nhà cung cấp thành công!", "Thành công", "info");
      } else {
        await safeMessage("Thêm mới nhà cung cấp thành công!", "Thành công", "info");
      }
    } catch (err: any) {
      console.error(err);
      // Even if file saving fails (e.g. in browser), close modal and notify
      setShowSupplierModal(false);
      setEditingSupplier(null);
      await safeMessage(`Lưu cấu hình thành công trong bộ nhớ tạm thời, nhưng gặp lỗi khi lưu file: ${err.message || err}`, "Cảnh báo", "error");
    }
  };

  const handleDeleteSupplier = async (code: string) => {
    const confirmed = await safeAsk(`Bạn có chắc chắn muốn xóa cấu hình nhà cung cấp "${code}" không?`, "Xác nhận xóa");
    if (!confirmed) {
      return;
    }
    const updated = suppliers.filter(s => s.code !== code);
    try {
      setSuppliers(updated);
      await saveSuppliers(updated);
      await safeMessage("Đã xóa cấu hình nhà cung cấp thành công!", "Thành công", "info");
    } catch (err: any) {
      console.error(err);
      await safeMessage(`Đã xóa khỏi bộ nhớ tạm thời, nhưng gặp lỗi khi lưu file: ${err.message || err}`, "Cảnh báo", "error");
    }
  };

  const handleSaveMappingConfig = async (updatedMapping: MappingConfig) => {
    try {
      setMapping(updatedMapping);
      await saveMapping(updatedMapping);
      alert("Đã lưu cấu hình mapping thành công!");
    } catch (err: any) {
      alert(`Lỗi khi lưu cấu hình: ${err.message || err}`);
    }
  };

  return (
    <div className="app-container">
      {/* Navbar Header */}
      <header className="app-header">
        <div className="logo-section">
          <h1>
            <SparkleIcon style={{ color: "var(--color-primary)", fontSize: "1.4rem" }} />
            EXCEL TOOL
          </h1>
          <p>Lọc đơn hàng & Xuất hóa đơn local bảo toàn công thức</p>
        </div>
        <nav className="nav-tabs">
          <button
            className={`tab-btn ${activeTab === "dashboard" ? "active" : ""}`}
            onClick={() => setActiveTab("dashboard")}
          >
            <DashboardIcon /> Xuất Hóa Đơn
          </button>
          <button
            className={`tab-btn ${activeTab === "suppliers" ? "active" : ""}`}
            onClick={() => setActiveTab("suppliers")}
          >
            <SupplierIcon /> Nhà Cung Cấp
          </button>
          <button
            className={`tab-btn ${activeTab === "mapping" ? "active" : ""}`}
            onClick={() => setActiveTab("mapping")}
          >
            <ConfigIcon /> Cấu Hình Ô
          </button>
        </nav>
      </header>

      {/* Main Tab Content */}
      <main className="app-content">
        {activeTab === "dashboard" && (
          <DashboardTab
            inputFile={inputFile}
            templateFile={templateFile}
            outputDir={outputDir}
            detectedNCCs={detectedNCCs}
            isExporting={isExporting}
            exportProgress={exportProgress}
            statusMsg={statusMsg}
            onSelectInputFile={handleSelectInputFile}
            onSelectTemplateFile={handleSelectTemplateFile}
            onSelectOutputDir={handleSelectOutputDir}
            onRunExport={handleRunExport}
            onAddMissingSupplier={handleOpenAddSupplier}
            onOpenOutputDir={handleOpenOutputDir}
            onClearInputFile={handleClearInputFile}
            onClearTemplateFile={handleClearTemplateFile}
            onClearOutputDir={handleClearOutputDir}
          />
        )}

        {activeTab === "suppliers" && (
          <SuppliersTab
            suppliers={suppliers}
            onEditSupplier={handleOpenEditSupplier}
            onDeleteSupplier={handleDeleteSupplier}
            onAddSupplier={() => handleOpenAddSupplier()}
          />
        )}

        {activeTab === "mapping" && mapping && (
          <MappingTab
            initialMapping={mapping}
            onSave={handleSaveMappingConfig}
          />
        )}
      </main>

      <footer className="footer-credits">
        Excel Filter Desktop Tool v2.0 - Hoạt động ngoại tuyến (Local Only)
      </footer>

      {/* Supplier Modal */}
      <SupplierModal
        isOpen={showSupplierModal}
        onClose={() => setShowSupplierModal(false)}
        editingSupplier={editingSupplier}
        onSubmit={handleSaveSupplier}
        initialCode={initialModalCode}
      />
    </div>
  );
}

export default App;
