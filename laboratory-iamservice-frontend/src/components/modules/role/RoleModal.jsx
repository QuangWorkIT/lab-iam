import React, { useState, useEffect } from "react";
import { FaTimes } from "react-icons/fa";

export default function RoleModal({ role, isOpen, onClose, onSave }) {
  const [formData, setFormData] = useState({
    code: "",
    name: "",
    description: "",
    privileges: "",
    isActive: true,
  });

  // Nếu đang edit, load dữ liệu từ prop role
  useEffect(() => {
    if (role) {
      setFormData({
        code: role.code || "",
        name: role.name || "",
        description: role.description || "",
        privileges: Array.isArray(role.privileges)
          ? role.privileges.join(", ")
          : role.privileges || "",
        isActive: role.isActive !== undefined ? role.isActive : true,
      });
    } else {
      // Reset form khi thêm mới
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
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validation
    if (!formData.code.trim()) {
      alert("Role code is required");
      return;
    }
    if (!formData.name.trim()) {
      alert("Role name is required");
      return;
    }

    // Format privileges từ string thành array nếu API cần
    const formattedData = {
      ...formData,
      privileges: formData.privileges
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
    };

    onSave(formattedData);
  };

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
      }}
    >
      <div
        style={{
          backgroundColor: "white",
          borderRadius: "8px",
          boxShadow: "0 2px 10px rgba(0, 0, 0, 0.2)",
          width: "500px",
          maxWidth: "90%",
          maxHeight: "90vh",
          overflow: "auto",
          padding: "20px",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "20px",
          }}
        >
          <h2 style={{ margin: 0, color: "#ff5a5f" }}>
            {role ? "Edit Role" : "Add New Role"}
          </h2>
          <button
            onClick={onClose}
            style={{
              background: "transparent",
              border: "none",
              cursor: "pointer",
              fontSize: "20px",
              color: "#666",
            }}
          >
            <FaTimes />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: "15px" }}>
            <label
              style={{
                display: "block",
                marginBottom: "5px",
                fontWeight: 500,
              }}
            >
              Role Code
            </label>
            <input
              type="text"
              name="code"
              value={formData.code}
              onChange={handleChange}
              required
              disabled={role !== null} // Code chỉ được nhập khi thêm mới
              style={{
                width: "100%",
                padding: "8px 10px",
                border: "1px solid #ddd",
                borderRadius: "4px",
                fontSize: "14px",
              }}
            />
          </div>

          <div style={{ marginBottom: "15px" }}>
            <label
              style={{
                display: "block",
                marginBottom: "5px",
                fontWeight: 500,
              }}
            >
              Role Name
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              style={{
                width: "100%",
                padding: "8px 10px",
                border: "1px solid #ddd",
                borderRadius: "4px",
                fontSize: "14px",
              }}
            />
          </div>

          <div style={{ marginBottom: "15px" }}>
            <label
              style={{
                display: "block",
                marginBottom: "5px",
                fontWeight: 500,
              }}
            >
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              style={{
                width: "100%",
                padding: "8px 10px",
                border: "1px solid #ddd",
                borderRadius: "4px",
                fontSize: "14px",
                resize: "vertical",
              }}
            />
          </div>

          <div style={{ marginBottom: "15px" }}>
            <label
              style={{
                display: "block",
                marginBottom: "5px",
                fontWeight: 500,
              }}
            >
              Privileges (comma-separated)
            </label>
            <textarea
              name="privileges"
              value={formData.privileges}
              onChange={handleChange}
              rows={2}
              style={{
                width: "100%",
                padding: "8px 10px",
                border: "1px solid #ddd",
                borderRadius: "4px",
                fontSize: "14px",
                resize: "vertical",
              }}
            />
          </div>

          <div style={{ marginBottom: "20px" }}>
            <label style={{ display: "flex", alignItems: "center" }}>
              <input
                type="checkbox"
                name="isActive"
                checked={formData.isActive}
                onChange={handleChange}
                style={{ marginRight: "8px" }}
              />
              Active
            </label>
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              gap: "10px",
            }}
          >
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: "8px 15px",
                border: "1px solid #ddd",
                borderRadius: "4px",
                backgroundColor: "#f5f5f5",
                cursor: "pointer",
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              style={{
                padding: "8px 15px",
                border: "none",
                borderRadius: "4px",
                backgroundColor: "#ff5a5f",
                color: "white",
                fontWeight: "bold",
                cursor: "pointer",
              }}
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
