import React, { useState } from "react";
import { FaEye, FaEdit, FaTrash, FaSearch, FaPlus } from "react-icons/fa";

export default function RoleTable({ roles }) {
  const [search, setSearch] = useState("");
  const [filteredRoles, setFilteredRoles] = useState(roles);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  React.useEffect(() => {
    setFilteredRoles(roles);
  }, [roles]);

  const handleSearch = () => {
    const keyword = search.trim().toLowerCase();
    setFilteredRoles(
      roles.filter((role) => {
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
      })
    );
  };

  const handleInputKeyDown = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  // Hàm format date cần điều chỉnh để xử lý định dạng date từ backend
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";

    // Xử lý nếu dateString là một date đơn giản (YYYY-MM-DD)
    if (dateString.length === 10) {
      const [year, month, day] = dateString.split("-");
      return `${day || "?"}/${month || "?"}/${year || "?"}`;
    }

    // Xử lý nếu dateString là ISO date string
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "Invalid date";

    return `${date.getDate().toString().padStart(2, "0")}/${(
      date.getMonth() + 1
    )
      .toString()
      .padStart(2, "0")}/${date.getFullYear()}`;
  };

  // Function để xử lý privileges
  const formatPrivileges = (privileges) => {
    if (!privileges) return "N/A";

    // Nếu privileges đã là string, split nó
    if (typeof privileges === "string") {
      const privilegesArr = privileges.split(",");
      return (
        privilegesArr.slice(0, 3).join(", ") +
        (privilegesArr.length > 3 ? "..." : "")
      );
    }

    // Nếu privileges là array (từ dữ liệu cũ)
    if (Array.isArray(privileges)) {
      return (
        privileges.slice(0, 3).join(", ") + (privileges.length > 3 ? "..." : "")
      );
    }

    return "N/A";
  };

  // Function để render badge dựa trên loại role
  const RoleBadge = ({ roleName }) => {
    let badgeStyle = {};

    switch (roleName.toLowerCase()) {
      case "administrator":
        badgeStyle = {
          backgroundColor: "#2ecc71", // Xanh lá
          color: "white",
        };
        break;
      case "manager":
      case "lab manager":
        badgeStyle = {
          backgroundColor: "#9b59b6", // Tím
          color: "white",
        };
        break;
      case "lab user":
        badgeStyle = {
          backgroundColor: "#e74c3c", // Đỏ
          color: "white",
        };
        break;
      case "service user":
        badgeStyle = {
          backgroundColor: "#3498db", // Xanh dương
          color: "white",
        };
        break;
      default:
        badgeStyle = {
          backgroundColor: "#95a5a6", // Xám
          color: "white",
        };
    }

    return (
      <span
        style={{
          ...badgeStyle,
          padding: "4px 10px",
          borderRadius: "4px",
          fontSize: "12px",
          fontWeight: "bold",
          display: "inline-block",
          minWidth: "80px",
          textAlign: "center",
          boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
          textShadow: "0 1px 1px rgba(0,0,0,0.1)",
        }}
      >
        {roleName}
      </span>
    );
  };

  return (
    <div className="role-table-container" style={{ width: "100%" }}>
      {/* Phần thanh công cụ và tìm kiếm */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "15px",
          width: "100%",
        }}
      >
        <div
          className="search-container"
          style={{ display: "flex", alignItems: "center", gap: 8 }}
        >
          <div
            style={{
              position: "relative",
              display: "flex",
              alignItems: "center",
              border: "1px solid #e0e0e0",
              borderRadius: "4px",
              padding: "5px 10px",
              width: "200px",
              backgroundColor: "#f0f0f0",
            }}
          >
            <FaSearch style={{ color: "#888", marginRight: "8px" }} />
            <input
              type="text"
              placeholder="Search by name, code, privileges"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={handleInputKeyDown}
              style={{
                border: "none",
                outline: "none",
                width: "100%",
                fontSize: "14px",
                backgroundColor: "#ffffff",
                padding: "5px 2px",
                color: "#333",
              }}
            />
          </div>
          <input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            style={{
              marginLeft: 8,
              padding: "5px 8px",
              border: "1px solid #e0e0e0",
              borderRadius: "4px",
              fontSize: "14px",
              backgroundColor: "#fff",
              color: "#333",
            }}
            placeholder="From date"
          />
          <span style={{ margin: "0 4px", color: "#888" }}>-</span>
          <input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            style={{
              padding: "5px 8px",
              border: "1px solid #e0e0e0",
              borderRadius: "4px",
              fontSize: "14px",
              backgroundColor: "#fff",
              color: "#333",
            }}
            placeholder="To date"
          />
          <button
            style={{
              backgroundColor: "#ffffff",
              border: "1px solid #e0e0e0",
              borderRadius: "4px",
              padding: "5px 10px",
              marginLeft: "10px",
              cursor: "pointer",
            }}
            onClick={handleSearch}
          >
            <FaSearch style={{ fontSize: "14px", color: "#666" }} />
          </button>
        </div>

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
                }}
              >
                Role Code
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
                Role Name
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
                    {role.isActive ? (
                      <span
                        style={{
                          backgroundColor: "#2ecc71",
                          color: "white",
                          padding: "3px 8px",
                          borderRadius: "3px",
                          fontSize: "12px",
                        }}
                      >
                        Active
                      </span>
                    ) : (
                      <span
                        style={{
                          backgroundColor: "#e74c3c",
                          color: "white",
                          padding: "3px 8px",
                          borderRadius: "3px",
                          fontSize: "12px",
                        }}
                      >
                        Inactive
                      </span>
                    )}
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
                    <button
                      style={{
                        backgroundColor: "#3498db",
                        color: "white",
                        border: "none",
                        borderRadius: "4px",
                        padding: "5px 10px",
                        cursor: "pointer",
                        boxShadow: "0 1px 2px rgba(0,0,0,0.1)",
                        transition: "all 0.2s ease",
                      }}
                      title="View"
                    >
                      <FaEye />
                    </button>
                    <button
                      style={{
                        backgroundColor: "#f39c12",
                        color: "white",
                        border: "none",
                        borderRadius: "4px",
                        padding: "5px 10px",
                        cursor: "pointer",
                        boxShadow: "0 1px 2px rgba(0,0,0,0.1)",
                        transition: "all 0.2s ease",
                      }}
                      title="Edit"
                    >
                      <FaEdit />
                    </button>
                    <button
                      style={{
                        backgroundColor: "#e74c3c",
                        color: "white",
                        border: "none",
                        borderRadius: "4px",
                        padding: "5px 10px",
                        cursor: "pointer",
                        boxShadow: "0 1px 2px rgba(0,0,0,0.1)",
                        transition: "all 0.2s ease",
                      }}
                      title="Delete"
                    >
                      <FaTrash />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Phần pagination */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          marginTop: "20px",
          gap: "5px",
        }}
      >
        <button
          style={{
            backgroundColor: "#ffffff",
            border: "1px solid #e0e0e0",
            borderRadius: "4px",
            padding: "5px 10px",
            cursor: "pointer",
            color: "#666",
          }}
        >
          &lt;&lt;
        </button>
        <button
          style={{
            backgroundColor: "#ffffff",
            border: "1px solid #e0e0e0",
            borderRadius: "4px",
            padding: "5px 10px",
            cursor: "pointer",
            color: "#666",
          }}
        >
          &lt;
        </button>
        <button
          style={{
            backgroundColor: "#ff5a5f",
            color: "white",
            border: "none",
            borderRadius: "4px",
            padding: "5px 10px",
            cursor: "pointer",
          }}
        >
          1
        </button>
        <button
          style={{
            backgroundColor: "#ffffff",
            border: "1px solid #e0e0e0",
            borderRadius: "4px",
            padding: "5px 10px",
            cursor: "pointer",
            color: "#666",
          }}
        >
          2
        </button>
        <button
          style={{
            backgroundColor: "#ffffff",
            border: "1px solid #e0e0e0",
            borderRadius: "4px",
            padding: "5px 10px",
            cursor: "pointer",
            color: "#666",
          }}
        >
          3
        </button>
        <button
          style={{
            backgroundColor: "#ffffff",
            border: "1px solid #e0e0e0",
            borderRadius: "4px",
            padding: "5px 10px",
            cursor: "pointer",
            color: "#666",
          }}
        >
          &gt;
        </button>
        <button
          style={{
            backgroundColor: "#ffffff",
            border: "1px solid #e0e0e0",
            borderRadius: "4px",
            padding: "5px 10px",
            cursor: "pointer",
            color: "#666",
          }}
        >
          &gt;&gt;
        </button>
      </div>
    </div>
  );
}
