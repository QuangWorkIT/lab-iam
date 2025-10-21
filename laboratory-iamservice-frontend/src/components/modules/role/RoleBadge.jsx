import React from "react";

export default function RoleBadge({ roleName }) {
  let badgeStyle = {};

  switch (roleName.toLowerCase()) {
    case "administrator":
      badgeStyle = {
        backgroundColor: "#00bf63", // Xanh lá
        color: "white",
      };
      break;
    case "staff":
    case "member":
      badgeStyle = {
        backgroundColor: "#8c52ff", // Tím
        color: "white",
      };
      break;
    case "user":
      badgeStyle = {
        backgroundColor: "#fe535b", // Đỏ
        color: "white",
      };
      break;
    case "guest":
      badgeStyle = {
        backgroundColor: "#5170ff", // Xanh dương
        color: "white",
      };
      break;
    default:
      badgeStyle = {
        backgroundColor: "#e1e7ef", // Xám
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
