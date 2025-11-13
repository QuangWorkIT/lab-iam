import Item from "antd/es/list/Item";
import React from "react";
import { FiEye, FiEdit, FiTrash2 } from "react-icons/fi";

export default function ActionButtons({
  onView,
  onEdit,
  onDelete,
  item,
  isSystemRole = false,
  canViewRole = true,
  canUpdateRole = true,
  canDeleteRole = true,
}) {
  const iconColor = "#fe535b";

  const btnStyle = {
    background: "transparent",
    color: iconColor,
    border: "none",
    padding: "4px",
    cursor: "pointer",
  };

  const disabledBtnStyle = {
    background: "transparent",
    color: "#999",
    border: "none",
    padding: "4px",
    cursor: "not-allowed",
    opacity: 0.5,
  };

  return (
    <div style={{ display: "flex", justifyContent: "center", gap: "16px" }}>
      {canViewRole&&(
      <button
        type="button"
        style={btnStyle}
        title="View"
        aria-label="View"
        onClick={() => onView(item)}
      >
        <FiEye size={18} />
      </button>)}

      {canUpdateRole&&(<button
        type="button"
        style={btnStyle}
        title="Edit"
        aria-label="Edit"
        onClick={() => onEdit(item)}
      >
        <FiEdit size={18} />
      </button>)}


      {canDeleteRole&&(<button
        type="button"
        style={isSystemRole ? disabledBtnStyle : btnStyle}
        title={isSystemRole ? "System role cannot be deleted" : "Delete"}
        aria-label="Delete"
        onClick={() => !isSystemRole && onDelete(item)}
        disabled={isSystemRole}
      >
        <FiTrash2 size={18} />
      </button>)}
    </div>
  );
}
