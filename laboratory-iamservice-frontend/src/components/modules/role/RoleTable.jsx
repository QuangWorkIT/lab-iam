import React, { useState, useEffect } from "react";
import {
  FaPlus,
  FaSort,
  FaSortAlphaDown,
  FaSortAlphaUp,
  FaEye,
  FaEdit,
  FaTrash,
} from "react-icons/fa";
import RoleSearchBar from "./RoleSearchBar";
import Pagination from "../../common/Pagination";
import StatusBadge from "../../common/StatusBadge";
import RoleBadge from "./RoleBadge";
import ActionButtons from "./ActionButtons";
import { formatDate } from "../../../utils/formatter";

export default function RoleTable({
  roles,
  onSearch,
  onSort,
  onDelete,
  onPageChange,
  onView,
  onEdit,
  onAdd,
  currentPage = 0,
  totalPages = 1,
}) {
  const [filteredRoles, setFilteredRoles] = useState(roles);
  // Sorting: only 'code' and 'name' are sortable alphabetically
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  // Confirm delete dialog state
  const [confirmState, setConfirmState] = useState({ open: false, role: null });

  // Lưu tiêu chí tìm kiếm để filter FE
  const [searchCriteria, setSearchCriteria] = useState({
    keyword: "",
    fromDate: "",
    toDate: "",
    roleFilter: "",
  });

  const sortRoles = (list) => {
    if (!sortConfig.key) return list;
    // Only allow sorting by code or name
    if (sortConfig.key !== "code" && sortConfig.key !== "name") return list;
    const sorted = [...list].sort((a, b) => {
      const aVal = (a[sortConfig.key] || "").toString().toLowerCase();
      const bVal = (b[sortConfig.key] || "").toString().toLowerCase();
      if (aVal < bVal) return sortConfig.direction === "asc" ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === "asc" ? 1 : -1;
      return 0;
    });
    return sorted;
  };

  const applyFilters = (list, criteria) => {
    const { keyword, fromDate, toDate, roleFilter } = criteria;
    const kw = (keyword || "").toLowerCase();

    const toEndOfDay = (dateStr) => {
      const d = new Date(dateStr);
      d.setHours(23, 59, 59, 999);
      return d;
    };

    return (list || []).filter((r) => {
      // keyword trên code, name, description, privileges
      const code = (r.code || "").toLowerCase();
      const name = (r.name || "").toLowerCase();
      const desc = (r.description || "").toLowerCase();
      const priv = Array.isArray(r.privileges)
        ? r.privileges.join(", ").toLowerCase()
        : (r.privileges || "").toString().toLowerCase();

      const matchKeyword =
        !kw ||
        code.includes(kw) ||
        name.includes(kw) ||
        desc.includes(kw) ||
        priv.includes(kw);

      // Lọc theo roleFilter: so sánh theo code để khớp với value của dropdown
      const rf = (roleFilter || "").toLowerCase();
      const matchRole = !rf || code === rf;

      // Lọc theo ngày tạo
      const created = r.createdAt ? new Date(r.createdAt) : null;
      const matchFrom = !fromDate || (created && created >= new Date(fromDate));
      const matchTo = !toDate || (created && created <= toEndOfDay(toDate));

      return matchKeyword && matchRole && matchFrom && matchTo;
    });
  };

  useEffect(() => {
    // Áp dụng filter trước
    const filtered = applyFilters(roles, searchCriteria);

    // Nếu parent đang xử lý sort ở BE (onSort được cung cấp), không sort ở client
    if (onSort) {
      setFilteredRoles(filtered);
      return;
    }

    if (sortConfig.key) {
      // Luôn sort dựa trên danh sách mới nhất sau filter
      setFilteredRoles(sortRoles(filtered));
    } else {
      setFilteredRoles(filtered); // giữ nguyên thứ tự backend
    }
  }, [roles, searchCriteria, sortConfig, onSort]);

  const handleSearch = (keyword, fromDate, toDate, roleFilter) => {
    // Lưu tiêu chí để filter FE
    setSearchCriteria({ keyword, fromDate, toDate, roleFilter });
    // Giữ tương thích: nếu cha có onSearch thì vẫn gọi
    if (onSearch) {
      onSearch(keyword, fromDate, toDate, roleFilter);
    }
  };

  // Open custom confirm dialog (replace window.confirm)
  const requestDelete = (role) => setConfirmState({ open: true, role });
  const handleConfirmDelete = () => {
    if (confirmState.role && onDelete) onDelete(confirmState.role);
    setConfirmState({ open: false, role: null });
  };
  const handleCancelDelete = () => setConfirmState({ open: false, role: null });

  // Chuẩn hóa trạng thái active từ nhiều kiểu dữ liệu trả về
  const normalizeActive = (r) => {
    if (r && typeof r.isActive === "boolean") return r.isActive;
    if (r && typeof r.is_active === "boolean") return r.is_active; // phòng khi API trả snake_case
    if (r && typeof r.inactive === "boolean") return !r.inactive;
    if (r && typeof r.status === "string")
      return r.status.toLowerCase() === "active";
    return false;
  };

  // Toggle sorting for allowed keys (only 'code' and 'name')
  const toggleSort = (key) => {
    if (key !== "code" && key !== "name") return;
    const direction =
      sortConfig.key === key && sortConfig.direction === "asc" ? "desc" : "asc";
    setSortConfig({ key, direction });

    if (onSort) {
      // Nếu có callback, báo cáo sự thay đổi lên cha
      onSort(key, direction);
    } else {
      setSortConfig({ key, direction: "asc" });
    }
  };

  return (
    <div className="role-table-container" style={{ width: "100%" }}>
      {/* Toolbar & Search */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "15px",
          width: "100%",
          flexWrap: "wrap", // allow wrap so the button drops to next line if needed
          gap: 10,
        }}
      >
        <RoleSearchBar onSearch={handleSearch} roleOptions={roles} />

        <div className="add-new-button">
          <button
            style={{
              backgroundColor: "#fe535b",
              color: "white",
              border: "none",
              borderRadius: "4px",
              padding: "8px 15px",
              fontWeight: "bold",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              fontSize: "14px",
            }}
            onClick={() => (onAdd ? onAdd() : console.log("Add new role"))}
          >
            <FaPlus style={{ marginRight: "5px" }} />
            Add New Role
          </button>
        </div>
      </div>

      {/* Bảng vai trò */}
      <div style={{ width: "100%", overflowX: "auto" }}>
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
            borderRadius: "4px",
            overflow: "hidden",
            minWidth: "800px",
          }}
        >
          <thead>
            <tr style={{ backgroundColor: "#f8f9fa" }}>
              <th
                style={{
                  padding: "12px 15px",
                  textAlign: "left",
                  borderBottom: "1px solid #eaeaea",
                  color: "#666",
                  fontWeight: "600",
                  fontSize: "14px",
                  minWidth: "160px",
                  whiteSpace: "nowrap",
                  verticalAlign: "middle",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ whiteSpace: "nowrap" }}>Role Code</span>

                  <button
                    type="button"
                    onClick={() => toggleSort("code")}
                    title="Sort by Role Code"
                    style={{
                      background: "transparent",
                      border: "none",
                      cursor: "pointer",
                      padding: 4,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {sortConfig.key === "code" ? (
                      sortConfig.direction === "asc" ? (
                        <FaSortAlphaDown style={{ color: "#fe535b" }} />
                      ) : (
                        <FaSortAlphaUp style={{ color: "#fe535b" }} />
                      )
                    ) : (
                      <FaSort style={{ color: "#aaa" }} />
                    )}
                  </button>
                </div>
              </th>
              <th
                style={{
                  padding: "12px 15px",
                  textAlign: "left",
                  borderBottom: "1px solid #eaeaea",
                  color: "#666",
                  fontWeight: "600",
                  fontSize: "14px",
                  minWidth: "160px",
                  whiteSpace: "nowrap",
                  verticalAlign: "middle",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ whiteSpace: "nowrap" }}>Role Name</span>

                  <button
                    type="button"
                    onClick={() => toggleSort("name")}
                    title="Sort by Role Name"
                    style={{
                      background: "transparent",
                      border: "none",
                      cursor: "pointer",
                      padding: 4,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {sortConfig.key === "name" ? (
                      sortConfig.direction === "asc" ? (
                        <FaSortAlphaDown style={{ color: "#fe535b" }} />
                      ) : (
                        <FaSortAlphaUp style={{ color: "#fe535b" }} />
                      )
                    ) : (
                      <FaSort style={{ color: "#aaa" }} />
                    )}
                  </button>
                </div>
              </th>
              <th
                style={{
                  padding: "12px 15px",
                  textAlign: "left",
                  borderBottom: "1px solid #eaeaea",
                  color: "#666",
                  fontWeight: "600",
                  fontSize: "14px",
                }}
              >
                Description
              </th>
              <th
                style={{
                  padding: "12px 15px",
                  textAlign: "left",
                  borderBottom: "1px solid #eaeaea",
                  color: "#666",
                  fontWeight: "600",
                  fontSize: "14px",
                }}
              >
                Privileges
              </th>
              <th
                style={{
                  padding: "12px 15px",
                  textAlign: "left",
                  borderBottom: "1px solid #eaeaea",
                  color: "#666",
                  fontWeight: "600",
                  fontSize: "14px",
                }}
              >
                Created At
              </th>
              <th
                style={{
                  padding: "12px 15px",
                  textAlign: "left",
                  borderBottom: "1px solid #eaeaea",
                  color: "#666",
                  fontWeight: "600",
                  fontSize: "14px",
                }}
              >
                Status
              </th>
              <th
                style={{
                  padding: "12px 15px",
                  textAlign: "center",
                  borderBottom: "1px solid #eaeaea",
                  color: "#666",
                  fontWeight: "600",
                  fontSize: "14px",
                  width: "120px",
                }}
              >
                Action
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredRoles.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  style={{
                    textAlign: "center",
                    color: "#888",
                    padding: "32px 0",
                    fontSize: "16px",
                  }}
                >
                  No data
                </td>
              </tr>
            ) : (
              filteredRoles.map((role, index) => (
                <tr
                  key={role.code}
                  style={{
                    backgroundColor: index % 2 === 0 ? "#fff" : "#f9f9f9",
                  }}
                >
                  <td
                    style={{
                      padding: "12px 15px",
                      borderBottom: "1px solid #eaeaea",
                      fontWeight: "500",
                      color: "#333",
                    }}
                  >
                    {role.code}
                  </td>
                  <td
                    style={{
                      padding: "12px 15px",
                      borderBottom: "1px solid #eaeaea",
                    }}
                  >
                    <RoleBadge roleName={role.name} />
                  </td>
                  <td
                    style={{
                      padding: "12px 15px",
                      borderBottom: "1px solid #eaeaea",
                      maxWidth: "200px",
                      color: "#555",
                      whiteSpace: "nowrap", // Thêm dòng này để không xuống dòng
                      overflow: "hidden", // Ẩn phần vượt quá
                      textOverflow: "ellipsis",
                    }}
                  >
                    {role.description && role.description.length > 30
                      ? `${role.description.substring(0, 30)}...`
                      : role.description}
                  </td>
                  <td
                    style={{
                      padding: "12px 15px",
                      borderBottom: "1px solid #eaeaea",
                      maxWidth: "200px",
                      color: "#555",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {(() => {
                      const privText = Array.isArray(role.privileges)
                        ? role.privileges.join(", ")
                        : typeof role.privileges === "string"
                          ? role.privileges
                          : "";
                      const display = privText || "N/A";
                      // Cắt giống Description để đồng bộ UX
                      return display.length > 30
                        ? `${display.substring(0, 30)}...`
                        : display;
                    })()}
                  </td>
                  <td
                    style={{
                      padding: "12px 15px",
                      borderBottom: "1px solid #eaeaea",
                      color: "#555",
                    }}
                  >
                    {formatDate(role.createdAt)}
                  </td>
                  <td
                    style={{
                      padding: "12px 15px",
                      borderBottom: "1px solid #eaeaea",
                      color: "#555",
                    }}
                  >
                    <StatusBadge active={normalizeActive(role)} />
                  </td>
                  <td
                    style={{
                      padding: "12px 15px",
                      borderBottom: "1px solid #eaeaea",
                      display: "flex",
                      justifyContent: "center",
                      gap: "10px",
                    }}
                  >
                    <ActionButtons
                      onView={onView}
                      onEdit={onEdit}
                      onDelete={requestDelete}
                      item={role}
                    />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Phần pagination */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={onPageChange}
      />

      {/* Confirm delete dialog */}
      {confirmState.open && (
        <ConfirmDialog
          title="Delete Role"
          message={`Are you sure you want to delete role "${confirmState.role?.name || confirmState.role?.code || "this role"
            }"?`}
          confirmText="Delete"
          cancelText="Cancel"
          onConfirm={handleConfirmDelete}
          onCancel={handleCancelDelete}
        />
      )}
    </div>
  );
}

// Simple confirm dialog with overlay, styled to match app modals
function ConfirmDialog({
  title = "Confirm",
  message,
  confirmText = "OK",
  cancelText = "Cancel",
  onConfirm,
  onCancel,
}) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(0,0,0,0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1100,
      }}
      onMouseDown={(e) => {
        if (e.currentTarget === e.target) onCancel?.();
      }}
    >
      <div
        style={{
          background: "#fff",
          borderRadius: 12,
          boxShadow: "0 12px 30px rgba(0,0,0,0.18)",
          width: 420,
          maxWidth: "92%",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            padding: "16px 20px",
            borderBottom: "1px solid #f0f2f5",
          }}
        >
          <div
            style={{
              fontWeight: 800,
              letterSpacing: 1,
              textTransform: "uppercase",
              fontSize: 14,
              color: "#e11d48",
            }}
          >
            {title}
          </div>
        </div>
        <div style={{ padding: "16px 20px", color: "#404553", fontSize: 14 }}>
          {message}
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: 10,
            padding: "12px 16px",
            borderTop: "1px solid #f0f2f5",
          }}
        >
          <button
            type="button"
            onClick={onCancel}
            style={{
              padding: "8px 14px",
              border: "1px solid #e1e7ef",
              borderRadius: 8,
              backgroundColor: "#ffffff",
              color: "#404553",
              cursor: "pointer",
            }}
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            style={{
              padding: "8px 16px",
              border: "none",
              borderRadius: 8,
              backgroundColor: "#fe535b",
              color: "#fff",
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
