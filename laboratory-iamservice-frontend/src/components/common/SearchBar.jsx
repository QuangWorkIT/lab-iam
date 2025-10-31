import React, { useEffect, useMemo, useRef, useState } from "react";
import { FaSearch } from "react-icons/fa";
import { FiSliders, FiCalendar } from "react-icons/fi";

/**
 * Shared SearchBar component used across Role and User pages.
 * Behavior:
 * - Enter triggers search; Search button triggers search
 * - Auto-search when role changes (configurable)
 * - Does NOT auto-search when typing or changing dates
 * Props:
 *  onSearch(keyword, fromDate, toDate, roleCode)
 *  initialKeyword, initialFromDate, initialToDate, initialRoleFilter
 *  roleOptions: array of { code|roleCode, name|roleName }
 *  placeholder: input placeholder text
 *  allRolesLabel: label for "All Roles" option
 *  autoSearchOnRoleChange: boolean (default true)
 */
export default function SearchBar({
  onSearch,
  initialKeyword = "",
  initialFromDate = "",
  initialToDate = "",
  initialRoleFilter = "",
  roleOptions = [],
  placeholder = "Search...",
  allRolesLabel = "All Roles",
  autoSearchOnRoleChange = true,
}) {
  const [search, setSearch] = useState(initialKeyword);
  const [fromDate, setFromDate] = useState(initialFromDate);
  const [toDate, setToDate] = useState(initialToDate);
  const [roleFilter, setRoleFilter] = useState(initialRoleFilter);
  const [focused, setFocused] = useState(false);
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const roleBtnRef = useRef(null);
  const roleMenuRef = useRef(null);
  // Date popover state
  const [showDateMenu, setShowDateMenu] = useState(false);
  const dateBtnRef = useRef(null);
  const dateMenuRef = useRef(null);
  const [dateMenuPos, setDateMenuPos] = useState({ top: 44, left: 0 });
  // Temporary range values (apply on confirm)
  const [tempFromDate, setTempFromDate] = useState(initialFromDate || "");
  const [tempToDate, setTempToDate] = useState(initialToDate || "");

  const normalizedRoleOptions = useMemo(
    () =>
      (roleOptions || []).map((r) => ({
        code: r.code ?? r.roleCode ?? "",
        name: r.name ?? r.roleName ?? r.code ?? r.roleCode ?? "",
      })),
    [roleOptions]
  );

  // Sync internal state when initial props change
  useEffect(() => {
    setSearch(initialKeyword);
    setFromDate(initialFromDate);
    setToDate(initialToDate);
    setRoleFilter(initialRoleFilter);
    setTempFromDate(initialFromDate || "");
    setTempToDate(initialToDate || "");
  }, [initialKeyword, initialFromDate, initialToDate, initialRoleFilter]);

  const runSearch = (e) => {
    if (e && typeof e.preventDefault === "function") e.preventDefault();
    const keyword = search.trim() === "" ? "" : search.trim().toLowerCase();
    onSearch && onSearch(keyword, fromDate, toDate, roleFilter);
  };

  const handleInputKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      runSearch();
    }
  };

  const handleRoleChange = (e) => {
    const newRole = e.target.value;
    setRoleFilter(newRole);
    if (autoSearchOnRoleChange) {
      const keyword = search.trim() === "" ? "" : search.trim().toLowerCase();
      onSearch && onSearch(keyword, fromDate, toDate, newRole);
    }
  };

  // Close popovers on outside click or Esc
  useEffect(() => {
    const onDocMouseDown = (ev) => {
      // role popover
      if (showRoleMenu) {
        const btn = roleBtnRef.current;
        const menu = roleMenuRef.current;
        if (
          !(btn && btn.contains(ev.target)) &&
          !(menu && menu.contains(ev.target))
        ) {
          setShowRoleMenu(false);
        }
      }
      // date popover
      if (showDateMenu) {
        const btn = dateBtnRef.current;
        const menu = dateMenuRef.current;
        if (
          !(btn && btn.contains(ev.target)) &&
          !(menu && menu.contains(ev.target))
        ) {
          setShowDateMenu(false);
        }
      }
    };
    const onKey = (ev) => {
      if (ev.key === "Escape") {
        setShowRoleMenu(false);
        setShowDateMenu(false);
      }
    };
    document.addEventListener("mousedown", onDocMouseDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDocMouseDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [showRoleMenu, showDateMenu]);

  return (
    <form
      onSubmit={runSearch}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        flexWrap: "wrap",
        rowGap: 8,
        maxWidth: "100%",
        position: "relative",
      }}
      role="search"
      aria-label="Search"
    >
      <div
        style={{
          position: "relative",
          display: "flex",
          alignItems: "center",
          padding: "8px 12px",
          width: "280px",
          minWidth: 200,
          flexShrink: 1,
          backgroundColor: "#ffffff",
          borderRadius: 12,
          border: `1.5px solid ${focused ? "#fe535b" : "#dbe4f2"}`,
          boxShadow: focused
            ? "0 0 0 3px rgba(254, 83, 91, 0.15)"
            : "0 2px 8px rgba(219, 228, 242, 0.6)",
          transition: "border-color 120ms ease, box-shadow 120ms ease",
        }}
      >
        <FaSearch style={{ color: "#fe535b", marginRight: 10 }} />
        <input
          type="text"
          placeholder={placeholder}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={handleInputKeyDown}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={{
            border: "none",
            outline: "none",
            width: "100%",
            fontSize: "14px",
            backgroundColor: "transparent",
            padding: 0,
            color: "#d8dde3ff",
          }}
          aria-label="Search input"
          name="keyword"
          autoComplete="off"
        />
      </div>

      {/* Role filter icon button opens a popover */}
      <button
        type="button"
        ref={roleBtnRef}
        onClick={() => setShowRoleMenu((s) => !s)}
        aria-haspopup="dialog"
        aria-expanded={showRoleMenu}
        aria-controls="role-filter-popover"
        title="Filter by role"
        style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          width: 36,
          height: 36,
          borderRadius: 10,
          border: "none",
          cursor: "pointer",
          backgroundColor: "#fe535b",
          color: "#fff",
          boxShadow: "0 2px 6px rgba(254,83,91,0.35)",
        }}
      >
        <FiSliders size={18} />
      </button>

      {/* Date range icon button opens a popover */}
      <button
        type="button"
        ref={dateBtnRef}
        onClick={() => {
          const btn = dateBtnRef.current;
          if (btn) {
            setDateMenuPos({
              top: btn.offsetTop + btn.offsetHeight + 8,
              left: btn.offsetLeft,
            });
          }
          setShowDateMenu((s) => !s);
        }}
        aria-haspopup="dialog"
        aria-expanded={showDateMenu}
        aria-controls="created-date-popover"
        title="Filter by created date"
        style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          width: 36,
          height: 36,
          borderRadius: 10,
          border: "none",
          cursor: "pointer",
          backgroundColor: "#fe535b",
          color: "#fff",
          boxShadow: "0 2px 6px rgba(254,83,91,0.35)",
        }}
      >
        <FiCalendar size={18} />
      </button>

      <button
        type="button"
        onClick={runSearch}
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

      {/* Role popover */}
      {showRoleMenu && (
        <div
          id="role-filter-popover"
          ref={roleMenuRef}
          role="dialog"
          aria-label="Role filter"
          style={{
            position: "absolute",
            top: 44,
            left: 300,
            zIndex: 1000,
            minWidth: 240,
            background: "#fff",
            border: "1px solid #e6eaf0",
            borderRadius: 10,
            boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
            padding: 12,
          }}
        >
          <div
            style={{
              fontWeight: 600,
              fontSize: 13,
              marginBottom: 8,
              color: "#333",
            }}
          >
            Filter by role
          </div>
          <select
            value={roleFilter}
            onChange={(e) => {
              handleRoleChange(e);
              setShowRoleMenu(false);
            }}
            style={{
              width: "100%",
              padding: "8px 10px",
              border: "1px solid #e1e7ef",
              borderRadius: 6,
              fontSize: 14,
              backgroundColor: "#fff",
              color: "#333",
              cursor: "pointer",
            }}
            aria-label="Role filter"
            name="roleFilter"
          >
            <option value="">{allRolesLabel}</option>
            {normalizedRoleOptions.map((r) => (
              <option key={r.code} value={r.code}>
                {r.name}
              </option>
            ))}
          </select>
          {roleFilter && (
            <div
              style={{
                marginTop: 8,
                display: "flex",
                justifyContent: "space-between",
              }}
            >
              <button
                type="button"
                onClick={() => {
                  const ev = { target: { value: "" } };
                  handleRoleChange(ev);
                  setShowRoleMenu(false);
                }}
                style={{
                  background: "transparent",
                  color: "#fe535b",
                  border: "none",
                  cursor: "pointer",
                  padding: "6px 4px",
                }}
              >
                Clear role
              </button>
              <button
                type="button"
                onClick={() => setShowRoleMenu(false)}
                style={{
                  background: "#fe535b",
                  color: "#fff",
                  border: "none",
                  borderRadius: 6,
                  padding: "6px 10px",
                  cursor: "pointer",
                }}
              >
                Done
              </button>
            </div>
          )}
        </div>
      )}

      {/* Date range popover */}
      {showDateMenu && (
        <div
          id="created-date-popover"
          ref={dateMenuRef}
          role="dialog"
          aria-label="Created date range"
          style={{
            position: "absolute",
            top: dateMenuPos.top,
            left: dateMenuPos.left,
            zIndex: 1000,
            minWidth: 280,
            background: "#fff",
            border: "1px solid #e6eaf0",
            borderRadius: 10,
            boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
            padding: 12,
          }}
        >
          <div
            style={{
              fontWeight: 600,
              fontSize: 13,
              marginBottom: 8,
              color: "#333",
            }}
          >
            Created date
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <label style={{ fontSize: 12, color: "#555" }}>From</label>
              <input
                type="date"
                value={tempFromDate}
                onChange={(e) => setTempFromDate(e.target.value)}
                style={{
                  padding: "6px 10px",
                  border: "1px solid #e1e7ef",
                  borderRadius: 6,
                  fontSize: 14,
                  backgroundColor: "#fff",
                  color: "#333",
                  cursor: "pointer",
                }}
                aria-label="From date"
                name="fromDateTemp"
              />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <label style={{ fontSize: 12, color: "#555" }}>To</label>
              <input
                type="date"
                value={tempToDate}
                onChange={(e) => setTempToDate(e.target.value)}
                style={{
                  padding: "6px 10px",
                  border: "1px solid #e1e7ef",
                  borderRadius: 6,
                  fontSize: 14,
                  backgroundColor: "#fff",
                  color: "#333",
                  cursor: "pointer",
                }}
                aria-label="To date"
                name="toDateTemp"
              />
            </div>
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginTop: 10,
            }}
          >
            <button
              type="button"
              onClick={() => {
                setTempFromDate("");
                setTempToDate("");
                setFromDate("");
                setToDate("");
                setShowDateMenu(false);
              }}
              style={{
                background: "transparent",
                color: "#fe535b",
                border: "none",
                cursor: "pointer",
                padding: "6px 4px",
              }}
            >
              Clear dates
            </button>
            <button
              type="button"
              onClick={() => {
                setFromDate(tempFromDate);
                setToDate(tempToDate);
                setShowDateMenu(false);
              }}
              style={{
                background: "#fe535b",
                color: "#fff",
                border: "none",
                borderRadius: 6,
                padding: "6px 10px",
                cursor: "pointer",
              }}
            >
              Apply
            </button>
          </div>
        </div>
      )}
    </form>
  );
}
