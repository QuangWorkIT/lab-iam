import React from "react";
import { FaEye, FaEdit, FaTrash } from "react-icons/fa";

export default function ActionButtons({ onView, onEdit, onDelete, item }) {
  return (
    <div style={{ display: "flex", justifyContent: "center", gap: "10px" }}>
      <button
        style={{
          backgroundColor: "#5170ff",
          color: "white",
          border: "none",
          borderRadius: "4px",
          padding: "5px 10px",
          cursor: "pointer",
          boxShadow: "0 1px 2px rgba(0,0,0,0.1)",
          transition: "all 0.2s ease",
        }}
        title="View"
        onClick={() => onView(item)}
      >
        <FaEye />
      </button>
      <button
        style={{
          backgroundColor: "#ffbf0d",
          color: "white",
          border: "none",
          borderRadius: "4px",
          padding: "5px 10px",
          cursor: "pointer",
          boxShadow: "0 1px 2px rgba(0,0,0,0.1)",
          transition: "all 0.2s ease",
        }}
        title="Edit"
        onClick={() => onEdit(item)}
      >
        <FaEdit />
      </button>
      <button
        style={{
          backgroundColor: "#fe535b",
          color: "white",
          border: "none",
          borderRadius: "4px",
          padding: "5px 10px",
          cursor: "pointer",
          boxShadow: "0 1px 2px rgba(0,0,0,0.1)",
          transition: "all 0.2s ease",
        }}
        title="Delete"
        onClick={() => onDelete(item.code)}
      >
        <FaTrash />
      </button>
    </div>
  );
}
