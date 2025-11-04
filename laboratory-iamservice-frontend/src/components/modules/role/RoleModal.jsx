import React, { useState, useEffect, useRef } from "react";
import { FaTimes, FaInfoCircle } from "react-icons/fa";

const AVAILABLE_PRIVILEGES = [
  // Test Order Management
  "READ_ONLY",
  "CREATE_TEST_ORDER",
  "MODIFY_TEST_ORDER",
  "DELETE_TEST_ORDER",
  "REVIEW_TEST_ORDER",

  // Comment Management
  "ADD_COMMENT",
  "MODIFY_COMMENT",
  "DELETE_COMMENT",

  // Configuration Management
  "VIEW_CONFIGURATION",
  "CREATE_CONFIGURATION",
  "MODIFY_CONFIGURATION",
  "DELETE_CONFIGURATION",

  // User Management
  "VIEW_USER",
  "CREATE_USER",
  "MODIFY_USER",
  "DELETE_USER",
  "LOCK_UNLOCK_USER",

  // Role Management (Laboratory Management)
  "VIEW_ROLE",
  "CREATE_ROLE",
  "UPDATE_ROLE",
  "DELETE_ROLE",

  // Event Logs
  "VIEW_EVENT_LOGS",

  // Reagent Management
  "ADD_REAGENTS",
  "MODIFY_REAGENTS",
  "DELETE_REAGENTS",

  // Instrument Management
  "ADD_INSTRUMENT",
  "VIEW_INSTRUMENT",
  "ACTIVATE_DEACTIVATE_INSTRUMENT",

  // Blood Testing
  "EXECUTE_BLOOD_TESTING",
];

