import React from "react";
import { FiEye, FiEdit, FiTrash2 } from "react-icons/fi";

export default function UserActionButtons({ onView, onEdit, onDelete, user }) {
    return (
        <div style={{ display: "flex", justifyContent: "center", gap: "10px" }}>
            <button
                style={{
                    backgroundColor: "transparent",
                    color: "#fe535b",
                    border: "none",
                    padding: "5px",
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                    fontSize: "18px",
                }}
                title="View"
                onClick={() => onView(user)}
            >
                <FiEye size={18} />
            </button>
            {onEdit && (
                <button
                    style={{
                        backgroundColor: "transparent",
                        color: "#fe535b",
                        border: "none",
                        padding: "5px",
                        cursor: "pointer",
                        transition: "all 0.2s ease",
                        fontSize: "18px",
                    }}
                    title="Edit"
                    onClick={() => onEdit(user)}
                >
                    <FiEdit size={18} />
                </button>
            )}
            {onDelete && (
                <button
                    style={{
                        backgroundColor: "transparent",
                        color: "#fe535b",
                        border: "none",
                        padding: "5px",
                        cursor: "pointer",
                        transition: "all 0.2s ease",
                        fontSize: "18px",
                    }}
                    title="Delete"
                    onClick={() => onDelete(user.id)}
                >
                    <FiTrash2 size={18} />
                </button>
            )}
        </div>
    );
}
