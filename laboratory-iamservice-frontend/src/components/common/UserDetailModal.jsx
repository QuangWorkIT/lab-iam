import { FaUser, FaTimes, FaSyncAlt } from "react-icons/fa";
import { Button, Tooltip } from "antd";
import { CheckCircleTwoTone, EditOutlined, ArrowLeftOutlined, ExclamationCircleTwoTone } from '@ant-design/icons';
import ResetPassWord from "../modules/auth/ResetPassWordForm.jsx";
import { useState } from "react"
import { getRoleName } from "../../utils/formatter.js"
/**
 * User Detail Modal - Reusable modal component for displaying user/account details
 * 
 * Split into 3 main components:
 * 1. Main wrapper with overlay and action buttons
 * 2. Left panel with avatar, name, and role
 * 3. Right panel with detailed information
 */

// Left Panel Component - Avatar, Name, Role
function LeftPanel({ user, statusColor, statusText }) {
    const activeClass = `shadow-[0_4px_10px_rgba(82,196,26,0.4)] 
                        hover:shadow-[0_6px_14px_rgba(82,196,26,0.6)]
                        bg-[${statusColor}]`

    const inActiveClass = `shadow-[0_4px_10px_rgba(220,53,69,0.4)]
                        hover:shadow-[0_6px_14px_rgba(220,53,69,0.6)]
                        bg-[${statusColor}]`;
    return (
        <div
            style={{
                backgroundColor: "#ff5a5f",
                minWidth: "180px",
                width: "250px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                padding: "30px 15px",
                borderRadius: "12px",
                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.5)",
                height: "75%",
                position: "relative",
                top: "50%",
                transform: "translateY(-50%)",
                left: "-80%",
                zIndex: 2000,
            }}
        >
            <div
                className={`absolute top-3 right-3 flex items-center justify-center 
                            rounded-full text-white group transition-all
                            duration-250 ease-in-out overflow-hidden w-[28px] hover:w-[90px] px-[10px] py-[5px]
                            hover:cursor-pointer 
                ${statusText === "Active" ? activeClass : inActiveClass}`}
            >

                {
                    statusText === "Active" ? (
                        <CheckCircleTwoTone
                            twoToneColor={statusColor}
                            style={{ fontSize: "18px" }}
                        />)
                        : (
                            <ExclamationCircleTwoTone
                                twoToneColor={statusColor}
                                style={{ fontSize: "18px" }} />
                        )
                }

                <span
                    className="hidden group-hover:block ml-[5px] text-[13px] font-semibold 
                    transition-opacity duration-600 whitespace-nowrap"
                >
                    {statusText}
                </span>
            </div>

            {/* User Avatar */}
            <div
                style={{
                    width: "100px",
                    height: "100px",
                    backgroundColor: "white",
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: "20px",
                    marginTop: "10px"
                }}
            >
                <FaUser style={{ fontSize: "50px", color: "#ff5a5f" }} />
            </div>

            {/* User Name */}
            <h3
                style={{
                    color: "white",
                    fontSize: "16px",
                    fontWeight: "bold",
                    margin: "0 0 10px 0",
                    textAlign: "center",
                }}
            >
                {user?.name || "N/A"}
            </h3>

            {/* User Role */}
            <p
                style={{
                    color: "white",
                    fontSize: "12px",
                    fontWeight: "500",
                    margin: 0,
                    textTransform: "uppercase",
                    textAlign: "center",
                }}
            >
                {getRoleName(user?.role) || "N/A"}
            </p>
        </div>
    );
}

