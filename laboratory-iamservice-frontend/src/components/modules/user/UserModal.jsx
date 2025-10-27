import React, { useState, useEffect } from "react";
import { FaTimes, FaUser, FaEnvelope, FaKey, FaUserTag } from "react-icons/fa";

export default function UserModal({ user, isOpen, onClose, onSave }) {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        role: "",
        isActive: true,
    });

    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name || "",
                email: user.email || "",
                password: "",
                role: user.role || "",
                isActive: user.isActive !== undefined ? user.isActive : true,
            });
        } else {
            setFormData({
                name: "",
                email: "",
                password: "",
                role: "",
                isActive: true,
            });
        }
        setErrors({});
    }, [user, isOpen]);

    const validateForm = () => {
        const newErrors = {};

        if (!formData.name.trim()) {
            newErrors.name = "Name is required";
        }

        if (!formData.email.trim()) {
            newErrors.email = "Email is required";
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = "Email is invalid";
        }

        if (!user && !formData.password.trim()) {
            newErrors.password = "Password is required for new users";
        }

        if (!formData.role) {
            newErrors.role = "Role is required";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (validateForm()) {
            const userData = { ...formData };
            if (user && !userData.password) {
                delete userData.password; // Don't update password if empty
            }
            onSave(userData);
        }
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value,
        }));

        // Clear error when user starts typing
        if (errors[name]) {
            setErrors((prev) => ({
                ...prev,
                [name]: "",
            }));
        }
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
                    padding: "24px",
                    width: "90%",
                    maxWidth: "500px",
                    maxHeight: "90vh",
                    overflowY: "auto",
                    boxShadow: "0 4px 20px rgba(0, 0, 0, 0.15)",
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
                    <h2
                        style={{
                            margin: 0,
                            fontSize: "20px",
                            fontWeight: "600",
                            color: "#333",
                        }}
                    >
                        {user ? "Edit User" : "Add New User"}
                    </h2>
                    <button
                        onClick={onClose}
                        style={{
                            background: "none",
                            border: "none",
                            fontSize: "20px",
                            cursor: "pointer",
                            color: "#9aa4b2",
                            padding: "4px",
                        }}
                    >
                        <FaTimes />
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: "16px" }}>
                        <label
                            style={{
                                display: "block",
                                marginBottom: "6px",
                                fontSize: "14px",
                                fontWeight: "500",
                                color: "#333",
                            }}
                        >
                            <FaUser style={{ marginRight: "8px", color: "#666" }} />
                            Name *
                        </label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            style={{
                                width: "100%",
                                padding: "10px 12px",
                                border: `1px solid ${errors.name ? "#dc3545" : "#ddd"}`,
                                borderRadius: "4px",
                                fontSize: "14px",
                                boxSizing: "border-box",
                            }}
                            placeholder="Enter user name"
                        />
                        {errors.name && (
                            <span style={{ color: "#dc3545", fontSize: "12px" }}>
                                {errors.name}
                            </span>
                        )}
                    </div>

                    <div style={{ marginBottom: "16px" }}>
                        <label
                            style={{
                                display: "block",
                                marginBottom: "6px",
                                fontSize: "14px",
                                fontWeight: "500",
                                color: "#333",
                            }}
                        >
                            <FaEnvelope style={{ marginRight: "8px", color: "#666" }} />
                            Email *
                        </label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            style={{
                                width: "100%",
                                padding: "10px 12px",
                                border: `1px solid ${errors.email ? "#dc3545" : "#ddd"}`,
                                borderRadius: "4px",
                                fontSize: "14px",
                                boxSizing: "border-box",
                            }}
                            placeholder="Enter email address"
                        />
                        {errors.email && (
                            <span style={{ color: "#dc3545", fontSize: "12px" }}>
                                {errors.email}
                            </span>
                        )}
                    </div>

                    <div style={{ marginBottom: "16px" }}>
                        <label
                            style={{
                                display: "block",
                                marginBottom: "6px",
                                fontSize: "14px",
                                fontWeight: "500",
                                color: "#333",
                            }}
                        >
                            <FaKey style={{ marginRight: "8px", color: "#666" }} />
                            Password {!user && "*"}
                        </label>
                        <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            style={{
                                width: "100%",
                                padding: "10px 12px",
                                border: `1px solid ${errors.password ? "#dc3545" : "#ddd"}`,
                                borderRadius: "4px",
                                fontSize: "14px",
                                boxSizing: "border-box",
                            }}
                            placeholder={user ? "Leave empty to keep current password" : "Enter password"}
                        />
                        {errors.password && (
                            <span style={{ color: "#dc3545", fontSize: "12px" }}>
                                {errors.password}
                            </span>
                        )}
                    </div>

                    <div style={{ marginBottom: "16px" }}>
                        <label
                            style={{
                                display: "block",
                                marginBottom: "6px",
                                fontSize: "14px",
                                fontWeight: "500",
                                color: "#333",
                            }}
                        >
                            <FaUserTag style={{ marginRight: "8px", color: "#666" }} />
                            Role *
                        </label>
                        <select
                            name="role"
                            value={formData.role}
                            onChange={handleChange}
                            style={{
                                width: "100%",
                                padding: "10px 12px",
                                border: `1px solid ${errors.role ? "#dc3545" : "#ddd"}`,
                                borderRadius: "4px",
                                fontSize: "14px",
                                boxSizing: "border-box",
                                backgroundColor: "white",
                            }}
                        >
                            <option value="">Select a role</option>
                            <option value="ADMIN">Administrator</option>
                            <option value="LAB USER">Lab User</option>
                            <option value="MANAGER">Manager</option>
                            <option value="SERVICE USER">Service User</option>
                            <option value="GUEST">Guest</option>
                        </select>
                        {errors.role && (
                            <span style={{ color: "#dc3545", fontSize: "12px" }}>
                                {errors.role}
                            </span>
                        )}
                    </div>

                    <div style={{ marginBottom: "20px" }}>
                        <label
                            style={{
                                display: "flex",
                                alignItems: "center",
                                fontSize: "14px",
                                fontWeight: "500",
                                color: "#333",
                                cursor: "pointer",
                            }}
                        >
                            <input
                                type="checkbox"
                                name="isActive"
                                checked={formData.isActive}
                                onChange={handleChange}
                                style={{
                                    marginRight: "8px",
                                    transform: "scale(1.2)",
                                }}
                            />
                            Active User
                        </label>
                    </div>

                    <div
                        style={{
                            display: "flex",
                            justifyContent: "flex-end",
                            gap: "12px",
                        }}
                    >
                        <button
                            type="button"
                            onClick={onClose}
                            style={{
                                padding: "10px 20px",
                                border: "1px solid #ddd",
                                borderRadius: "4px",
                                backgroundColor: "white",
                                color: "#666",
                                cursor: "pointer",
                                fontSize: "14px",
                            }}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            style={{
                                padding: "10px 20px",
                                border: "none",
                                borderRadius: "4px",
                                backgroundColor: "#ff5a5f",
                                color: "white",
                                cursor: "pointer",
                                fontSize: "14px",
                                fontWeight: "500",
                            }}
                        >
                            {user ? "Update User" : "Create User"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