export default function RoleModal({
  role,
  isOpen,
  onClose,
  onSave,
  mode = "create",
}) {
  const [formData, setFormData] = useState({
    code: "",
    name: "",
    description: "",
    privileges: [],
    isActive: true,
    deletable: true
  });
  // Inline validation for required fields
  const [errors, setErrors] = useState({ name: "", description: "" });
  const nameRef = useRef(null);
  const descRef = useRef(null);

  // Load dữ liệu khi mở modal (chuẩn hóa privileges thành MẢNG để dùng an toàn ở view/edit)
  useEffect(() => {
    if (role) {
      const privArr = parsePrivileges(role.privileges);
      setFormData({
        code: role.code || "",
        name: role.name || "",
        description: role.description || "",
        privileges: privArr,
        isActive: role.isActive !== undefined ? role.isActive : true,
         deletable: role.deletable || false,
      });
    } else {
      setFormData({
       code: "",
      name: "",
      description: "",
      privileges: [],
      isActive: true,
      deletable: false,
      });
    }
    // Reset field errors when modal opens or role changes
    setErrors({ name: "", description: "" });
  }, [role, isOpen]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    // Clear error for the field once user types a non-empty value
    if ((name === "name" || name === "description") && value.trim()) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handlePrivilegeChange = (privilege) => {
    setFormData((prev) => {
      const isChecked = prev.privileges.includes(privilege);
      return {
        ...prev,
        privileges: isChecked
          ? prev.privileges.filter((p) => p !== privilege) // Remove if checked
          : [...prev.privileges, privilege], // Add if unchecked
      };
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (mode === "view") return onClose();

    // Inline required validation (replace window alerts)
    const nextErrors = {
      name: formData.name.trim() ? "" : "Role name is required",
      description: formData.description.trim()
        ? ""
        : "Role description is required",
    };
    setErrors(nextErrors);
    if (nextErrors.name || nextErrors.description) {
      if (nextErrors.name && nameRef.current) nameRef.current.focus();
      else if (nextErrors.description && descRef.current)
        descRef.current.focus();
      return;
    }
    

    const formattedData = {
      code: "", // ← Send empty, backend generates it
      name: formData.name,
      description: formData.description,
      privileges: formData.privileges.join(","),
      isActive: formData.isActive,
      deletable: formData.deletable,
    };

    onSave(formattedData);
  };

  if (!isOpen) return null;

  const title =
    mode === "view"
      ? "View Role"
      : mode === "edit"
      ? "Update Role"
      : "Add New Role";
  const primaryText = mode === "edit" ? "Update" : "Create";
  // Accent theo mode (chỉ ảnh hưởng UI header)
  const accent =
    mode === "create"
      ? { bg: "#e8f5e9", color: "#1f7a3f" }
      : mode === "edit"
      ? { bg: "#fff7e6", color: "rgb(255, 191, 13)" }
      : { bg: "#e6f0ff", color: "#5170ff" };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
      }}
    >
      <div
        style={{
          background: "#fff",
          borderRadius: 12,
          boxShadow: "0 12px 30px rgba(0,0,0,0.18)",
          width: 560,
          maxWidth: "92%",
          maxHeight: "92vh",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Header */}
        <div style={{ padding: "16px 20px 0 20px", background: "#fff" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 12,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 8,
                  background: accent.bg,
                  color: accent.color,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
                aria-hidden
              >
                <FaInfoCircle />
              </div>
              <div>
                <div
                  style={{
                    color: accent.color,
                    fontWeight: 800,
                    letterSpacing: 1.5,
                    textTransform: "uppercase",
                    fontSize: 16,
                  }}
                >
                  {title}
                </div>
                <div style={{ color: "#8a8f98", fontSize: 12 }}>
                  {mode === "create"
                    ? "Create a new role for your system"
                    : mode === "edit"
                    ? "Modify role details"
                    : "View role details"}
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              aria-label="Close"
              title="Close"
              style={{
                background: "transparent",
                border: "none",
                cursor: "pointer",
                fontSize: 20,
                color: "#9aa4b2",
              }}
            >
              <FaTimes />
            </button>
          </div>
        </div>

        {/* Body */}
        <div style={{ height: 12 }} />
        {mode === "view" ? (
          <div style={{ padding: "0 20px 20px 20px", overflowY: "auto" }}>
            <div
              style={{
                background: "#f8f9fa",
                border: "1px solid #e1e7ef",
                borderRadius: 10,
                padding: 16,
              }}
            >
              <Item label="Role Name" value={formData.name} />
              <Item label="Description" value={formData.description || "—"} />
              {/* Privileges: hiển thị dạng chips để tự wrap, tránh tràn ngang */}
              <PrivilegesChips value={formData.privileges} />
              {role && (
                <>
                  <Item label="Created At" value={role.createdAt || "—"} />
                  <Item
                    label="Last Updated"
                    value={role.lastUpdatedAt || "—"}
                  />
                  {/* Status: hiển thị badge màu (Active xanh lá, Inactive xám) */}
                  <div style={{ marginBottom: 10 }}>
                    <div
                      style={{
                        color: "#8a8f98",
                        fontSize: 12,
                        marginBottom: 4,
                      }}
                    >
                      Status
                    </div>
                    <StatusPill active={!!role.isActive} />
                  </div>
                </>
              )}
            </div>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            noValidate
            style={{ padding: "0 20px 20px 20px", overflowY: "auto" }}
          >
            <div
              style={{
                background: "#f8f9fa",
                border: "1px solid #e1e7ef",
                borderRadius: 10,
                padding: 16,
                marginBottom: 16,
              }}
            >
              <Field label="Role Name" error={errors.name}>
                <input
                  ref={nameRef}
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  aria-invalid={!!errors.name}
                  style={{
                    ...inputStyle,
                    borderColor: errors.name ? "#ef4444" : "#e1e7ef",
                    boxShadow: errors.name
                      ? "0 0 0 3px rgba(239,68,68,0.15)"
                      : "none",
                  }}
                  onFocus={(e) =>
                    (e.currentTarget.style.boxShadow = focusShadow)
                  }
                  onBlur={(e) =>
                    (e.currentTarget.style.boxShadow = errors.name
                      ? "0 0 0 3px rgba(239,68,68,0.15)"
                      : "none")
                  }
                />
                {!errors.name && <NameGuidance raw={formData.name} />}
              </Field>

              <Field label="Description" error={errors.description}>
                <textarea
                  ref={descRef}
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={3}
                  required
                  aria-invalid={!!errors.description}
                  style={{
                    ...inputStyle,
                    resize: "vertical",
                    borderColor: errors.description ? "#ef4444" : "#e1e7ef",
                    boxShadow: errors.description
                      ? "0 0 0 3px rgba(239,68,68,0.15)"
                      : "none",
                  }}
                  onFocus={(e) =>
                    (e.currentTarget.style.boxShadow = focusShadow)
                  }
                  onBlur={(e) =>
                    (e.currentTarget.style.boxShadow = errors.description
                      ? "0 0 0 3px rgba(239,68,68,0.15)"
                      : "none")
                  }
                />
              </Field>

              <Field label="Privileges">
                <div
                  style={{ display: "flex", flexDirection: "column", gap: 16 }}
                >
                  {[
                    {
                      category: "Test Order Management",
                      items: [
                        "READ_ONLY",
                        "CREATE_TEST_ORDER",
                        "MODIFY_TEST_ORDER",
                        "DELETE_TEST_ORDER",
                        "REVIEW_TEST_ORDER",
                      ],
                    },
                    {
                      category: "Comment Management",
                      items: [
                        "ADD_COMMENT",
                        "MODIFY_COMMENT",
                        "DELETE_COMMENT",
                      ],
                    },
                    {
                      category: "Configuration Management",
                      items: [
                        "VIEW_CONFIGURATION",
                        "CREATE_CONFIGURATION",
                        "MODIFY_CONFIGURATION",
                        "DELETE_CONFIGURATION",
                      ],
                    },
                    {
                      category: "User Management",
                      items: [
                        "VIEW_USER",
                        "CREATE_USER",
                        "MODIFY_USER",
                        "DELETE_USER",
                        "LOCK_UNLOCK_USER",
                      ],
                    },
                    {
                      category: "Role Management",
                      items: [
                        "VIEW_ROLE",
                        "CREATE_ROLE",
                        "UPDATE_ROLE",
                        "DELETE_ROLE",
                      ],
                    },
                    {
                      category: "Event Logs",
                      items: ["VIEW_EVENT_LOGS"],
                    },
                    {
                      category: "Reagent Management",
                      items: [
                        "ADD_REAGENTS",
                        "MODIFY_REAGENTS",
                        "DELETE_REAGENTS",
                      ],
                    },
                    {
                      category: "Instrument Management",
                      items: [
                        "ADD_INSTRUMENT",
                        "VIEW_INSTRUMENT",
                        "ACTIVATE_DEACTIVATE_INSTRUMENT",
                      ],
                    },
                    {
                      category: "Blood Testing",
                      items: ["EXECUTE_BLOOD_TESTING"],
                    },
                  ].map((group) => (
                    <div
                      key={group.category}
                      style={{
                        borderBottom: "1px solid #e1e7ef",
                        paddingBottom: 12,
                      }}
                    >
                      <div
                        style={{
                          fontWeight: 600,
                          color: "#404553",
                          marginBottom: 8,
                          fontSize: 13,
                        }}
                      >
                        {group.category}
                      </div>
                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns:
                            "repeat(auto-fit, minmax(200px, 1fr))",
                          gap: 8,
                        }}
                      >
                        {group.items.map((privilege) => (
                          <label
                            key={privilege}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 8,
                              cursor: "pointer",
                            }}
                          >
                            <input
                              type="checkbox"
                              checked={formData.privileges.includes(privilege)}
                              onChange={() => handlePrivilegeChange(privilege)}
                              style={{
                                width: 16,
                                height: 16,
                                cursor: "pointer",
                                accentColor: "#fe535b",
                              }}
                            />
                            <span style={{ color: "#404553", fontSize: 12 }}>
                              {privilege}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </Field>

 <div style={{ marginTop: 6 }}>
          <label
            style={{ display: "flex", alignItems: "center", gap: 10 }}
          >
            <input
              type="checkbox"
              name="deletable"
              checked={formData.deletable}
              onChange={handleChange}
              style={{ width: 16, height: 16 }}
            />
            <span
              style={{ color: "#404553", fontSize: 13, fontWeight: 600 }}
            >
              Allow Role Deletion (Advanced Setting)
            </span>
          </label>
          <div style={{ marginLeft: 26, marginTop: 4, color: "#6b7280", fontSize: 12 }}>
            Enable to allow role deletion. When disabled, the role cannot be deleted even if no users are assigned.
          </div>
        </div>

              <div style={{ marginTop: 6 }}>
                <label
                  style={{ display: "flex", alignItems: "center", gap: 10 }}
                >
                  <input
                    type="checkbox"
                    name="isActive"
                    checked={formData.isActive}
                    onChange={handleChange}
                    style={{ width: 16, height: 16 }}
                  />
                  <span
                    style={{ color: "#404553", fontSize: 13, fontWeight: 600 }}
                  >
                    Active
                  </span>
                </label>
              </div>
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: 10,
                paddingTop: 8,
                borderTop: "1px solid #f0f2f5",
              }}
            >
              <button
                type="button"
                onClick={onClose}
                style={{
                  padding: "10px 16px",
                  border: "1px solid #e1e7ef",
                  borderRadius: 8,
                  backgroundColor: "#ffffff",
                  color: "#404553",
                  cursor: "pointer",
                  transition: "all .2s",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.backgroundColor = "#f7f9fc")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.backgroundColor = "#ffffff")
                }
              >
                Cancel
              </button>
              <button
                type="submit"
                style={{
                  padding: "10px 18px",
                  border: "none",
                  borderRadius: 8,
                  backgroundColor: "#fe535b",
                  color: "#fff",
                  fontWeight: 700,
                  cursor: "pointer",
                  transition: "background-color .2s",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.backgroundColor = "#e64b52")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.backgroundColor = "#fe535b")
                }
              >
                {primaryText}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

// Shared styles/components
const inputStyle = {
  width: "100%",
  padding: "10px 12px",
  border: "1px solid #e1e7ef",
  borderRadius: 8,
  fontSize: 14,
  background: "#fff",
  color: "#404553",
  outline: "none",
  transition: "border-color .2s, box-shadow .2s",
};

const focusShadow = "0 0 0 3px rgba(254,83,91,0.15)";

function Field({ label, children, error }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label
        style={{
          display: "block",
          marginBottom: 6,
          fontWeight: 600,
          color: "#404553",
          fontSize: 13,
        }}
      >
        {label}
      </label>
      {children}
      {error ? (
        <div style={{ color: "#ef4444", fontSize: 12, marginTop: 6 }}>
          {error}
        </div>
      ) : null}
    </div>
  );
}

function Item({ label, value }) {
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ color: "#8a8f98", fontSize: 12, marginBottom: 4 }}>
        {label}
      </div>
      <div style={{ color: "#404553", fontWeight: 600 }}>{String(value)}</div>
    </div>
  );
}

// Badge trạng thái cho view mode: Active xanh lá, Inactive xám (không ảnh hưởng component khác)
function StatusPill({ active }) {
  const base = {
    display: "inline-block",
    padding: "6px 10px",
    borderRadius: 999,
    fontSize: 12,
    fontWeight: 700,
    lineHeight: 1,
    letterSpacing: 0.3,
    border: "1px solid transparent",
  };
  const activeStyle = {
    background: "#e8f5e9", // xanh nhạt
    color: "#1f7a3f", // xanh lá chữ
    borderColor: "#b7e4c7", // viền xanh nhạt
  };
  const inactiveStyle = {
    background: "#f1f3f5", // xám nhạt
    color: "#6b7280", // xám chữ
    borderColor: "#e5e7eb", // viền xám nhạt
  };
  return (
    <span style={{ ...base, ...(active ? activeStyle : inactiveStyle) }}>
      {active ? "Active" : "Inactive"}
    </span>
  );
}

// Hiển thị privileges dạng chip, tự xuống hàng khi hết chiều ngang
function PrivilegesChips({ value }) {
  const list = parsePrivileges(value);
  const groups = groupPrivileges(list);
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ color: "#8a8f98", fontSize: 12, marginBottom: 6 }}>
        Privileges
      </div>
      {groups.length ? (
        groups.map((g) => (
          <div
            key={g.category}
            style={{
              marginBottom: 10,
              border: "1px solid #e1e7ef", // nhấn mạnh block bằng #e1e7ef
              background: "#ffffff",
              borderRadius: 10,
              padding: 12,
            }}
          >
            <div
              style={{
                display: "inline-block",
                padding: "2px 8px",
                color: "#2f3a56",
                fontWeight: 700,
                fontSize: 11,
                marginBottom: 8,
              }}
            >
              {g.category}
            </div>
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: 8,
                maxWidth: "100%",
              }}
            >
              {g.items.map((p) => (
                <span
                  key={p}
                  style={{
                    display: "inline-block",
                    padding: "4px 8px",
                    border: "1px solid #e1e7ef",
                    background: "#dbeafe",
                    color: "#2f3a56",
                    borderRadius: 999,
                    fontSize: 12,
                    lineHeight: 1.2,
                    whiteSpace: "nowrap",
                  }}
                  title={p}
                >
                  {p}
                </span>
              ))}
            </div>
          </div>
        ))
      ) : (
        <span style={{ color: "#8a8f98" }}>—</span>
      )}
    </div>
  );
}