// Right Panel Component - Detailed Information
function RightPanel({ user, onRefresh, formatDate, getGenderText, setIsResetPassWordOpen }) {
    // Helper function to render an information field
    const renderField = (label, value, isStatus = false) => (
        <div style={{ marginBottom: "15px" }}>
            <div
                style={{
                    display: "flex",
                    alignItems: "flex-start",
                    marginBottom: "30px",
                }}
            >
                <div
                    style={{
                        width: "4px",
                        height: "35px",
                        backgroundColor: "#ff5a5f",
                        marginRight: "10px",
                        borderRadius: "2px",
                    }}
                />
                <div>
                    <p
                        style={{
                            fontSize: "13px",
                            fontWeight: "600",
                            margin: "0 0 5px 0",
                            textTransform: "uppercase",
                            cursor: "default",
                            position: "relative"
                        }}
                        className="text-[#5170ff] hover:text-[#748cfc] transition-all duration-300 ease"
                    >
                        {label}
                        {label === "Password" &&
                            <Tooltip placement="top" title={"Change password"} >
                                <button
                                    onClick={() => setIsResetPassWordOpen(true)}
                                    className="absolute top-[-10px] p-2
                                    transition-all duration-200 ease-in-out
                                    !text-[#0f0f0f] hover:text-[#5170ff]
                                    rounded-full cursor-pointer hover:bg-[#e1e7ef]"
                                    aria-label="Edit password"
                                >
                                    <EditOutlined className="text-[16px]" />
                                </button>
                            </Tooltip>
                        }
                    </p>
                    <p
                        style={{
                            color: "#333",
                            fontSize: "13px",
                            fontWeight: "500",
                            marginTop: "5px",
                            wordBreak: "break-word",
                            overflowWrap: "break-word",
                            whiteSpace: "normal",
                        }}
                    >
                        {value}
                    </p>
                </div>
            </div>
        </div>
    );

    return (
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
            {/* Refresh Button */}
            {onRefresh && (
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
            )}

            {/* User Information Grid */}
            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "20px",
                    marginTop: "20px",
                    // paddingBottom: onRefresh ? "60px" : "10px",
                    wordBreak: "break-word",
                    overflowWrap: "break-word",
                    justifyContent: "center",
                    alignItems: "center",
                    height: "100%",
                }}
            >
                {/* Left Column */}
                <div>
                    {renderField("Identity Number", user?.identifyNumber || "N/A")}
                    {renderField("Phone Number", user?.phoneNumber || "N/A")}
                    {renderField("Gender", getGenderText ? getGenderText(user?.gender) : (user?.gender || "N/A"))}
                    {renderField("Email", user?.email || "N/A")}
                </div>

                {/* Right Column */}
                <div>
                    {renderField("Date of Birth", formatDate ? formatDate(user?.dateOfBirth) : (user?.dateOfBirth || "N/A"))}
                    {renderField("Age", user?.age !== undefined && user?.age !== null ? `${user.age} years old` : "N/A")}
                    {renderField("Address", user?.address || "N/A")}
                    {renderField("Password", "*********")}

                </div>
            </div>
        </div>
    );
}

// Main Modal Component
export default function UserDetailModal({ user, isOpen, onClose, onRefresh }) {
    if (!isOpen || !user) return null;
    const [isResetPassWordOpen, setIsResetPassWordOpen] = useState(false)

    // Helper functions
    const formatDate = (dateString) => {
        if (!dateString) return "N/A";
        const date = new Date(dateString);
        return date.toLocaleDateString('en-GB'); // DD/MM/YYYY format
    };

    const getGenderText = (gender) => {
        return gender === "MALE" ? "Male" : gender === "FEMALE" ? "Female" : "N/A";
    };

    const getStatusColor = (isActive) => {
        return isActive ? "#52c41a" : "#dc3545";
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
                backgroundColor: "rgba(0, 0, 0, 0.8)",
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
                    width: "650px",
                    maxWidth: "800px",
                    minHeight: "400px",
                    height: "450px",
                    maxHeight: "85vh",
                    boxShadow: "0 8px 32px rgba(0, 0, 0, 0.15)",
                    display: "flex",
                    position: "relative",
                    left: "100px"
                }}
            >
                {/* Left Panel */}
                <div style={{ position: "relative", width: "150px" }}>
                    <LeftPanel
                        user={user}
                        statusColor={getStatusColor(user.isActive)}
                        statusText={getStatusText(user.isActive)} />
                </div>

                {/* Right Panel */}
                {isResetPassWordOpen ? (
                    <div className="ml-[70px]">
                        <ResetPassWord
                            setIsResetPassWord={setIsResetPassWordOpen}
                            userId={user.id}
                            updateOption={"change"}
                        />
                    </div>)
                    : (
                        <RightPanel
                            user={user}
                            onRefresh={onRefresh}
                            formatDate={formatDate}
                            getGenderText={getGenderText}
                            setIsResetPassWordOpen={setIsResetPassWordOpen}
                        />
                    )}

                {/* Close Button */}
                <button
                    onClick={isResetPassWordOpen ? () => setIsResetPassWordOpen(false) : onClose}
                    className={`absolute ${isResetPassWordOpen ? "top-10 right-10" : "top-5 right-5"}
                    text-white hover:text-[#dc3545] hover:scale-120
                    flex items-center justify-center
                    cursor-pointer font-bold text-[20px]
                    transition-all duration-200 ease-in-out z-[9999] p-2`}
                    aria-label="Close"
                >
                    {isResetPassWordOpen ? (
                        <ArrowLeftOutlined
                            className="!text-[#ff5a5f] font-bold group-hover:text-[#dc3545] text-[20px]" />
                    ) : (
                        <FaTimes className="text-[#ff5a5f] group-hover:text-[#dc3545] text-[20px]" />
                    )}

                </button>
            </div>
        </div>
    );
}

