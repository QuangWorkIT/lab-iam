import React, { useState, useEffect } from "react";
import {
    FaEye,
    FaUnlock,
} from "react-icons/fa";
import AccountSearchBar from "./AccountSearchBar";
import StatusBadge from "../../common/StatusBadge";
import UserBadge from "../user/UserBadge";
import { formatDate, truncateId } from "../../../utils/formatter";

export default function AccountTable({
    accounts,
    loading = false,
    onSearch,
    onView,
    onActivate,
    searchParams = {},
}) {
    const [filteredAccounts, setFilteredAccounts] = useState([]);

    // Client-side filtering
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

        // Apply role filter
        if (searchParams.roleFilter) {
            result = result.filter((acc) => acc.role === searchParams.roleFilter);
        }

        setFilteredAccounts(result);
    }, [accounts, searchParams]);

    const handleSearch = (keyword, fromDate, toDate, roleFilter) => {
        if (onSearch) {
            onSearch(keyword, fromDate, toDate, roleFilter);
        }
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
                    initialRoleFilter={searchParams.roleFilter || ""}
                    roles={[]}
                />
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
                        fontFamily: "Arial, Helvetica, sans-serif",
                    }}
                >
                    <thead>
                        <tr style={{ backgroundColor: "#ff5a5f" }}>
                            <th
                                style={{
                                    padding: "12px 15px",
                                    textAlign: "left",
                                    borderBottom: "none",
                                    color: "white",
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
                                    borderBottom: "none",
                                    color: "white",
                                    fontWeight: "600",
                                    fontSize: "14px",
                                    minWidth: "160px",
                                    whiteSpace: "nowrap",
                                    verticalAlign: "middle",
                                }}
                            >
                                Name
                            </th>
                            <th
                                style={{
                                    padding: "12px 15px",
                                    textAlign: "left",
                                    borderBottom: "none",
                                    color: "white",
                                    fontWeight: "600",
                                    fontSize: "14px",
                                    minWidth: "160px",
                                    whiteSpace: "nowrap",
                                    verticalAlign: "middle",
                                }}
                            >
                                Email
                            </th>
                            <th
                                style={{
                                    padding: "12px 15px 12px 22px",
                                    textAlign: "left",
                                    borderBottom: "none",
                                    color: "white",
                                    fontWeight: "600",
                                    fontSize: "14px",
                                    minWidth: "120px",
                                    whiteSpace: "nowrap",
                                    verticalAlign: "middle",
                                }}
                            >
                                Role
                            </th>
                            <th
                                style={{
                                    padding: "12px 15px",
                                    textAlign: "center",
                                    borderBottom: "none",
                                    color: "white",
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
                                    borderBottom: "none",
                                    color: "white",
                                    fontWeight: "600",
                                    fontSize: "14px",
                                    minWidth: "120px",
                                    whiteSpace: "nowrap",
                                    verticalAlign: "middle",
                                }}
                            >
                                Created Date
                            </th>
                            <th
                                style={{
                                    padding: "12px 15px",
                                    textAlign: "center",
                                    borderBottom: "none",
                                    color: "white",
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
                            filteredAccounts.map((account) => (
                                <tr
                                    key={account.id}
                                    style={{
                                        backgroundColor: "#fff",
                                    }}
                                >
                                    <td
                                        style={{
                                            padding: "12px 15px",
                                            borderBottom: "none",
                                            fontWeight: "500",
                                            color: "#000",
                                        }}
                                        title={account.id}
                                    >
                                        {truncateId(account.id)}
                                    </td>
                                    <td
                                        style={{
                                            padding: "12px 15px",
                                            borderBottom: "none",
                                            fontWeight: "500",
                                            color: "#000",
                                        }}
                                    >
                                        {account.name}
                                    </td>
                                    <td
                                        style={{
                                            padding: "12px 15px",
                                            borderBottom: "none",
                                            color: "#000",
                                        }}
                                    >
                                        {account.email}
                                    </td>
                                    <td
                                        style={{
                                            padding: "12px 15px",
                                            borderBottom: "none",
                                        }}
                                    >
                                        <UserBadge roleName={account.role} />
                                    </td>
                                    <td
                                        style={{
                                            padding: "12px 15px",
                                            borderBottom: "none",
                                            textAlign: "center",
                                        }}
                                    >
                                        <StatusBadge active={account.isActive} />
                                    </td>
                                    <td
                                        style={{
                                            padding: "12px 15px",
                                            borderBottom: "none",
                                            color: "#000",
                                        }}
                                    >
                                        {formatDate(account.createdAt)}
                                    </td>
                                    <td
                                        style={{
                                            padding: "12px 15px",
                                            borderBottom: "none",
                                            display: "flex",
                                            justifyContent: "center",
                                            alignItems: "center",
                                            gap: "10px",
                                        }}
                                    >
                                        <button
                                            onClick={() => onView && onView(account)}
                                            style={{
                                                backgroundColor: "transparent",
                                                color: "#ff5a5f",
                                                border: "none",
                                                padding: "5px",
                                                cursor: "pointer",
                                                fontSize: "18px",
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                transition: "all 0.2s ease",
                                            }}
                                            title="View Details"
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

