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

export default function RoleBadge({ roleName }) {
  // NORMALIZE: Loại bỏ prefix ROLE_, khoảng trắng, chuyển về uppercase
  const normalized = (roleName || "")
    .toString()
    .replace(/^ROLE_/i, "") // Loại bỏ "ROLE_" ở đầu (case-insensitive)
    .toUpperCase()
    .replace(/\s+/g, "_");

  let backgroundColor = "#e1e7ef"; // mặc định xám
  let color = "white";

  // Mapping màu cố định cho các role chính
  switch (normalized) {
    case "ADMIN":
      backgroundColor = "#00bf63"; // xanh lá
      break;
    case "LAB_USER":
    case "LABUSER": // thêm variant không có underscore
      backgroundColor = "#fe535b"; // đỏ cam
      break;
    case "MANAGER":
    case "LAB_MANAGER":
    case "LABMANAGER":
      backgroundColor = "#8c52ff"; // tím
      break;
    case "SERVICE_USER":
    case "SERVICEUSER":
    case "SERVICE":
      backgroundColor = "#5170ff"; // xanh dương
      break;
    case "PATIENT":
      backgroundColor = "#ff9800"; // cam
      break;
    case "DEFAULT":
    case "GUEST":
      backgroundColor = "#e1e7ef"; // xám
      color = "#333"; // text tối cho nền sáng
      break;
    default:
      // Role tùy chỉnh: sinh màu từ tên
      backgroundColor = stringToColor(normalized);
  }

  // Display name: format đẹp (bỏ underscore, giữ nguyên tên gốc đã normalize)
  const displayName = normalized.replace(/_/g, " ");

  return (
    <span
      style={{
        backgroundColor,
        color,
        padding: "4px 10px",
        borderRadius: "20px",
        fontSize: "12px",
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
