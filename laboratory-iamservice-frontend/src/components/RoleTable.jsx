import React from "react";
import { FaEye, FaEdit, FaTrash, FaSearch, FaPlus } from "react-icons/fa";

export default function RoleTable({ roles }) {
  // Hàm format date từ ISO string sang định dạng dd/mm/yyyy
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return `${date.getDate().toString().padStart(2, "0")}/${(
      date.getMonth() + 1
    )
      .toString()
      .padStart(2, "0")}/${date.getFullYear()}`;
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
    <div className="role-table-container">
      {/* Phần thanh công cụ và tìm kiếm */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "15px",
        }}
      >
        <div
          className="search-container"
          style={{ display: "flex", alignItems: "center" }}
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
              backgroundColor: "#f8f9fa",
            }}
          >
            <FaSearch style={{ color: "#888", marginRight: "8px" }} />
            <input
              type="text"
              placeholder="Search"
              style={{
                border: "none",
                outline: "none",
                width: "100%",
                fontSize: "14px",
                backgroundColor: "#f8f9fa",
              }}
            />
          </div>
          <button
            style={{
              backgroundColor: "#ffffff",
              border: "1px solid #e0e0e0",
              borderRadius: "4px",
              padding: "5px 10px",
              marginLeft: "10px",
              cursor: "pointer",
            }}
          >
            <FaSearch style={{ fontSize: "14px", color: "#666" }} />
          </button>
          <button
            style={{
              backgroundColor: "#ffffff",
              border: "1px solid #e0e0e0",
              borderRadius: "4px",
              padding: "5px 10px",
              marginLeft: "5px",
              cursor: "pointer",
            }}
          >
            <FaPlus style={{ fontSize: "14px", color: "#666" }} />
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
      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
          borderRadius: "4px",
          overflow: "hidden",
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
              ID
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
              Privileges summary
            </th>
            <th
              style={{
                padding: "12px 15px",
                textAlign: "center",
                borderBottom: "1px solid #eaeaea",
                color: "#666",
                fontWeight: "600",
                fontSize: "14px",
              }}
            >
              Action
            </th>
          </tr>
        </thead>
        <tbody>
          {roles.map((role, index) => (
            <tr
              key={role.id}
              style={{ backgroundColor: index % 2 === 0 ? "#fff" : "#f9f9f9" }}
            >
              <td
                style={{
                  padding: "12px 15px",
                  borderBottom: "1px solid #eaeaea",
                  fontWeight: "500",
                  color: "#333",
                }}
              >
                {String(index + 1).padStart(4, "0")}
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
                  fontWeight: "500",
                  color: "#333",
                }}
              >
                {role.id}
              </td>
              <td
                style={{
                  padding: "12px 15px",
                  borderBottom: "1px solid #eaeaea",
                  maxWidth: "200px",
                  color: "#555",
                }}
              >
                {role.description.length > 30
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
                {role.privileges.split(",").slice(0, 3).join(", ")}
                {role.privileges.split(",").length > 3 ? "..." : ""}
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
          ))}
        </tbody>
      </table>

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
