import React from "react";

export default function RoleBadge({ roleName }) {
  let badgeStyle = {};

  switch (roleName.toLowerCase()) {
    case "administrator":
      badgeStyle = {
        backgroundColor: "#2ecc71", // Xanh lá
        color: "white",
      };
      break;
    case "manager":
    case "lab manager":
      badgeStyle = {
        backgroundColor: "#9b59b6", // Tím
        color: "white",
      };
      break;
    case "lab user":
      badgeStyle = {
        backgroundColor: "#e74c3c", // Đỏ
        color: "white",
      };
      break;
    case "service user":
      badgeStyle = {
        backgroundColor: "#3498db", // Xanh dương
        color: "white",
      };
      break;
    default:
      badgeStyle = {
        backgroundColor: "#95a5a6", // Xám
        color: "white",
      };
  }

  return (
    <span
      style={{
        ...badgeStyle,
        padding: "4px 10px",
        borderRadius: "4px",
        fontSize: "12px",
        fontWeight: "bold",
        display: "inline-block",
        minWidth: "80px",
        textAlign: "center",
        boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
        textShadow: "0 1px 1px rgba(0,0,0,0.1)",
      }}
    >
      {roleName}
    </span>
  );
}
