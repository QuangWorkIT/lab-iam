import Item from "antd/es/list/Item";
import React from "react";
import { FiEye, FiEdit, FiTrash2 } from "react-icons/fi";

export default function ActionButtons({ onView, onEdit, onDelete, item }) {
  const iconColor = "#fe535b";

  const btnStyle = {
    background: "transparent",
    color: iconColor,
    border: "none",
    padding: "4px",
    cursor: "pointer",
  };

  return (
    <div style={{ display: "flex", justifyContent: "center", gap: "16px" }}>
      <button
        type="button"
        style={btnStyle}
        title="View"
        aria-label="View"
        onClick={() => onView(item)}
      >
        <FiEye size={18} />
      </button>
      <button
        type="button"
        style={btnStyle}
        title="Edit"
        aria-label="Edit"
        onClick={() => onEdit(item)}
      >
        <FiEdit size={18} />
      </button>
      <button
        type="button"
        style={btnStyle}
        title="Delete"
        aria-label="Delete"
        onClick={() => onDelete(item)}
      >
        <FiTrash2 size={18} />
      </button>
    </div>
  );
}
