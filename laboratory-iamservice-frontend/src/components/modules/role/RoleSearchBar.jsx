import React, { useState } from "react";
import { FaSearch, FaCalendarAlt } from "react-icons/fa";

export default function RoleSearchBar({ onSearch }) {
  const [search, setSearch] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const handleSearch = (e) => {
    // Ngăn chặn hành vi mặc định của form để tránh reload trang
    if (e) e.preventDefault();

    onSearch(search.trim().toLowerCase(), fromDate, toDate);
  };

  const handleInputKeyDown = (e) => {
    if (e.key === "Enter") {
      // Ngăn chặn submit form mặc định khi nhấn Enter
      e.preventDefault();
      handleSearch();
    }
  };

  return (
    // Wrap trong form và xử lý onSubmit (Enter). Nút Search dùng onClick để tránh submit mặc định.
    <form
      onSubmit={handleSearch}
      className="search-container"
      style={{ display: "flex", alignItems: "center", gap: 8 }}
      role="search"
      aria-label="Role search"
    >
      <div
        style={{
          position: "relative",
          display: "flex",
          alignItems: "center",
          border: "1px solid #e1e7ef",
          borderRadius: "4px",
          padding: "5px 10px",
          width: "200px",
          backgroundColor: "#e1e7ef",
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
      <span style={{ color: "#333" }}>Created Date:</span>

      <div style={{ position: "relative", display: "inline-block" }}>
        <input
          type="date"
          value={fromDate}
          onChange={(e) => setFromDate(e.target.value)}
          style={{
            marginLeft: 8,
            padding: "5px 8px",
            border: "1px solid #e1e7ef",
            borderRadius: "4px",
            fontSize: "14px",
            backgroundColor: "#fff",
            color: "#333",
          }}
          aria-label="From date"
          name="fromDate"
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
            border: "1px solid #e1e7ef",
            borderRadius: "4px",
            fontSize: "14px",
            backgroundColor: "#fff",
            color: "#333",
          }}
          aria-label="To date"
          name="toDate"
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
        type="button"
        onClick={handleSearch}
        style={{
          backgroundColor: "#ffffff",
          border: "1px solid #e1e7ef",
          borderRadius: "4px",
          padding: "5px 10px",
          marginLeft: "10px",
          cursor: "pointer",
        }}
        aria-label="Search"
      >
        <FaSearch style={{ fontSize: "14px", color: "#666" }} />
      </button>
    </form>
  );
}