function parsePrivileges(value) {
  if (!value && value !== "") return [];

  if (Array.isArray(value)) {
    return value
      .map((x) => (typeof x === "string" ? x : x?.code || x?.name || ""))
      .filter(Boolean);
  }
  if (typeof value === "string") {
    // Thử parse JSON nếu là chuỗi JSON hợp lệ
    try {
      const arr = JSON.parse(value);
      if (Array.isArray(arr)) {
        return arr
          .map((x) => (typeof x === "string" ? x : x?.code || x?.name || ""))
          .filter(Boolean);
      }
    } catch (_) {
      // không phải JSON, tiếp tục tách theo dấu phẩy
    }
    return value
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
  }
  return [];
}

// Quy tắc group privileges theo prefix/keyword
const PRIVILEGE_GROUP_RULES = [
  { key: "TEST_ORDER", label: "Test Order Management" },
  { key: "COMMENT", label: "Comment Management" },
  { key: "CONFIGURATION", label: "Configuration Management" },
  { key: "USER", label: "User Management" },
  { key: "ROLE", label: "Role Management" },
  { key: "EVENT", label: "Event Logs" },
  { key: "REAGENT", label: "Reagent Management" },
  { key: "INSTRUMENT", label: "Instrument Management" },
  { key: "BLOOD_TESTING", label: "Blood Testing" },
];

