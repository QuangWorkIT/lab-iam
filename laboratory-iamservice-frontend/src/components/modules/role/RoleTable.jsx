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
    if (sortConfig.key) {
      setFilteredRoles((prev) => {
        const base = prev && prev.length ? prev : roles;
        return sortRoles(base);
      });
    } else {
      setFilteredRoles(roles); // giữ nguyên thứ tự backend
    }
  }, [roles, sortConfig]);

  const handleSearch = (keyword, fromDate, toDate) => {
    if (onSearch) {
      onSearch(keyword, fromDate, toDate);
    } else {
      // Local filtering if no callback provided
      const filtered = roles.filter((role) => {
        const matchKeyword =
          role.name.toLowerCase().includes(keyword) ||
          role.code.toLowerCase().includes(keyword) ||
          (role.description &&
            role.description.toLowerCase().includes(keyword)) ||
          (role.privileges && role.privileges.toLowerCase().includes(keyword));

        const matchDate =
          (!fromDate || new Date(role.createdAt) >= new Date(fromDate)) &&
          (!toDate || new Date(role.createdAt) <= new Date(toDate));

        return matchKeyword && matchDate;
      });
      setFilteredRoles(sortRoles(filtered));
    }
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
              backgroundColor: "#ff5a5f",
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
                        <FaSortAlphaDown style={{ color: "#ff5a5f" }} />
                      ) : (
                        <FaSortAlphaUp style={{ color: "#ff5a5f" }} />
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
                        <FaSortAlphaDown style={{ color: "#ff5a5f" }} />
                      ) : (
                        <FaSortAlphaUp style={{ color: "#ff5a5f" }} />
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
                    {formatPrivileges(role.privileges)}
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
                    <StatusBadge active={role.isActive} />
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
