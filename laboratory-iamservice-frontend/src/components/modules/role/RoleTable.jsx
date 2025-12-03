import React, { useState, useEffect } from "react";
import SearchBar from "../../common/SearchBar";
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
  totalElements = 0,
  pageSize = 10,
  onPageSizeChange,
  canViewRole = false,
  canUpdateRole = false,
  canDeleteRole = false,
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
      if (!Number.isFinite(d.getTime())) return null;
      d.setHours(23, 59, 59, 999);
      return d;
    };

    const parseDateSafe = (val) => {
      if (!val) return null;
      if (val instanceof Date)
        return Number.isFinite(val.getTime()) ? val : null;
      // numeric timestamp
      if (typeof val === "number") {
        const d = new Date(val);
        return Number.isFinite(d.getTime()) ? d : null;
      }
      // string formats
      if (typeof val === "string") {
        const s = val.trim();
        // ISO or yyyy-mm-dd or yyyy/mm/dd
        if (/^\d{4}[-\/]\d{2}[-\/]\d{2}/.test(s)) {
          const d = new Date(s.replace(/\//g, "-"));
          return Number.isFinite(d.getTime()) ? d : null;
        }
        // dd/mm/yyyy
        if (/^\d{2}\/\d{2}\/\d{4}$/.test(s)) {
          const [dd, mm, yyyy] = s.split("/");
          const d = new Date(`${yyyy}-${mm}-${dd}T00:00:00`);
          return Number.isFinite(d.getTime()) ? d : null;
        }
        const d = new Date(s);
        return Number.isFinite(d.getTime()) ? d : null;
      }
      return null;
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

      // Lọc theo ngày tạo (chấp nhận nhiều khóa & định dạng ngày)
      const createdRaw =
        r.createdAt ||
        r.created_at ||
        r.createdDate ||
        r.created_date ||
        r.created_on ||
        r.createdOn;
      const created = parseDateSafe(createdRaw);
      const from = fromDate ? parseDateSafe(fromDate) : null;
      const to = toDate ? toEndOfDay(toDate) : null;
      const matchFrom = !from || (created && created >= from);
      const matchTo = !to || (created && created <= to);

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
      // Mặc định: sắp xếp theo Created At tăng dần để item mới nằm về phía dưới
      const toMs = (d) => {
        const t = new Date(d).getTime();
        return Number.isFinite(t) ? t : 0; // item không có createdAt coi như cũ nhất
      };
      const byCreatedAsc = (a, b) => toMs(a.createdAt) - toMs(b.createdAt);
      setFilteredRoles([...filtered].sort(byCreatedAsc));
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
    const role = confirmState.role;
    if (role) {
      onDelete?.(role.code); // giữ nguyên API: parent nhận code để xóa
    }
    setConfirmState({ open: false, role: null });
  };

  const handleCancelDelete = () => {
    setConfirmState({ open: false, role: null });
  };

  // Chuẩn hóa trạng thái active từ nhiều kiểu dữ liệu trả về
  const normalizeActive = (r) => {
    if (r && typeof r.isActive === "boolean") return r.isActive;
    if (r && typeof r.is_active === "boolean") return r.is_active; // phòng khi API trả snake_case
    if (r && typeof r.inactive === "boolean") return !r.inactive;
    if (r && typeof r.status === "string")
      return r.status.toLowerCase() === "active";
    return false;
  };

  // Helper: Check if role is system role (cannot be deleted)
  const isSystemRole = (roleCode) => {
    const systemRoles = [
      "ROLE_ADMIN",
      "ROLE_SERVICE",
      "ROLE_LAB_MANAGER",
      "ROLE_LAB_USER",
      "ROLE_PATIENT",
      "ROLE_DEFAULT",
    ];
    return systemRoles.includes((roleCode || "").toUpperCase());
  };

  return (
    <div className="role-table-container" style={{ width: "100%" }}>
      {/* Toolbar & Search */}
      <div
        style={{
          display: "flex",
          justifyContent: "flex-start",
          alignItems: "center",
          marginBottom: "15px",
          width: "100%",
          flexWrap: "wrap",
          gap: 10,
        }}
      >
        <SearchBar
          onSearch={handleSearch}
          roleOptions={roles}
          placeholder="Search by name or code"
          allRolesLabel="All Roles"
          autoSearchOnRoleChange={true}
        />
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
            <tr style={{ backgroundColor: "#FF5A5A" }}>
              <th
                style={{
                  padding: "12px 15px",
                  textAlign: "left",
                  borderBottom: "none",
                  color: "#fff",
                  fontWeight: "600",
                  fontSize: "14px",
                  minWidth: "160px",
                  whiteSpace: "nowrap",
                  verticalAlign: "middle",
                }}
              >
                <span style={{ whiteSpace: "nowrap" }}>Role Code</span>
              </th>
              <th
                style={{
                  padding: "12px 15px",
                  textAlign: "left",
                  borderBottom: "none",
                  color: "#fff",
                  fontWeight: "600",
                  fontSize: "14px",
                  minWidth: "160px",
                  whiteSpace: "nowrap",
                  verticalAlign: "middle",
                }}
              >
                <span style={{ whiteSpace: "nowrap" }}>Role Name</span>
              </th>
              <th
                style={{
                  padding: "12px 15px",
                  textAlign: "left",
                  borderBottom: "none",
                  color: "#fff",
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
                  borderBottom: "none",
                  color: "#fff",
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
                  borderBottom: "none",
                  color: "#fff",
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
                  colSpan={5}
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
                    backgroundColor: "#fff",
                    transition: "background-color 0.2s ease",
                    cursor: "pointer",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "#f5f5f5";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "#fff";
                  }}
                >
                  <td
                    style={{
                      padding: "12px 15px",
                      borderBottom: "none",
                      fontWeight: "600",
                      color: "#333",
                    }}
                  >
                    {role.code}
                  </td>
                  <td
                    style={{
                      padding: "12px 15px",
                      borderBottom: "none",
                    }}
                  >
                    <RoleBadge roleName={role.name} />
                  </td>
                  <td
                    style={{
                      padding: "12px 15px",
                      borderBottom: "none",
                      color: "#555",
                    }}
                  >
                    {formatDate(role.createdAt)}
                  </td>
                  <td
                    style={{
                      padding: "12px 15px",
                      borderBottom: "none",
                      color: "#555",
                    }}
                  >
                    <StatusBadge active={normalizeActive(role)} />
                  </td>
                  <td
                    style={{
                      padding: "12px 15px",
                      borderBottom: "none",
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
                      isSystemRole={isSystemRole(role.code)}
                      canViewRole={canViewRole}
                      canUpdateRole={canUpdateRole}
                      canDeleteRole={canDeleteRole}
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
        totalElements={totalElements}
        pageSize={pageSize}
        onPageSizeChange={onPageSizeChange}
      />

      {/* Confirm delete dialog */}
      <ConfirmDialog
        open={confirmState.open}
        title="Delete Role"
        message={`Are you sure you want to delete role "${
          confirmState.role?.name || confirmState.role?.code || "this role"
        }"?`}
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />
    </div>
  );
}

// Simple confirm dialog with overlay, styled to match app modals
function ConfirmDialog({
  open,
  title = "Confirm",
  message,
  confirmText = "OK",
  cancelText = "Cancel",
  onConfirm,
  onCancel,
}) {
  // ADD: enter + exit animation (same pattern as RoleModal)
  const ANIM_MS = 180;
  const [mounted, setMounted] = React.useState(false);
  const [animateIn, setAnimateIn] = React.useState(false);

  React.useEffect(() => {
    let raf1;
    let raf2;
    let timer;
    if (open) {
      setMounted(true);
      setAnimateIn(false);
      raf1 = requestAnimationFrame(() => {
        // force reflow to ensure initial styles apply before transition
        if (typeof document !== "undefined") void document.body.offsetHeight;
        raf2 = requestAnimationFrame(() => setAnimateIn(true));
      });
    } else {
      setAnimateIn(false);
      timer = setTimeout(() => setMounted(false), ANIM_MS);
    }
    return () => {
      if (raf1) cancelAnimationFrame(raf1);
      if (raf2) cancelAnimationFrame(raf2);
      if (timer) clearTimeout(timer);
    };
  }, [open]);

  if (!mounted) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className={`lm-role-confirm-overlay ${animateIn ? "is-open" : ""}`} // ADD className here
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
      <style>
        {`
          .lm-role-confirm-overlay {
            opacity: 0;
            transition: opacity ${ANIM_MS}ms ease-out;
          }
          .lm-role-confirm-overlay.is-open { opacity: 1; }
          .lm-role-confirm-card {
            opacity: 0;
            transform: translateY(8px) scale(0.98);
            transition: transform ${ANIM_MS}ms cubic-bezier(.2,.8,.2,1), opacity ${ANIM_MS}ms ease-out;
            will-change: transform, opacity;
          }
          .lm-role-confirm-card.is-open {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
          @media (prefers-reduced-motion: reduce) {
            .lm-role-confirm-overlay, .lm-role-confirm-card { transition: none !important; }
          }
        `}
      </style>

      <div
        className={`lm-role-confirm-card ${animateIn ? "is-open" : ""}`}
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
              fontSize: 16,
              color: "#FF5A5A",
            }}
          >
            {title}
          </div>
        </div>
        <div style={{ padding: "16px 20px", color: "#777777", fontSize: 16 }}>
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
              color: "#777777",
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
              backgroundColor: "#FF5A5A",
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
