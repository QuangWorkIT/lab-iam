import React from "react";
import { motion as Motion, AnimatePresence } from "motion/react";
import UpdateUserForm from "./UpdateUserForm";

/**
 * Update User Modal - Used from User Management table
 * Modal riêng cho admin update user
 */
export default function UpdateUserModal({ isOpen, user, roles, onClose, onSubmit }) {
    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <Motion.div
                key="overlay"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
                style={{
                    position: "fixed",
                    inset: 0,
                    backgroundColor: "rgba(0,0,0,0.6)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    zIndex: 1000,
                    backdropFilter: "blur(2px)"
                }}
            >
                <Motion.div
                    key="modal"
                    initial={{ scale: 0.9, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.9, opacity: 0, y: 20 }}
                    transition={{ duration: 0.2, ease: "easeOut" }}
                    onClick={(e) => e.stopPropagation()}
                    style={{
                        backgroundColor: "white",
                        borderRadius: 16,
                        width: "520px",
                        maxWidth: "95vw",
                        maxHeight: "90vh",
                        overflow: "hidden",
                        boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
                        display: "flex",
                        flexDirection: "column",
                        position: "relative"
                    }}
                >
                    {/* Close button */}
                    <button
                        onClick={onClose}
                        style={{
                            position: "absolute",
                            top: 20,
                            right: 20,
                            background: "white",
                            border: "2px solid #e0e0e0",
                            fontSize: 20,
                            cursor: "pointer",
                            color: "#666",
                            zIndex: 10,
                            width: 40,
                            height: 36,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            borderRadius: "50%",
                            transition: "all 0.2s",
                            fontWeight: 300
                        }}
                        onMouseEnter={(e) => {
                            e.target.style.backgroundColor = "#FF5A5A";
                            e.target.style.borderColor = "#FF5A5A";
                            e.target.style.color = "white";
                        }}
                        onMouseLeave={(e) => {
                            e.target.style.backgroundColor = "white";
                            e.target.style.borderColor = "#e0e0e0";
                            e.target.style.color = "#666";
                        }}
                    >
                        ×
                    </button>

                    {/* Content area */}
                    <div style={{
                        flex: 1,
                        overflow: "auto",
                        padding: "16px 32px 24px 32px"
                    }}>
                        <UpdateUserForm
                            user={user}
                            roles={roles}
                            onCancel={onClose}
                            onSubmit={onSubmit}
                        />
                    </div>
                </Motion.div>
            </Motion.div>
        </AnimatePresence>
    );
}