function groupPrivileges(codes) {
  const byGroup = new Map();
  const resolveGroup = (code) => {
    if (code === "READ_ONLY") return "General";
    const hit = PRIVILEGE_GROUP_RULES.find((r) => code.includes(r.key));
    return hit ? hit.label : "Other";
  };

  (codes || []).forEach((c) => {
    const g = resolveGroup(c);
    if (!byGroup.has(g)) byGroup.set(g, []);
    byGroup.get(g).push(c);
  });

  const order = [
    "General",
    ...PRIVILEGE_GROUP_RULES.map((r) => r.label),
    "Other",
  ];
  return Array.from(byGroup.entries())
    .sort((a, b) => order.indexOf(a[0]) - order.indexOf(b[0]))
    .map(([category, items]) => ({ category, items }));
}

function NameGuidance({ raw = "" }) {
  const trimmed = (raw || "").trim();
  const codePreview = trimmed
    ? `ROLE_${trimmed.replace(/\s+/g, "_").toUpperCase()}`
    : "ROLE_...";

  const hasRolePrefix = /^\s*ROLE_/i.test(raw);

  return (
    <div style={{ marginTop: 6, fontSize: 12, color: "#6b7280" }}>
      <div>
        No need to type “ROLE_” — the system adds it; space → “_”; the code will
        be UPPERCASE.
      </div>
      <div style={{ marginTop: 4 }}>
        Will generate code:
        <span
          style={{
            fontWeight: 700,
            color: "#374151",
            marginLeft: 6,
            letterSpacing: 0.3,
          }}
        >
          {codePreview}
        </span>
      </div>
      {hasRolePrefix && (
        <div style={{ marginTop: 4, color: "#b45309" }}>
          Note: you have entered “ROLE_”; the system still adds “ROLE_” → can
          become ROLE_ROLE_...
        </div>
      )}
    </div>
  );
}
