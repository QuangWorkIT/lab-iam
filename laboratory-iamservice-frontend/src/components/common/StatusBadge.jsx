import React from "react";

export default function StatusBadge({ active, text }) {
  const label = text || (active ? "Active" : "Inactive");
  return (
    <span
      aria-label={`status-${label.toLowerCase()}`}
      title={label}
      style={{
        backgroundColor: active ? "#00bf63" : "#fe535b",
        color: "white",
        padding: "4px 12px",
        borderRadius: "9999px",
        fontSize: "12px",
        fontWeight: "bold",
        whiteSpace: "nowrap",
      }}
    >
      {label}
    </span>
  );
}
