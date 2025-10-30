import React from "react";
import { FaEye, FaEdit, FaTrash } from "react-icons/fa";

export default function UserActionButtons({ onView, onEdit, onDelete, user }) {
    return (
        <div style={{ display: "flex", justifyContent: "center", gap: "10px" }}>
            <button
                style={{
                    backgroundColor: "transparent",
                    color: "#ff5a5f",
                    border: "none",
                    padding: "5px",
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                    fontSize: "18px",
                }}
                title="View"
                onClick={() => onView(user)}
            >
                <FaEye />
            </button>
            <button
                style={{
                    backgroundColor: "transparent",
                    color: "#ff5a5f",
                    border: "none",
                    padding: "5px",
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                    fontSize: "18px",
                }}
                title="Edit"
                onClick={() => onEdit(user)}
            >
                <FaEdit />
            </button>
            <button
                style={{
                    backgroundColor: "transparent",
                    color: "#ff5a5f",
                    border: "none",
                    padding: "5px",
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                    fontSize: "18px",
                }}
                title="Delete"
                onClick={() => onDelete(user.id)}
            >
                <FaTrash />
            </button>
        </div>
    );
}
