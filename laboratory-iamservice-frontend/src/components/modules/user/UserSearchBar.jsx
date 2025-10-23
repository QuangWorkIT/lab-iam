import React, { useState } from "react";
import { FaSearch, FaCalendarAlt, FaTimes } from "react-icons/fa";

export default function UserSearchBar({ onSearch }) {
    const [search, setSearch] = useState("");
    const [fromDate, setFromDate] = useState("");
    const [toDate, setToDate] = useState("");
    const [roleFilter, setRoleFilter] = useState("");

    const handleSearch = () => {
        onSearch(search.trim().toLowerCase(), fromDate, toDate, roleFilter);
    };

    const handleInputKeyDown = (e) => {
        if (e.key === "Enter") {
            handleSearch();
        }
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
                onChange={(e) => setRoleFilter(e.target.value)}
                style={{
                    padding: "5px 8px",
                    border: "1px solid #e0e0e0",
                    borderRadius: "4px",
                    fontSize: "14px",
                    backgroundColor: "#fff",
                    color: "#333",
                    marginLeft: "8px",
                }}
            >
                <option value="">All Roles</option>
                <option value="ADMIN">Administrator</option>
                <option value="LAB USER">Lab User</option>
                <option value="MANAGER">Manager</option>
                <option value="SERVICE USER">Service User</option>
                <option value="GUEST">Guest</option>
            </select>

            <span style={{ color: "#333", marginLeft: "16px" }}>Created Date:</span>

            <div style={{ position: "relative", display: "inline-block" }}>
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
                    onChange={(e) => setToDate(e.target.value)}
                    style={{
                        padding: "5px 8px",
                        border: "1px solid #e0e0e0",
                        borderRadius: "4px",
                        fontSize: "14px",
                        backgroundColor: "#fff",
                        color: "#333",
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
