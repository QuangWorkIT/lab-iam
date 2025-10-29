import React, { useEffect, useState } from "react";
import { FaSearch } from "react-icons/fa";

export default function RoleSearchBar({
  onSearch,
  initialKeyword = "",
  initialFromDate = "",
  initialToDate = "",
  initialRoleFilter = "",
  roleOptions = [],
}) {
  const [search, setSearch] = useState(initialKeyword);
  const [fromDate, setFromDate] = useState(initialFromDate);
  const [toDate, setToDate] = useState(initialToDate);
  const [roleFilter, setRoleFilter] = useState(initialRoleFilter);

  // Đồng bộ khi props initial thay đổi
  useEffect(() => {
    setSearch(initialKeyword);
    setFromDate(initialFromDate);
    setToDate(initialToDate);
    setRoleFilter(initialRoleFilter);
  }, [initialKeyword, initialFromDate, initialToDate, initialRoleFilter]);

  const handleSearch = (e) => {
    // Ngăn chặn hành vi mặc định của form để tránh reload trang
    if (e) e.preventDefault();
    const searchKeyword =
      search.trim() === "" ? "" : search.trim().toLowerCase();
    onSearch(searchKeyword, fromDate, toDate, roleFilter);
  };

  const handleInputKeyDown = (e) => {
    if (e.key === "Enter") {
      // Ngăn chặn submit form mặc định khi nhấn Enter
      e.preventDefault();
      handleSearch();
    }
  };

  const handleRoleChange = (e) => {
    const newRole = e.target.value;
    setRoleFilter(newRole);
    // Tự động search khi đổi role
    const searchKeyword =
      search.trim() === "" ? "" : search.trim().toLowerCase();
    onSearch(searchKeyword, fromDate, toDate, newRole);
  };

  return (
    // Wrap trong form và xử lý onSubmit (Enter). Nút Search dùng onClick để tránh submit mặc định.
    <form
      onSubmit={handleSearch}
      className="search-container"
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        flexWrap: "wrap", // allow wrapping to avoid horizontal overflow
        rowGap: 8, // space between wrapped rows
        maxWidth: "100%",
      }}
      role="search"
      aria-label="Role search"
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
          minWidth: 160, // allow shrink but keep reasonable min
          flexShrink: 1, // let it shrink on small widths
          backgroundColor: "#f0f0f0",
        }}
      >
        <FaSearch style={{ color: "#888", marginRight: "8px" }} />
        <input
          type="text"
          placeholder="Search by name or code"
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
          aria-label="Search by name, code, or privileges"
          name="keyword"
          autoComplete="off"
        />
      </div>

      {/* Ô lọc Role */}
      <span style={{ color: "#333", marginLeft: "8px" }}>Role:</span>
      <select
        value={roleFilter}
        onChange={handleRoleChange}
        style={{
          padding: "5px 8px",
          border: "1px solid #e1e7ef",
          borderRadius: "4px",
          fontSize: "14px",
          backgroundColor: "#fff",
          color: "#333",
          marginLeft: "8px",
          cursor: "pointer",
          flexShrink: 1,
        }}
        aria-label="Role filter"
        name="roleFilter"
      >
        <option value="">All Roles</option>
        {(roleOptions || []).map((r) => {
          const value = r.code || r.roleCode || "";
          const label = r.name || r.roleName || value;
          return (
            <option key={value} value={value}>
              {label}
            </option>
          );
        })}
      </select>

      <span style={{ color: "#333", marginLeft: "16px" }}>Created Date:</span>

      <div style={{ display: "inline-block" }}>
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
            cursor: "pointer",
          }}
          aria-label="From date"
          name="fromDate"
        />
      </div>

      <span style={{ margin: "0 4px", color: "#888" }}>-</span>

      <div style={{ display: "inline-block" }}>
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
            cursor: "pointer",
          }}
          aria-label="To date"
          name="toDate"
        />
      </div>

      <button
        type="button"
        onClick={handleSearch}
        style={{
          backgroundColor: "#ffffff",
          border: "1px solid #e1e7ef",
          borderRadius: "4px",
          padding: "5px 10px",
          marginLeft: "10px",
          cursor: "pointer",
          flexShrink: 0,
        }}
        aria-label="Search"
        title="Search"
      >
        <FaSearch style={{ fontSize: "14px", color: "#666" }} />
      </button>
    </form>
  );
}
