import React from "react";

export default function UserBadge({ roleName }) {
    const getRoleStyle = (role) => {
        const roleStyles = {
            ADMIN: {
                backgroundColor: "#28a745",
                color: "white",
            },
            "LAB USER": {
                backgroundColor: "#ffc107",
                color: "black",
            },
            MANAGER: {
                backgroundColor: "#6f42c1",
                color: "white",
            },
            "SERVICE USER": {
                backgroundColor: "#17a2b8",
                color: "white",
            },
            GUEST: {
                backgroundColor: "#dc3545",
                color: "white",
            },
        };

        return roleStyles[role] || {
            backgroundColor: "#6c757d",
            color: "white",
        };
    };

    const style = getRoleStyle(roleName);

    return (
        <span
            style={{
                display: "inline-block",
                padding: "4px 12px",
                borderRadius: "12px",
                fontSize: "12px",
                fontWeight: "500",
                textAlign: "center",
                minWidth: "80px",
                ...style,
            }}
        >
            {roleName}
        </span>
    );
}
