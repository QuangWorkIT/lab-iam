import React, { useState, useEffect } from "react";
import { FaTimes, FaInfoCircle } from "react-icons/fa";

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
    privileges: "",
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

  const handleSubmit = (e) => {
    e.preventDefault();
    if (mode === "view") return onClose();

    if (!formData.code.trim()) return alert("Role code is required");
    if (!formData.name.trim()) return alert("Role name is required");

    const privilegesString = formData.privileges
      .split(",")
      .map((i) => i.trim())
      .filter(Boolean)
      .join(",");
    const formattedData = {
      ...formData,
      privileges: privilegesString,
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
              <Item label="Role Code" value={formData.code} />
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
              <Field label="Role Code">
                <input
                  type="text"
                  name="code"
                  value={formData.code}
                  onChange={handleChange}
                  required
                  disabled={mode !== "create"}
                  style={inputStyle}
                  onFocus={(e) =>
                    (e.currentTarget.style.boxShadow = focusShadow)
                  }
                  onBlur={(e) => (e.currentTarget.style.boxShadow = "none")}
                />
              </Field>

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

              <Field label="Privileges (comma-separated)">
                <textarea
                  name="privileges"
                  value={formData.privileges}
                  onChange={handleChange}
                  rows={2}
                  placeholder="e.g., READ_USER, CREATE_USER, UPDATE_ROLE"
                  style={{ ...inputStyle, resize: "vertical" }}
                  onFocus={(e) =>
                    (e.currentTarget.style.boxShadow = focusShadow)
                  }
                  onBlur={(e) => (e.currentTarget.style.boxShadow = "none")}
                />
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
