import React from "react";
import { FaUser, FaTimes, FaSyncAlt } from "react-icons/fa";

export default function UserDetailModal({ user, isOpen, onClose, onRefresh }) {
    if (!isOpen || !user) return null;

    const formatDate = (dateString) => {
        if (!dateString) return "N/A";
        const date = new Date(dateString);
        return date.toLocaleDateString('en-GB'); // DD/MM/YYYY format
    };

    const getGenderText = (gender) => {
        return gender === "M" ? "Male" : gender === "F" ? "Female" : "N/A";
    };

    const getStatusColor = (isActive) => {
        return isActive ? "#28a745" : "#dc3545";
    };

    const getStatusText = (isActive) => {
        return isActive ? "Active" : "Inactive";
    };

    return (
        <div
            style={{
                position: "fixed",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: "rgba(0, 0, 0, 0.5)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 1000,
            }}
        >
            <div
                style={{
                    backgroundColor: "white",
                    borderRadius: "12px",
                    width: "90%",
                    maxWidth: "700px",
                    minHeight: "400px",
                    maxHeight: "85vh",
                    overflow: "hidden",
                    boxShadow: "0 8px 32px rgba(0, 0, 0, 0.15)",
                    display: "flex",
                    position: "relative",
                }}
            >
                {/* Left Panel - Orange */}
                <div
                    style={{
                        backgroundColor: "#ff5a5f",
                        width: "180px",
                        minWidth: "180px",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        padding: "30px 15px",
                        borderRadius: "12px 0 0 12px",
                        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
                    }}
                >
                    {/* User Avatar */}
                    <div
                        style={{
                            width: "70px",
                            height: "70px",
                            backgroundColor: "white",
                            borderRadius: "50%",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            marginBottom: "15px",
                        }}
                    >
                        <FaUser style={{ fontSize: "35px", color: "#ff5a5f" }} />
                    </div>

                    {/* User Name */}
                    <h3
                        style={{
                            color: "white",
                            fontSize: "16px",
                            fontWeight: "bold",
                            margin: "0 0 5px 0",
                            textAlign: "center",
                        }}
                    >
                        {user.name || "N/A"}
                    </h3>

                    {/* User Role */}
                    <p
                        style={{
                            color: "white",
                            fontSize: "11px",
                            fontWeight: "500",
                            margin: 0,
                            textTransform: "uppercase",
                            textAlign: "center",
                        }}
                    >
                        {user.role || "N/A"}
                    </p>
                </div>

                {/* Right Panel - White */}
                <div
                    style={{
                        flex: 1,
                        padding: "25px",
                        position: "relative",
                        backgroundColor: "white",
                        borderRadius: "0 12px 12px 0",
                        minHeight: "400px",
                    }}
                >
                    {/* Close Button */}
                    <button
                        onClick={onClose}
                        style={{
                            position: "absolute",
                            top: "20px",
                            right: "20px",
                            width: "auto",
                            height: "auto",
                            border: "none",
                            borderRadius: "0",
                            backgroundColor: "transparent",
                            color: "#ff5a5f",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            boxShadow: "none",
                            fontSize: "20px",
                            fontWeight: "bold",
                            transition: "all 0.2s ease",
                            zIndex: 9999,
                            padding: "8px",
                            outline: "none",
                        }}
                        onMouseEnter={(e) => {
                            e.target.style.color = "#dc3545";
                            e.target.style.transform = "scale(1.2)";
                        }}
                        onMouseLeave={(e) => {
                            e.target.style.color = "#ff5a5f";
                            e.target.style.transform = "scale(1)";
                        }}
                        aria-label="Close"
                    >
                        <FaTimes />
                    </button>

                    {/* Refresh Button */}
                    <button
                        onClick={onRefresh}
                        style={{
                            position: "absolute",
                            bottom: "20px",
                            right: "20px",
                            width: "auto",
                            height: "auto",
                            border: "none",
                            borderRadius: "0",
                            backgroundColor: "transparent",
                            color: "#6f42c1",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            boxShadow: "none",
                            fontSize: "18px",
                            fontWeight: "bold",
                            transition: "all 0.2s ease",
                            zIndex: 9999,
                            padding: "8px",
                            outline: "none",
                        }}
                        onMouseEnter={(e) => {
                            e.target.style.color = "#4c3398";
                            e.target.style.transform = "scale(1.2)";
                        }}
                        onMouseLeave={(e) => {
                            e.target.style.color = "#6f42c1";
                            e.target.style.transform = "scale(1)";
                        }}
                        aria-label="Refresh"
                    >
                        <FaSyncAlt />
                    </button>

                    {/* User Information Grid */}
                    <div
                        style={{
                            display: "grid",
                            gridTemplateColumns: "1fr 1fr",
                            gap: "20px",
                            marginTop: "10px",
                            paddingBottom: "60px", // Space for buttons
                        }}
                    >
                        {/* Left Column */}
                        <div>
                            {/* Identity Number */}
                            <div style={{ marginBottom: "15px" }}>
                                <div
                                    style={{
                                        display: "flex",
                                        alignItems: "flex-start",
                                        marginBottom: "5px",
                                    }}
                                >
                                    <div
                                        style={{
                                            width: "3px",
                                            height: "35px",
                                            backgroundColor: "#ff5a5f",
                                            marginRight: "10px",
                                            borderRadius: "2px",
                                        }}
                                    />
                                    <div>
                                        <p
                                            style={{
                                                color: "#6f42c1",
                                                fontSize: "11px",
                                                fontWeight: "500",
                                                margin: "0 0 3px 0",
                                                textTransform: "uppercase",
                                            }}
                                        >
                                            Identity Number
                                        </p>
                                        <p
                                            style={{
                                                color: "#333",
                                                fontSize: "13px",
                                                fontWeight: "500",
                                                margin: 0,
                                            }}
                                        >
                                            {user.identifyNumber || "N/A"}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Phone Number */}
                            <div style={{ marginBottom: "15px" }}>
                                <div
                                    style={{
                                        display: "flex",
                                        alignItems: "flex-start",
                                        marginBottom: "5px",
                                    }}
                                >
                                    <div
                                        style={{
                                            width: "3px",
                                            height: "35px",
                                            backgroundColor: "#ff5a5f",
                                            marginRight: "10px",
                                            borderRadius: "2px",
                                        }}
                                    />
                                    <div>
                                        <p
                                            style={{
                                                color: "#6f42c1",
                                                fontSize: "11px",
                                                fontWeight: "500",
                                                margin: "0 0 3px 0",
                                                textTransform: "uppercase",
                                            }}
                                        >
                                            Phone Number
                                        </p>
                                        <p
                                            style={{
                                                color: "#333",
                                                fontSize: "13px",
                                                fontWeight: "500",
                                                margin: 0,
                                            }}
                                        >
                                            {user.phoneNumber || "N/A"}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Gender */}
                            <div style={{ marginBottom: "15px" }}>
                                <div
                                    style={{
                                        display: "flex",
                                        alignItems: "flex-start",
                                        marginBottom: "5px",
                                    }}
                                >
                                    <div
                                        style={{
                                            width: "3px",
                                            height: "35px",
                                            backgroundColor: "#ff5a5f",
                                            marginRight: "10px",
                                            borderRadius: "2px",
                                        }}
                                    />
                                    <div>
                                        <p
                                            style={{
                                                color: "#6f42c1",
                                                fontSize: "11px",
                                                fontWeight: "500",
                                                margin: "0 0 3px 0",
                                                textTransform: "uppercase",
                                            }}
                                        >
                                            Gender
                                        </p>
                                        <p
                                            style={{
                                                color: "#333",
                                                fontSize: "13px",
                                                fontWeight: "500",
                                                margin: 0,
                                            }}
                                        >
                                            {getGenderText(user.gender)}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Email */}
                            <div style={{ marginBottom: "15px" }}>
                                <div
                                    style={{
                                        display: "flex",
                                        alignItems: "flex-start",
                                        marginBottom: "5px",
                                    }}
                                >
                                    <div
                                        style={{
                                            width: "3px",
                                            height: "35px",
                                            backgroundColor: "#ff5a5f",
                                            marginRight: "10px",
                                            borderRadius: "2px",
                                        }}
                                    />
                                    <div>
                                        <p
                                            style={{
                                                color: "#6f42c1",
                                                fontSize: "11px",
                                                fontWeight: "500",
                                                margin: "0 0 3px 0",
                                                textTransform: "uppercase",
                                            }}
                                        >
                                            Email
                                        </p>
                                        <p
                                            style={{
                                                color: "#333",
                                                fontSize: "13px",
                                                fontWeight: "500",
                                                margin: 0,
                                            }}
                                        >
                                            {user.email || "N/A"}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right Column */}
                        <div>
                            {/* Date of Birth */}
                            <div style={{ marginBottom: "15px" }}>
                                <div
                                    style={{
                                        display: "flex",
                                        alignItems: "flex-start",
                                        marginBottom: "5px",
                                    }}
                                >
                                    <div
                                        style={{
                                            width: "3px",
                                            height: "35px",
                                            backgroundColor: "#ff5a5f",
                                            marginRight: "10px",
                                            borderRadius: "2px",
                                        }}
                                    />
                                    <div>
                                        <p
                                            style={{
                                                color: "#6f42c1",
                                                fontSize: "11px",
                                                fontWeight: "500",
                                                margin: "0 0 3px 0",
                                                textTransform: "uppercase",
                                            }}
                                        >
                                            Date of Birth
                                        </p>
                                        <p
                                            style={{
                                                color: "#333",
                                                fontSize: "13px",
                                                fontWeight: "500",
                                                margin: 0,
                                            }}
                                        >
                                            {formatDate(user.dateOfBirth)}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Address */}
                            <div style={{ marginBottom: "15px" }}>
                                <div
                                    style={{
                                        display: "flex",
                                        alignItems: "flex-start",
                                        marginBottom: "5px",
                                    }}
                                >
                                    <div
                                        style={{
                                            width: "3px",
                                            height: "35px",
                                            backgroundColor: "#ff5a5f",
                                            marginRight: "10px",
                                            borderRadius: "2px",
                                        }}
                                    />
                                    <div>
                                        <p
                                            style={{
                                                color: "#6f42c1",
                                                fontSize: "11px",
                                                fontWeight: "500",
                                                margin: "0 0 3px 0",
                                                textTransform: "uppercase",
                                            }}
                                        >
                                            Address
                                        </p>
                                        <p
                                            style={{
                                                color: "#333",
                                                fontSize: "13px",
                                                fontWeight: "500",
                                                margin: 0,
                                            }}
                                        >
                                            {user.address || "N/A"}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Country */}
                            <div style={{ marginBottom: "15px" }}>
                                <div
                                    style={{
                                        display: "flex",
                                        alignItems: "flex-start",
                                        marginBottom: "5px",
                                    }}
                                >
                                    <div
                                        style={{
                                            width: "3px",
                                            height: "35px",
                                            backgroundColor: "#ff5a5f",
                                            marginRight: "10px",
                                            borderRadius: "2px",
                                        }}
                                    />
                                    <div>
                                        <p
                                            style={{
                                                color: "#6f42c1",
                                                fontSize: "11px",
                                                fontWeight: "500",
                                                margin: "0 0 3px 0",
                                                textTransform: "uppercase",
                                            }}
                                        >
                                            Country
                                        </p>
                                        <p
                                            style={{
                                                color: "#333",
                                                fontSize: "13px",
                                                fontWeight: "500",
                                                margin: 0,
                                            }}
                                        >
                                            {user.country || "N/A"}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Status */}
                            <div style={{ marginBottom: "15px" }}>
                                <div
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        marginBottom: "5px",
                                    }}
                                >
                                    <div
                                        style={{
                                            width: "3px",
                                            height: "35px",
                                            backgroundColor: "#ff5a5f",
                                            marginRight: "10px",
                                            borderRadius: "2px",
                                        }}
                                    />
                                    <div style={{ display: "flex", alignItems: "center" }}>
                                        <div
                                            style={{
                                                width: "6px",
                                                height: "6px",
                                                borderRadius: "50%",
                                                backgroundColor: getStatusColor(user.isActive),
                                                marginRight: "6px",
                                            }}
                                        />
                                        <p
                                            style={{
                                                color: "#333",
                                                fontSize: "13px",
                                                fontWeight: "500",
                                                margin: 0,
                                            }}
                                        >
                                            {getStatusText(user.isActive)}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}