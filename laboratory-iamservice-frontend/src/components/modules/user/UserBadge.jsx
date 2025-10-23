import React from "react";

export default function UserBadge({ roleName }) {
    const getRoleStyle = (role) => {
        if (!role) return { backgroundColor: "#e1e7ef", color: "#333" };

        // Normalize role name - remove "ROLE_" prefix if exists
        let normalizedRole = role.toString().toLowerCase().trim();
        if (normalizedRole.startsWith("role_")) {
            normalizedRole = normalizedRole.replace("role_", "");
        }

        // Match style from RoleBadge.jsx
        if (normalizedRole.includes("admin")) {
            return {
                backgroundColor: "#00bf63", // Xanh lá
                color: "white",
            };
        }

        if (normalizedRole.includes("lab") || normalizedRole.includes("service")) {
            return {
                backgroundColor: "#8c52ff", // Tím
                color: "white",
            };
        }

        if (normalizedRole.includes("patient")) {
            return {
                backgroundColor: "#fe535b", // Đỏ
                color: "white",
            };
        }

        if (normalizedRole.includes("manager")) {
            return {
                backgroundColor: "#5170ff", // Xanh dương
                color: "white",
            };
        }

        if (normalizedRole.includes("guest")) {
            return {
                backgroundColor: "#e1e7ef", // Xám
                color: "#333",
            };
        }

        // Default
        return {
            backgroundColor: "#e1e7ef",
            color: "#333",
        };
    };

    const style = getRoleStyle(roleName);

    // Display name: remove ROLE_ prefix for cleaner display
    const displayName = roleName ?
        roleName.toString().replace(/^ROLE_/i, "").replace(/_/g, " ") :
        "";

    return (
        <span
            style={{
                display: "inline-block",
                padding: "4px 10px",
                borderRadius: "4px",
                fontSize: "12px",
                fontWeight: "bold",
                textAlign: "center",
                minWidth: "80px",
                boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
                textShadow: style.color === "white" ? "0 1px 1px rgba(0,0,0,0.1)" : "none",
                textTransform: "uppercase",
                ...style,
            }}
        >
            {displayName}
        </span>
    );
}
