import React, { useState, useEffect } from "react";
import { FaSearch } from "react-icons/fa";

export default function AccountSearchBar({
    onSearch,
    initialKeyword = "",
    initialFromDate = "",
    initialToDate = "",
    initialRoleFilter = "",
    roles = [],
}) {
    const [search, setSearch] = useState(initialKeyword);
    const [fromDate, setFromDate] = useState(initialFromDate);
    const [toDate, setToDate] = useState(initialToDate);
    const [roleFilter, setRoleFilter] = useState(initialRoleFilter);

    // Update local state when initial values change (from parent)
    useEffect(() => {
        setSearch(initialKeyword);
        setFromDate(initialFromDate);
        setToDate(initialToDate);
        setRoleFilter(initialRoleFilter);
    }, [initialKeyword, initialFromDate, initialToDate, initialRoleFilter]);

    const handleSearch = () => {
        onSearch(search.trim().toLowerCase(), fromDate, toDate, roleFilter);
    };

    const handleInputKeyDown = (e) => {
        if (e.key === "Enter") {
            handleSearch();
        }
    };

    // Auto-search when date changes
    const handleFromDateChange = (e) => {
        const newFromDate = e.target.value;
        setFromDate(newFromDate);
        // Trigger search immediately with new date
        onSearch(search.trim().toLowerCase(), newFromDate, toDate, roleFilter);
    };

    const handleToDateChange = (e) => {
        const newToDate = e.target.value;
        setToDate(newToDate);
        // Trigger search immediately with new date
        onSearch(search.trim().toLowerCase(), fromDate, newToDate, roleFilter);
    };

    const handleRoleChange = (e) => {
        const newRoleFilter = e.target.value;
        setRoleFilter(newRoleFilter);
        // Trigger search immediately with new role filter
        onSearch(search.trim().toLowerCase(), fromDate, toDate, newRoleFilter);
    };


    return (
        <div
            className="search-container"
            style={{ display: "flex", alignItems: "center", gap: 12 }}
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
                    placeholder="Search by name, email..."
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

            <span style={{ color: "#333", marginLeft: "8px" }}>Role:</span>
            <select
                value={roleFilter}
                onChange={handleRoleChange}
                style={{
                    padding: "5px 8px",
                    border: "1px solid #e0e0e0",
                    borderRadius: "4px",
                    fontSize: "14px",
                    backgroundColor: "#fff",
                    color: "#333",
                    marginLeft: "8px",
                    cursor: "pointer",
                }}
            >
                <option value="">All Roles</option>
                {roles && roles.length > 0 ? (
                    roles.map((role) => (
                        <option key={role.roleCode || role.code} value={role.roleCode || role.code}>
                            {role.roleName || role.name || role.roleCode || role.code}
                        </option>
                    ))
                ) : (
                    <>
                        <option value="ADMIN">ADMIN</option>
                        <option value="LAB_MANAGER">LAB MANAGER</option>
                        <option value="LAB_USER">LAB USER</option>
                    </>
                )}
            </select>

            <span style={{ color: "#333", marginLeft: "8px" }}>Created Date:</span>

            <div style={{ display: "inline-block", marginRight: "8px" }}>
                <input
                    type="date"
                    value={fromDate}
                    onChange={handleFromDateChange}
                    style={{
                        marginLeft: 8,
                        padding: "5px 8px",
                        border: "1px solid #e0e0e0",
                        borderRadius: "4px",
                        fontSize: "14px",
                        backgroundColor: "#fff",
                        color: "#333",
                        cursor: "pointer",
                        width: "140px",
                    }}
                />
            </div>

            <span style={{ margin: "0 4px", color: "#888" }}>-</span>

            <div style={{ display: "inline-block", marginLeft: "8px" }}>
                <input
                    type="date"
                    value={toDate}
                    onChange={handleToDateChange}
                    style={{
                        padding: "5px 8px",
                        border: "1px solid #e0e0e0",
                        borderRadius: "4px",
                        fontSize: "14px",
                        backgroundColor: "#fff",
                        color: "#333",
                        cursor: "pointer",
                        width: "140px",
                    }}
                />
            </div>

            <button
                style={{
                    backgroundColor: "#ffffff",
                    border: "1px solid #e0e0e0",
                    borderRadius: "4px",
                    padding: "5px 10px",
                    marginLeft: "8px",
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                }}
                onClick={handleSearch}
                onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "#f0f0f0";
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "#ffffff";
                }}
                title="Search"
            >
                <FaSearch style={{ fontSize: "14px", color: "#666" }} />
            </button>

        </div>
    );
}

