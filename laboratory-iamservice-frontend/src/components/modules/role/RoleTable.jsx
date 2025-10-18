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
import { formatDate, formatPrivileges } from "../../../utils/formatter";

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

  useEffect(() => {
    // Nếu parent đang xử lý sort ở BE (onSort được cung cấp), không sort ở client
    if (onSort) {
      setFilteredRoles(roles);
      return;
    }

    if (sortConfig.key) {
      // Luôn sort dựa trên danh sách roles mới nhất
      setFilteredRoles(sortRoles(roles));
    } else {
      setFilteredRoles(roles); // giữ nguyên thứ tự backend
    }
  }, [roles, sortConfig, onSort]);

  const handleSearch = (keyword, fromDate, toDate) => {
    if (onSearch) {
      onSearch(keyword, fromDate, toDate);
    }
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
        }}
      >
        <RoleSearchBar onSearch={handleSearch} />

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
                      color: "#555",
                    }}
                  >
                    {Array.isArray(role.privileges)
                      ? role.privileges.slice(0, 2).join(", ") +
                        (role.privileges.length > 2 ? "..." : "")
                      : typeof role.privileges === "string"
                      ? role.privileges.split(",").slice(0, 2).join(", ") +
                        (role.privileges.split(",").length > 2 ? "..." : "")
                      : "N/A"}
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
                      onDelete={onDelete}
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
    </div>
  );
}
