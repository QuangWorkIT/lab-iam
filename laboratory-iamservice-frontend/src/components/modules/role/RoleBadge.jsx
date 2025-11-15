import React from "react";

// Helper: sinh màu nhất quán từ string (hash-based HSL)
function stringToColor(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  // HSL: hue từ hash, saturation 65%, lightness 50% (màu tươi, dễ đọc text trắng)
  const hue = Math.abs(hash) % 360;
  return `hsl(${hue}, 65%, 50%)`;
}

// EXPORT: Normalize role name
export const normalizeRoleName = (roleName) => {
  return (roleName || "")
    .toString()
    .replace(/^ROLE_/i, "") // Loại bỏ "ROLE_" ở đầu (case-insensitive)
    .toUpperCase()
    .replace(/\s+/g, "_");
};

// EXPORT: Get color for role
export const getRoleColor = (roleName) => {
  const normalized = normalizeRoleName(roleName);

  switch (normalized) {
    case "ADMIN":
      return "#00bf63"; // xanh lá
    case "LAB_USER":
    case "LABUSER":
      return "#fe535b"; // đỏ cam
    case "MANAGER":
    case "LAB_MANAGER":
    case "LABMANAGER":
      return "#8c52ff"; // tím
    case "SERVICE_USER":
    case "SERVICEUSER":
    case "SERVICE":
      return "#5170ff"; // xanh dương
    case "PATIENT":
      return "#ff9800"; // cam
    case "DEFAULT":
    case "GUEST":
      return "#e1e7ef"; // xám
    default:
      // Role tùy chỉnh: sinh màu từ tên
      return stringToColor(normalized);
  }
};

// EXPORT: Format display name
export const formatRoleName = (roleName) => {
  return normalizeRoleName(roleName).replace(/_/g, " ");
};

export default function RoleBadge({ roleName }) {
  const backgroundColor = getRoleColor(roleName);
  const displayName = formatRoleName(roleName);

  // Xác định màu text (xám cần text tối)
  const needsDarkText = backgroundColor === "#e1e7ef";
  const color = needsDarkText ? "#333" : "white";

  return (
    <span
      style={{
        backgroundColor,
        color,
        padding: "4px 10px",
        borderRadius: "20px",
        fontSize: "14px",
        fontWeight: "bold",
        display: "inline-block",
        minWidth: "80px",
        textAlign: "center",
        boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
        textShadow: color === "white" ? "0 1px 1px rgba(0,0,0,0.1)" : "none",
        textTransform: "uppercase",
      }}
    >
      {displayName}
    </span>
  );
}
