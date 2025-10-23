import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { FaSearch, FaCalendarAlt, FaTimes } from "react-icons/fa";
import { fetchRolesForUser } from "../../../redux/features/userManagementSlice";

export default function UserSearchBar({
    onSearch,
    initialKeyword = "",
    initialFromDate = "",
    initialToDate = "",
    initialRoleFilter = ""
}) {
    const dispatch = useDispatch();
    const { roles } = useSelector((state) => state.users);

    const [search, setSearch] = useState(initialKeyword);
    const [fromDate, setFromDate] = useState(initialFromDate);
    const [toDate, setToDate] = useState(initialToDate);
    const [roleFilter, setRoleFilter] = useState(initialRoleFilter);

    // Fetch roles from backend on mount
    useEffect(() => {
        dispatch(fetchRolesForUser());
    }, [dispatch]);

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

    // Auto-search when role changes (no flickering since it's a single select action)
    const handleRoleChange = (e) => {
        const newRole = e.target.value;
        setRoleFilter(newRole);
        // Trigger search immediately with new role
        onSearch(search.trim().toLowerCase(), fromDate, toDate, newRole);
    };

    // Auto-search when date changes (no flickering since it's a single date pick action)
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

    const handleReset = () => {
        setSearch("");
        setFromDate("");
        setToDate("");
        setRoleFilter("");
        onSearch("", "", "", "");
    };

    return (
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
            <span style={{ color: "#333" }}>Role:</span>
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
                    // Fallback options if roles haven't loaded yet
                    <>
                        <option value="ADMIN">Administrator</option>
                        <option value="MANAGER">Manager</option>
                        <option value="LAB_USER">Lab User</option>
                        <option value="SERVICE_USER">Service User</option>
                        <option value="GUEST">Guest</option>
                    </>
                )}
            </select>

            <span style={{ color: "#333", marginLeft: "16px" }}>Created Date:</span>

            <div style={{ position: "relative", display: "inline-block" }}>
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
                    }}
                />
                <FaCalendarAlt
                    style={{
                        position: "absolute",
                        right: 8,
                        top: "50%",
                        transform: "translateY(-50%)",
                        color: "#666",
                        pointerEvents: "none",
                    }}
                />
            </div>

            <span style={{ margin: "0 4px", color: "#888" }}>-</span>

            <div style={{ position: "relative", display: "inline-block" }}>
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
                    }}
                />
                <FaCalendarAlt
                    style={{
                        position: "absolute",
                        right: 8,
                        top: "50%",
                        transform: "translateY(-50%)",
                        color: "#666",
                        pointerEvents: "none",
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

            <button
                style={{
                    backgroundColor: "#fff5f5",
                    border: "1px solid #e0e0e0",
                    borderRadius: "4px",
                    padding: "5px 10px",
                    marginLeft: "5px",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "5px",
                    fontSize: "14px",
                    color: "#666",
                    transition: "all 0.2s ease",
                }}
                onClick={handleReset}
                onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "#fee";
                    e.currentTarget.style.borderColor = "#ff5a5f";
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "#fff5f5";
                    e.currentTarget.style.borderColor = "#e0e0e0";
                }}
                title="Reset filters"
            >
                <FaTimes style={{ fontSize: "12px" }} />
                Reset
            </button>
        </div>
    );
}
