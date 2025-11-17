import React from "react";
import { FiEye, FiEdit, FiTrash2 } from "react-icons/fi";

export default function UserActionButtons({
  onView,
  onEdit,
  onDelete,
  user,
  canViewUser = true,
  canModifyUser = true,
  canDeleteUser = true,
}) {
  return (
    <div style={{ display: "flex", justifyContent: "center", gap: "10px" }}>
      {canViewUser && (
        <button
          style={{
            backgroundColor: "transparent",
            color: "#FF5A5A",
            border: "none",
            padding: "5px",
            cursor: "pointer",
            transition: "all 0.2s ease",
            fontSize: "18px",
          }}
          title="View"
          onClick={() => onView(user)}
        >
          <FiEye size={24} />
        </button>
      )}
      {canModifyUser && (
        <button
          style={{
            backgroundColor: "transparent",
            color: "#FF5A5A",
            border: "none",
            padding: "5px",
            cursor: "pointer",
            transition: "all 0.2s ease",
            fontSize: "18px",
          }}
          title="Edit"
          onClick={() => onEdit(user)}
        >
          <FiEdit size={24} />
        </button>
      )}
      {canDeleteUser && (
        <button
          style={{
            backgroundColor: "transparent",
            color: "#FF5A5A",
            border: "none",
            padding: "5px",
            cursor: "pointer",
            transition: "all 0.2s ease",
            fontSize: "18px",
          }}
          title="Delete"
          onClick={() => onDelete(user.id)}
        >
          <FiTrash2 size={24} />
        </button>
      )}
    </div>
  );
}
