import React, { useState, useEffect, useCallback } from "react";
import {
    FaPlus,
    FaSort,
    FaSortAlphaDown,
    FaSortAlphaUp,
    FaEye,
    FaEdit,
    FaTrash,
    FaLock,
    FaUnlock,
} from "react-icons/fa";
import UserSearchBar from "./UserSearchBar";
import Pagination from "../../common/Pagination";
import StatusBadge from "../../common/StatusBadge";
import UserBadge from "./UserBadge";
import { formatDate } from "../../../utils/formatter";

export default function UserTable({
    users,
    onSearch,
    onSort,
    onDelete,
    onPageChange,
    onView,
    onEdit,
    onAdd,
    onToggleStatus,
    currentPage = 0,
    totalPages = 1,
}) {
    const [filteredUsers, setFilteredUsers] = useState(users);
    // Sorting: only 'name' and 'email' are sortable alphabetically
    const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });

    const sortUsers = useCallback((list) => {
        if (!sortConfig.key) return list;
        // Allow sorting by name, email, role, createdAt
        if (!["name", "email", "role", "createdAt"].includes(sortConfig.key)) return list;

        const sorted = [...list].sort((a, b) => {
            let aVal, bVal;

            if (sortConfig.key === "createdAt") {
                // Sort by date
                aVal = new Date(a[sortConfig.key] || 0);
                bVal = new Date(b[sortConfig.key] || 0);
            } else {
                // Sort by string
                aVal = (a[sortConfig.key] || "").toString().toLowerCase();
                bVal = (b[sortConfig.key] || "").toString().toLowerCase();
            }

            if (aVal < bVal) return sortConfig.direction === "asc" ? -1 : 1;
            if (aVal > bVal) return sortConfig.direction === "asc" ? 1 : -1;
            return 0;
        });
        return sorted;
    }, [sortConfig]);

    useEffect(() => {
        if (sortConfig.key) {
            setFilteredUsers((prev) => {
                const base = prev && prev.length ? prev : users;
                return sortUsers(base);
            });
        } else {
            setFilteredUsers(users); // giữ nguyên thứ tự backend
        }
    }, [users, sortConfig, sortUsers]);

    const handleSearch = (keyword, fromDate, toDate, roleFilter) => {
        if (onSearch) {
            onSearch(keyword, fromDate, toDate, roleFilter);
        } else {
            // Local filtering if no callback provided
            const filtered = users.filter((user) => {
                const matchKeyword =
                    user.name.toLowerCase().includes(keyword) ||
                    user.email.toLowerCase().includes(keyword) ||
                    (user.role && user.role.toLowerCase().includes(keyword));

                const matchDate =
                    (!fromDate || new Date(user.createdAt) >= new Date(fromDate)) &&
                    (!toDate || new Date(user.createdAt) <= new Date(toDate));

                const matchRole = !roleFilter || user.role === roleFilter;

                return matchKeyword && matchDate && matchRole;
            });
            setFilteredUsers(sortUsers(filtered));
        }
    };

    // Toggle sorting for allowed keys (name, email, role, createdAt)
    const toggleSort = (key) => {
        if (!["name", "email", "role", "createdAt"].includes(key)) return;
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
        <div className="user-table-container" style={{ width: "100%" }}>
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
                <UserSearchBar onSearch={handleSearch} />

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
                        onClick={() => (onAdd ? onAdd() : console.log("Add new user"))}
                    >
                        <FaPlus style={{ marginRight: "5px" }} />
                        Add New User
                    </button>
                </div>
            </div>

            {/* Bảng users */}
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
                                    minWidth: "80px",
                                    whiteSpace: "nowrap",
                                    verticalAlign: "middle",
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
                                    minWidth: "160px",
                                    whiteSpace: "nowrap",
                                    verticalAlign: "middle",
                                }}
                            >
                                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                    <span style={{ whiteSpace: "nowrap" }}>Name</span>

                                    <button
                                        onClick={() => toggleSort("name")}
                                        title="Sort by Name"
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
                                    minWidth: "160px",
                                    whiteSpace: "nowrap",
                                    verticalAlign: "middle",
                                }}
                            >
                                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                    <span style={{ whiteSpace: "nowrap" }}>Email</span>

                                    <button
                                        onClick={() => toggleSort("email")}
                                        title="Sort by Email"
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
                                        {sortConfig.key === "email" ? (
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
                                    minWidth: "120px",
                                    whiteSpace: "nowrap",
                                    verticalAlign: "middle",
                                }}
                            >
                                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                    <span style={{ whiteSpace: "nowrap" }}>Role</span>

                                    <button
                                        onClick={() => toggleSort("role")}
                                        title="Sort by Role"
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
                                        {sortConfig.key === "role" ? (
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
                                    minWidth: "120px",
                                    whiteSpace: "nowrap",
                                    verticalAlign: "middle",
                                }}
                            >
                                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                    <span style={{ whiteSpace: "nowrap" }}>Created Date</span>

                                    <button
                                        onClick={() => toggleSort("createdAt")}
                                        title="Sort by Created Date"
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
                                        {sortConfig.key === "createdAt" ? (
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
                        {filteredUsers.length === 0 ? (
                            <tr>
                                <td
                                    colSpan={7}
                                    style={{
                                        textAlign: "center",
                                        padding: "60px 20px",
                                        backgroundColor: "#fafafa",
                                    }}
                                >
                                    <div
                                        style={{
                                            display: "flex",
                                            flexDirection: "column",
                                            alignItems: "center",
                                            gap: "16px",
                                        }}
                                    >
                                        <div
                                            style={{
                                                width: "80px",
                                                height: "80px",
                                                borderRadius: "50%",
                                                backgroundColor: "#f0f0f0",
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                fontSize: "32px",
                                                color: "#ccc",
                                            }}
                                        >
                                            👥
                                        </div>
                                        <div>
                                            <h3
                                                style={{
                                                    margin: "0 0 8px 0",
                                                    fontSize: "18px",
                                                    fontWeight: "600",
                                                    color: "#666",
                                                }}
                                            >
                                                No Users Found
                                            </h3>
                                            <p
                                                style={{
                                                    margin: "0",
                                                    fontSize: "14px",
                                                    color: "#888",
                                                    maxWidth: "300px",
                                                }}
                                            >
                                                {users.length === 0
                                                    ? "There are no users in the system yet. Click 'Add New User' to create the first user."
                                                    : "No users match your current search criteria. Try adjusting your filters."}
                                            </p>
                                        </div>
                                        {users.length === 0 && (
                                            <button
                                                onClick={() => onAdd && onAdd()}
                                                style={{
                                                    backgroundColor: "#ff5a5f",
                                                    color: "white",
                                                    border: "none",
                                                    borderRadius: "6px",
                                                    padding: "10px 20px",
                                                    fontSize: "14px",
                                                    fontWeight: "500",
                                                    cursor: "pointer",
                                                    display: "flex",
                                                    alignItems: "center",
                                                    gap: "8px",
                                                }}
                                            >
                                                <FaPlus />
                                                Add First User
                                            </button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            filteredUsers.map((user, index) => (
                                <tr
                                    key={user.id}
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
                                        {user.id}
                                    </td>
                                    <td
                                        style={{
                                            padding: "12px 15px",
                                            borderBottom: "1px solid #eaeaea",
                                            fontWeight: "500",
                                            color: "#333",
                                        }}
                                    >
                                        {user.name}
                                    </td>
                                    <td
                                        style={{
                                            padding: "12px 15px",
                                            borderBottom: "1px solid #eaeaea",
                                            color: "#555",
                                        }}
                                    >
                                        {user.email}
                                    </td>
                                    <td
                                        style={{
                                            padding: "12px 15px",
                                            borderBottom: "1px solid #eaeaea",
                                        }}
                                    >
                                        <UserBadge roleName={user.role} />
                                    </td>
                                    <td
                                        style={{
                                            padding: "12px 15px",
                                            borderBottom: "1px solid #eaeaea",
                                            color: "#555",
                                        }}
                                    >
                                        {formatDate(user.createdAt)}
                                    </td>
                                    <td
                                        style={{
                                            padding: "12px 15px",
                                            borderBottom: "1px solid #eaeaea",
                                            display: "flex",
                                            justifyContent: "center",
                                            alignItems: "center",
                                            gap: "10px",
                                        }}
                                    >
                                        <button
                                            onClick={() => onView && onView(user)}
                                            style={{
                                                backgroundColor: "#5a67d8",
                                                color: "white",
                                                border: "none",
                                                borderRadius: "6px",
                                                padding: "8px 10px",
                                                cursor: "pointer",
                                                fontSize: "14px",
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                minWidth: "36px",
                                                minHeight: "36px",
                                                transition: "all 0.2s ease",
                                            }}
                                            title="View"
                                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#4c51bf"}
                                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "#5a67d8"}
                                        >
                                            <FaEye />
                                        </button>
                                        <button
                                            onClick={() => onEdit && onEdit(user)}
                                            style={{
                                                backgroundColor: "#f6ad55",
                                                color: "white",
                                                border: "none",
                                                borderRadius: "6px",
                                                padding: "8px 10px",
                                                cursor: "pointer",
                                                fontSize: "14px",
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                minWidth: "36px",
                                                minHeight: "36px",
                                                transition: "all 0.2s ease",
                                            }}
                                            title="Edit"
                                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#ed8936"}
                                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "#f6ad55"}
                                        >
                                            <FaEdit />
                                        </button>
                                        <button
                                            onClick={() => onToggleStatus && onToggleStatus(user)}
                                            style={{
                                                backgroundColor: user.isActive ? "#fc8181" : "#48bb78",
                                                color: "white",
                                                border: "none",
                                                borderRadius: "6px",
                                                padding: "8px 10px",
                                                cursor: "pointer",
                                                fontSize: "14px",
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                minWidth: "36px",
                                                minHeight: "36px",
                                                transition: "all 0.2s ease",
                                            }}
                                            title={user.isActive ? "Lock" : "Unlock"}
                                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = user.isActive ? "#f56565" : "#38a169"}
                                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = user.isActive ? "#fc8181" : "#48bb78"}
                                        >
                                            {user.isActive ? <FaLock /> : <FaUnlock />}
                                        </button>
                                        <button
                                            onClick={() => onDelete && onDelete(user.id)}
                                            style={{
                                                backgroundColor: "#fc8181",
                                                color: "white",
                                                border: "none",
                                                borderRadius: "6px",
                                                padding: "8px 10px",
                                                cursor: "pointer",
                                                fontSize: "14px",
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                minWidth: "36px",
                                                minHeight: "36px",
                                                transition: "all 0.2s ease",
                                            }}
                                            title="Delete"
                                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#f56565"}
                                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "#fc8181"}
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
            <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={onPageChange}
            />
        </div>
    );
}
