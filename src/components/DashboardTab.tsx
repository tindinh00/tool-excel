import React from "react";
import {
  DocumentIcon,
  TemplateIcon,
  FolderIcon,
  WarningIcon,
  CheckIcon,
  AuditIcon,
  ConfigIcon,
  ClearIcon,
  DashboardIcon,
  PlayIcon,
  PlusIcon
} from "./Icons";

interface DashboardTabProps {
  inputFile: string;
  templateFile: string;
  outputDir: string;
  detectedNCCs: { name: string; count: number; matched: boolean }[];
  isExporting: boolean;
  exportProgress: { current: number; total: number; ncc: string };
  statusMsg: string;
  onSelectInputFile: () => void;
  onSelectTemplateFile: () => void;
  onSelectOutputDir: () => void;
  onRunExport: () => void;
  onAddMissingSupplier: (nccCode: string) => void;
  onOpenOutputDir: () => void;
  onClearInputFile: () => void;
  onClearTemplateFile: () => void;
  onClearOutputDir: () => void;
  activeDragTarget: "input" | "template" | "output" | null;
  onDragTargetChange: (target: "input" | "template" | "output" | null) => void;
}

export const DashboardTab: React.FC<DashboardTabProps> = ({
  inputFile,
  templateFile,
  outputDir,
  detectedNCCs,
  isExporting,
  exportProgress,
  statusMsg,
  onSelectInputFile,
  onSelectTemplateFile,
  onSelectOutputDir,
  onRunExport,
  onAddMissingSupplier,
  onOpenOutputDir,
  onClearInputFile,
  onClearTemplateFile,
  onClearOutputDir,
  activeDragTarget,
  onDragTargetChange
}) => {
  const missingNCCsCount = detectedNCCs.filter(n => !n.matched).length;
  const hasMissingSuppliers = missingNCCsCount > 0;

  return (
    <div className="dashboard-grid">


      {/* Left Card: Stepped Control Center */}
      <div className="glass-card" style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
        <div>
          <h2 className="card-title" style={{ marginBottom: "8px", display: "flex", alignItems: "center", gap: "8px" }}><ConfigIcon /> Các Bước Thiết Lập</h2>
          <p style={{ margin: 0, color: "var(--color-muted)", fontSize: "0.85rem" }}>
            Lần lượt thực hiện nạp dữ liệu và cấu hình thư mục đầu ra bên dưới.
          </p>
        </div>

        <div className="divider" style={{ margin: "0" }} />

        {/* STEP 1 */}
        <div className="selector-field">
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
            <span style={{ background: "var(--color-ink)", color: "var(--color-canvas)", borderRadius: "4px", padding: "2px 6px", fontSize: "0.75rem", fontWeight: "600" }}>BƯỚC 1</span>
            <label style={{ fontWeight: "600", color: "var(--color-ink)" }}>Nạp file đơn hàng tổng hợp</label>
          </div>
          
          <div
            className={`file-box ${inputFile ? "has-file" : ""} ${activeDragTarget === "input" ? "drag-over" : ""}`}
            onClick={onSelectInputFile}
          >
            <span className="file-icon" style={{ display: "flex", alignItems: "center" }}><DocumentIcon /></span>
            <div className="file-info">
              {inputFile ? (
                <>
                  <span className="file-name" style={{ fontSize: "0.95rem" }}>{inputFile.split("/").pop()}</span>
                  <span className="file-path">{inputFile}</span>
                </>
              ) : (
                <span className="placeholder">Chọn file Excel tổng hợp đơn hàng...</span>
              )}
            </div>
            {inputFile && (
              <button
                className="btn-clear"
                onClick={(e) => {
                  e.stopPropagation();
                  onClearInputFile();
                }}
                title="Xoá chọn"
                style={{
                  background: "rgba(239, 68, 68, 0.15)",
                  border: "1px solid rgba(239, 68, 68, 0.3)",
                  color: "var(--color-error)",
                  borderRadius: "50%",
                  width: "24px",
                  height: "24px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  fontSize: "0.8rem",
                  padding: 0,
                  marginRight: "4px",
                  flexShrink: 0,
                  transition: "all 0.2s"
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.25)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.15)'}
              >
                <ClearIcon />
              </button>
            )}
            <button className="btn-select">Chọn File</button>
          </div>
        </div>

        {/* STEP 2 */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px", background: "rgba(0, 0, 0, 0.015)", padding: "16px", borderRadius: "8px", border: "1px solid var(--color-hairline-soft)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
            <span style={{ background: "var(--color-ink)", color: "var(--color-canvas)", borderRadius: "4px", padding: "2px 6px", fontSize: "0.75rem", fontWeight: "600" }}>BƯỚC 2</span>
            <label style={{ fontWeight: "600", color: "var(--color-ink)" }}>Thiết lập mẫu hóa đơn và thư mục đầu ra</label>
          </div>

          {/* Template Selection */}
          <div className="selector-field">
            <div
              className={`file-box ${templateFile ? "has-file" : ""}`}
              onClick={onSelectTemplateFile}
            >
              <span className="file-icon" style={{ display: "flex", alignItems: "center" }}><TemplateIcon /></span>
              <div className="file-info">
                {templateFile ? (
                  <>
                    <span className="file-name" style={{ fontSize: "0.95rem" }}>{templateFile.split("/").pop()}</span>
                    <span className="file-path">{templateFile}</span>
                  </>
                ) : (
                  <span className="placeholder">Mặc định: DONMUAHANG.xlsx (nạp tự động)...</span>
                )}
              </div>
              {templateFile && (
                <button
                  className="btn-clear"
                  onClick={(e) => {
                    e.stopPropagation();
                    onClearTemplateFile();
                  }}
                  title="Xoá chọn"
                  style={{
                    background: "rgba(239, 68, 68, 0.15)",
                    border: "1px solid rgba(239, 68, 68, 0.3)",
                    color: "var(--color-error)",
                    borderRadius: "50%",
                    width: "24px",
                    height: "24px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    fontSize: "0.8rem",
                    padding: 0,
                    marginRight: "4px",
                    flexShrink: 0,
                    transition: "all 0.2s"
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.25)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.15)'}
                >
                  <ClearIcon />
                </button>
              )}
              <button className="btn-select">Thay Đổi</button>
            </div>
          </div>

          {/* Output Folder Selection */}
          <div className="selector-field">
            <div
              className={`file-box ${outputDir ? "has-file" : ""}`}
              onClick={onSelectOutputDir}
            >
              <span className="file-icon" style={{ display: "flex", alignItems: "center" }}><FolderIcon /></span>
              <div className="file-info">
                {outputDir ? (
                  <>
                    <span className="file-name" style={{ fontSize: "0.95rem" }}>{outputDir.split("/").pop()}</span>
                    <span className="file-path">{outputDir}</span>
                  </>
                ) : (
                  <span className="placeholder">Chọn thư mục để lưu các file hóa đơn...</span>
                )}
              </div>
              {outputDir && (
                <button
                  className="btn-clear"
                  onClick={(e) => {
                    e.stopPropagation();
                    onClearOutputDir();
                  }}
                  title="Xoá chọn"
                  style={{
                    background: "rgba(239, 68, 68, 0.15)",
                    border: "1px solid rgba(239, 68, 68, 0.3)",
                    color: "var(--color-error)",
                    borderRadius: "50%",
                    width: "24px",
                    height: "24px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    fontSize: "0.8rem",
                    padding: 0,
                    marginRight: "4px",
                    flexShrink: 0,
                    transition: "all 0.2s"
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.25)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.15)'}
                >
                  <ClearIcon />
                </button>
              )}
              <button className="btn-select">Chọn Thư Mục</button>
            </div>
          </div>
        </div>

        {/* STEP 3 */}
        <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginTop: "8px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ background: "var(--color-ink)", color: "var(--color-canvas)", borderRadius: "4px", padding: "2px 6px", fontSize: "0.75rem", fontWeight: "600" }}>BƯỚC 3</span>
            <label style={{ fontWeight: "600", color: "var(--color-ink)" }}>Kiểm tra & Xuất dữ liệu</label>
          </div>

          <div className="btn-action-container">
            <button
              className="btn-primary"
              onClick={onRunExport}
              disabled={isExporting || !inputFile || !templateFile || !outputDir}
              style={{
                height: "46px",
                fontSize: "1rem",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px"
              }}
            >
              {isExporting ? "ĐANG TIẾN HÀNH XUẤT..." : <><PlayIcon /> BẮT ĐẦU XUẤT HÓA ĐƠN</>}
            </button>
          </div>

          {hasMissingSuppliers && inputFile && (
            <div style={{
              background: "var(--color-warning-bg)",
              border: "1px solid var(--color-warning)",
              borderRadius: "8px",
              padding: "12px 16px",
              color: "var(--color-ink)",
              fontSize: "0.85rem",
              display: "flex",
              alignItems: "flex-start",
              gap: "8px",
              lineHeight: "1.4"
            }}>
              <WarningIcon style={{ color: "var(--color-warning)", flexShrink: 0, marginTop: "2px" }} />
              <span>
                <strong>Lưu ý:</strong> Có nhà cung cấp chưa được cấu hình ở danh sách bên cạnh. Hóa đơn của các nhà cung cấp này sẽ bị thiếu thông tin liên hệ khi xuất ra.
              </span>
            </div>
          )}
        </div>

        {/* Progress and status message */}
        {(isExporting || statusMsg) && (
          <div className="progress-panel" style={{ marginTop: "8px" }}>
            <div className="progress-text">
              <span>Trạng thái: {statusMsg}</span>
              {isExporting && (
                <span>
                  {exportProgress.current}/{exportProgress.total} file
                </span>
              )}
            </div>
            {isExporting && (
              <div className="progress-bar-container">
                <div
                  className="progress-bar-fill"
                  style={{
                    width: `${(exportProgress.current / exportProgress.total) * 100}%`
                  }}
                />
              </div>
            )}
            {!isExporting && statusMsg.includes("thành công") && (
              <div style={{ marginTop: "12px" }}>
                <button
                  className="btn-secondary"
                  onClick={onOpenOutputDir}
                  style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}
                >
                  <FolderIcon style={{ width: "16px", height: "16px" }} /> Mở thư mục chứa file vừa xuất
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Right Card: Preview list of identified NCCs */}
      <div className="glass-card" style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
        <div>
          <h2 className="card-title" style={{ marginBottom: "8px", display: "flex", alignItems: "center", gap: "8px" }}><AuditIcon /> Kiểm Duyệt Nhà Cung Cấp</h2>
          <p style={{ margin: 0, color: "var(--color-muted)", fontSize: "0.85rem" }}>
            Hệ thống tự động phát hiện các nhà cung cấp từ file Excel đầu vào của bạn.
          </p>
        </div>

        <div className="divider" style={{ margin: "0" }} />

        {/* Auditor Statistics Panel */}
        {detectedNCCs.length > 0 && (
          <div style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "12px",
            background: "var(--color-surface-soft)",
            padding: "14px 16px",
            borderRadius: "8px",
            border: "1px solid var(--color-hairline)"
          }}>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <span style={{ fontSize: "0.75rem", color: "var(--color-muted)", fontWeight: "500", textTransform: "uppercase" }}>Tổng số nhà cung cấp</span>
              <span style={{ fontSize: "1.4rem", fontWeight: "600", color: "var(--color-ink)" }}>{detectedNCCs.length}</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <span style={{ fontSize: "0.75rem", color: "var(--color-muted)", fontWeight: "500", textTransform: "uppercase" }}>Chưa cấu hình</span>
              <span style={{
                fontSize: "1.4rem",
                fontWeight: "600",
                color: missingNCCsCount > 0 ? "var(--color-error)" : "var(--color-success)"
              }}>
                {missingNCCsCount}
              </span>
            </div>
          </div>
        )}

        {detectedNCCs.length === 0 ? (
          <div style={{
            color: "var(--color-muted)",
            textAlign: "center",
            padding: "80px 0",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "12px",
            border: "1px dashed var(--color-hairline)",
            borderRadius: "8px",
            background: "rgba(0,0,0,0.01)"
          }}>
            <DashboardIcon style={{ width: "40px", height: "40px", color: "var(--color-muted)" }} />
            <span style={{ fontSize: "0.9rem" }}>Hãy chọn file dữ liệu đơn hàng ở Bước 1 để phân tích.</span>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <div style={{ fontSize: "0.85rem", fontWeight: "600", color: "var(--color-ink)", marginBottom: "4px" }}>
              Danh sách chi tiết:
            </div>
            <div className="suppliers-list" style={{ maxHeight: "310px" }}>
              {detectedNCCs.map((ncc, idx) => (
                <div className="supplier-preview-item" key={idx} style={{
                  padding: "14px 18px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center"
                }}>
                  <div className="supplier-meta">
                    <span className="ncc-code" style={{ fontSize: "0.95rem", fontWeight: "600" }}>{ncc.name}</span>
                    <span className="ncc-count" style={{ fontSize: "0.8rem", color: "var(--color-muted)", display: "flex", alignItems: "center", gap: "6px", marginTop: "4px" }}>
                      <DocumentIcon style={{ width: "14px", height: "14px" }} /> {ncc.count} dòng sản phẩm đơn hàng
                    </span>
                  </div>
                  <div>
                    {ncc.matched ? (
                      <span className="status-badge matched" style={{ fontSize: "0.75rem", padding: "4px 12px", display: "flex", alignItems: "center", gap: "4px" }}>
                        <CheckIcon /> Khớp cấu hình
                      </span>
                    ) : (
                      <button
                        className="btn-select"
                        onClick={() => onAddMissingSupplier(ncc.name)}
                        style={{
                          background: "var(--color-primary)",
                          color: "white",
                          border: "none",
                          fontSize: "0.75rem",
                          padding: "5px 12px",
                          borderRadius: "4px",
                          cursor: "pointer",
                          fontWeight: "500",
                          transition: "background 0.2s",
                          display: "flex",
                          alignItems: "center",
                          gap: "4px"
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = 'var(--color-primary-hover)'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'var(--color-primary)'}
                      >
                        <PlusIcon style={{ width: "12px", height: "12px" }} /> Thêm cấu hình
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardTab;
