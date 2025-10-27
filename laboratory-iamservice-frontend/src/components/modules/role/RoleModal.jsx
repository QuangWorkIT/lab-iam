import React, { useState, useEffect } from "react";
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
  });

  // Load dữ liệu khi mở modal
  useEffect(() => {
    if (role) {
      // Chuẩn hóa privileges thành chuỗi dễ chỉnh sửa
      const privilegesString = (() => {
        const p = role.privileges;
        if (Array.isArray(p)) {
          return p
            .map((x) => (typeof x === "string" ? x : x?.code || x?.name || ""))
            .filter(Boolean)
            .join(", ");
        }
        if (typeof p === "string") {
          // Nếu backend trả dạng JSON string, thử parse
          try {
            const arr = JSON.parse(p);
            if (Array.isArray(arr)) {
              return arr
                .map((x) =>
                  typeof x === "string" ? x : x?.code || x?.name || ""
                )
                .filter(Boolean)
                .join(", ");
            }
          } catch (_) {
            // giữ nguyên nếu không phải JSON
          }
          return p;
        }
        return "";
      })();

      setFormData({
        code: role.code || "",
        name: role.name || "",
        description: role.description || "",
        privileges: privilegesString,
        isActive: role.isActive !== undefined ? role.isActive : true,
      });
    } else {
      setFormData({
        code: "",
        name: "",
        description: "",
        privileges: "",
        isActive: true,
      });
    }
  }, [role, isOpen]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
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

    if (!formData.name.trim()) return alert("Role name is required");
    if (!formData.description.trim())
      return alert("Role description is required");
    if (formData.privileges.length === 0) {
      return alert("Please select at least one privilege");
    }

    const formattedData = {
      code: "", // ← Send empty, backend generates it
      name: formData.name,
      description: formData.description,
      privileges: formData.privileges.join(","),
      isActive: formData.isActive,
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
                  background: "#ffe6e8",
                  color: "#fe535b",
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
                    color: "#fe535b",
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
              <Item label="Privileges" value={formData.privileges || "—"} />
              {role && (
                <>
                  <Item label="Created At" value={role.createdAt || "—"} />
                  <Item
                    label="Last Updated"
                    value={role.lastUpdatedAt || "—"}
                  />
                  <Item
                    label="Status"
                    value={role.isActive ? "Active" : "Inactive"}
                  />
                </>
              )}
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                paddingTop: 12,
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
                }}
              >
                Close
              </button>
            </div>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
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
              <Field label="Role Name">
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  style={inputStyle}
                  onFocus={(e) =>
                    (e.currentTarget.style.boxShadow = focusShadow)
                  }
                  onBlur={(e) => (e.currentTarget.style.boxShadow = "none")}
                />
              </Field>

              <Field label="Description">
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={3}
                  style={{ ...inputStyle, resize: "vertical" }}
                  onFocus={(e) =>
                    (e.currentTarget.style.boxShadow = focusShadow)
                  }
                  onBlur={(e) => (e.currentTarget.style.boxShadow = "none")}
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

function Field({ label, children }) {
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
