import React from "react";

export default function StatusBadge({ active, text }) {
  return (
    <span
      style={{
        backgroundColor: active ? "#2ecc71" : "#e74c3c",
        color: "white",
        padding: "3px 8px",
        borderRadius: "3px",
        fontSize: "12px",
      }}
    >
      {text || (active ? "Active" : "Inactive")}
    </span>
  );
}
