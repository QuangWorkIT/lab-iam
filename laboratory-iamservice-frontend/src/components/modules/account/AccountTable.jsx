import React, { useState, useEffect } from "react";
import {
    FaSort,
    FaSortAlphaDown,
    FaSortAlphaUp,
    FaEye,
    FaUnlock,
    FaSync,
} from "react-icons/fa";
import AccountSearchBar from "./AccountSearchBar";
import StatusBadge from "../../common/StatusBadge";
import UserBadge from "../user/UserBadge";
import { formatDate } from "../../../utils/formatter";

export default function AccountTable({
    accounts,
    loading = false,
    onSearch,
    onView,
    onActivate,
    onRefresh,
    searchParams = {},
}) {
    const [filteredAccounts, setFilteredAccounts] = useState([]);
    const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });

    // Client-side filtering and sorting
    useEffect(() => {
        let result = [...accounts];

        // Apply search filters
        if (searchParams.keyword) {
            const kw = searchParams.keyword.toLowerCase();
            result = result.filter(
                (acc) =>
                    (acc.name && acc.name.toLowerCase().includes(kw)) ||
                    (acc.email && acc.email.toLowerCase().includes(kw)) ||
                    (acc.role && acc.role.toLowerCase().includes(kw))
            );
        }

        // Apply date filters
        if (searchParams.fromDate) {
            result = result.filter((acc) => acc.createdAt && acc.createdAt >= searchParams.fromDate);
        }
        if (searchParams.toDate) {
            result = result.filter((acc) => acc.createdAt && acc.createdAt <= searchParams.toDate);
        }

        // Apply sorting
        if (sortConfig.key && ["name", "email", "role", "createdAt"].includes(sortConfig.key)) {
            result.sort((a, b) => {
                let aVal, bVal;

                if (sortConfig.key === "createdAt") {
                    aVal = new Date(a[sortConfig.key] || 0);
                    bVal = new Date(b[sortConfig.key] || 0);
                } else {
                    aVal = (a[sortConfig.key] || "").toString().toLowerCase();
                    bVal = (b[sortConfig.key] || "").toString().toLowerCase();
                }

                if (aVal < bVal) return sortConfig.direction === "asc" ? -1 : 1;
                if (aVal > bVal) return sortConfig.direction === "asc" ? 1 : -1;
                return 0;
            });
        }

        setFilteredAccounts(result);
    }, [accounts, searchParams, sortConfig]);

    const handleSearch = (keyword, fromDate, toDate) => {
        if (onSearch) {
            onSearch(keyword, fromDate, toDate);
        }
    };

    const toggleSort = (key) => {
        if (!["name", "email", "role", "createdAt"].includes(key)) return;
        const direction =
            sortConfig.key === key && sortConfig.direction === "asc" ? "desc" : "asc";
        setSortConfig({ key, direction });
    };

    return (
        <div className="account-table-container" style={{ width: "100%" }}>
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
                <AccountSearchBar
                    onSearch={handleSearch}
                    initialKeyword={searchParams.keyword || ""}
                    initialFromDate={searchParams.fromDate || ""}
                    initialToDate={searchParams.toDate || ""}
                />

                <button
                    onClick={() => onRefresh && onRefresh()}
                    disabled={loading}
                    style={{
                        backgroundColor: loading ? "#ccc" : "#5a67d8",
                        color: "white",
                        border: "none",
                        borderRadius: "4px",
                        padding: "8px 15px",
                        fontWeight: "bold",
                        cursor: loading ? "not-allowed" : "pointer",
                        display: "flex",
                        alignItems: "center",
                        fontSize: "14px",
                        gap: "8px",
                        transition: "all 0.2s ease",
                    }}
                    onMouseEnter={(e) => {
                        if (!loading) e.currentTarget.style.backgroundColor = "#4c51bf";
                    }}
                    onMouseLeave={(e) => {
                        if (!loading) e.currentTarget.style.backgroundColor = "#5a67d8";
                    }}
                    title="Refresh inactive accounts list"
                >
                    <FaSync style={{
                        animation: loading ? "spin 1s linear infinite" : "none",
                    }} />
                    Refresh
                </button>
            </div>

            <style>{`
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
            `}</style>

            {/* Account table */}
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
                                    textAlign: "center",
                                    borderBottom: "1px solid #eaeaea",
                                    color: "#666",
                                    fontWeight: "600",
                                    fontSize: "14px",
                                    minWidth: "100px",
                                    whiteSpace: "nowrap",
                                    verticalAlign: "middle",
                                }}
                            >
                                Status
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
                        {loading ? (
                            <tr>
                                <td
                                    colSpan={7}
                                    style={{
                                        textAlign: "center",
                                        padding: "60px 20px",
                                        backgroundColor: "#fafafa",
                                    }}
                                >
                                    <div style={{ fontSize: "16px", color: "#666" }}>
                                        Loading inactive accounts...
                                    </div>
                                </td>
                            </tr>
                        ) : filteredAccounts.length === 0 ? (
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
                                            ✅
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
                                                No Inactive Accounts
                                            </h3>
                                            <p
                                                style={{
                                                    margin: "0",
                                                    fontSize: "14px",
                                                    color: "#888",
                                                    maxWidth: "350px",
                                                }}
                                            >
                                                {accounts.length === 0
                                                    ? "Great! All accounts are currently active. There are no pending accounts to approve."
                                                    : "No accounts match your current search criteria. Try adjusting your filters."}
                                            </p>
                                        </div>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            filteredAccounts.map((account, index) => (
                                <tr
                                    key={account.id}
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
                                        {account.id}
                                    </td>
                                    <td
                                        style={{
                                            padding: "12px 15px",
                                            borderBottom: "1px solid #eaeaea",
                                            fontWeight: "500",
                                            color: "#333",
                                        }}
                                    >
                                        {account.name}
                                    </td>
                                    <td
                                        style={{
                                            padding: "12px 15px",
                                            borderBottom: "1px solid #eaeaea",
                                            color: "#555",
                                        }}
                                    >
                                        {account.email}
                                    </td>
                                    <td
                                        style={{
                                            padding: "12px 15px",
                                            borderBottom: "1px solid #eaeaea",
                                        }}
                                    >
                                        <UserBadge roleName={account.role} />
                                    </td>
                                    <td
                                        style={{
                                            padding: "12px 15px",
                                            borderBottom: "1px solid #eaeaea",
                                            textAlign: "center",
                                        }}
                                    >
                                        <StatusBadge active={account.isActive} />
                                    </td>
                                    <td
                                        style={{
                                            padding: "12px 15px",
                                            borderBottom: "1px solid #eaeaea",
                                            color: "#555",
                                        }}
                                    >
                                        {formatDate(account.createdAt)}
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
                                            onClick={() => onView && onView(account)}
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
                                            title="View Details"
                                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#4c51bf"}
                                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "#5a67d8"}
                                        >
                                            <FaEye />
                                        </button>
                                        {!account.isActive && (
                                            <button
                                                onClick={() => onActivate && onActivate(account)}
                                                style={{
                                                    backgroundColor: "#48bb78",
                                                    color: "white",
                                                    border: "none",
                                                    borderRadius: "6px",
                                                    padding: "8px 12px",
                                                    cursor: "pointer",
                                                    fontSize: "14px",
                                                    display: "flex",
                                                    alignItems: "center",
                                                    justifyContent: "center",
                                                    gap: "6px",
                                                    minHeight: "36px",
                                                    transition: "all 0.2s ease",
                                                    fontWeight: "500",
                                                }}
                                                title="Activate Account"
                                                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#38a169"}
                                                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "#48bb78"}
                                            >
                                                <FaUnlock />
                                                <span>Activate</span>
                                            </button>
                                        )}
                                        {account.isActive && (
                                            <span
                                                style={{
                                                    color: "#48bb78",
                                                    fontSize: "14px",
                                                    fontWeight: "500",
                                                    padding: "8px 12px",
                                                }}
                                            >
                                                ✓ Active
                                            </span>
                                        )}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Summary info */}
            {!loading && filteredAccounts.length > 0 && (
                <div style={{ marginTop: "16px", textAlign: "right", fontSize: "14px", color: "#666" }}>
                    Showing {filteredAccounts.length} inactive account{filteredAccounts.length !== 1 ? 's' : ''}
                    {filteredAccounts.length !== accounts.length && ` (filtered from ${accounts.length} total)`}
                </div>
            )}
        </div>
    );
}

