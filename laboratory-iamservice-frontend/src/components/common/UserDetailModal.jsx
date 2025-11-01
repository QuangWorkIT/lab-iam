import { FaUser, FaTimes, FaSyncAlt } from "react-icons/fa";
import { Tooltip } from "antd";
import { CheckCircleTwoTone, EditOutlined, ArrowLeftOutlined, ExclamationCircleTwoTone } from '@ant-design/icons';
import ResetPassWord from "../modules/auth/ResetPassWordForm.jsx";
import { useState, useEffect } from "react"
import { getRoleName } from "../../utils/formatter.js"
import { useSelector } from "react-redux";
import { motion, AnimatePresence } from "motion/react"
import { useDispatch } from "react-redux";
import { fetchUserById } from "../../redux/features/userManagementSlice";
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
                        hover:shadow-[0_6px_14px_rgba(82,196,26,0.6)] `
    const inActiveClass = `shadow-[0_4px_10px_rgba(220,53,69,0.4)]
                        hover:shadow-[0_6px_14px_rgba(220,53,69,0.6)]`
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
                            hover:cursor-pointer ${statusText === "Active" ? activeClass : inActiveClass}`}
                style={{ background: statusColor }}
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
function RightPanel({ propUser, onRefresh, formatDate, getGenderText, setIsResetPassWordOpen, userId }) {
    const { userInfo } = useSelector((state) => state.user)
    const dispatch = useDispatch();

    // Handle refresh - re-fetch user from API
    const handleRefresh = () => {
        if (userId || propUser?.id) {
            dispatch(fetchUserById(userId || propUser.id));
        }
        if (onRefresh) {
            onRefresh();
        }
    };

    // Helper function to render an information field
    const renderField = (label, value) => (
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
                        {label === "Password" && userInfo.id === propUser.id &&
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
            <button
                onClick={handleRefresh}
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
                    gap: "10px",
                    marginTop: "65px",
                    // paddingBottom: onRefresh ? "60px" : "10px",
                    wordBreak: "break-word",
                    overflowWrap: "break-word",
                    justifyContent: "center",
                    alignItems: "flex-start",
                    height: "100%",
                }}
            >
                {/* Left Column */}
                <div>
                    {renderField("Identity Number", propUser?.identifyNumber || "N/A")}
                    {renderField("Phone Number", propUser?.phoneNumber || "N/A")}
                    {renderField("Gender", getGenderText ? getGenderText(propUser?.gender) : (propUser?.gender || "N/A"))}
                    {renderField("Email", propUser?.email || "N/A")}
                </div>

                {/* Right Column */}
                <div>
                    {renderField("Date of Birth", formatDate ? formatDate(propUser?.dateOfBirth) : (propUser?.dateOfBirth || "N/A"))}
                    {renderField("Age", propUser?.age !== undefined && propUser?.age !== null ? `${propUser.age} years old` : "N/A")}
                    {renderField("Address", propUser?.address || "N/A")}
                    {userInfo.id === propUser.id && (renderField("Password", "*********"))}
                </div>
            </div>
        </div>
    );
}

// Main Modal Component
export default function UserDetailModal({ user, userId, isOpen, onClose, onRefresh }) {
    const dispatch = useDispatch();
    const [isResetPassWordOpen, setIsResetPassWordOpen] = useState(false);

    // Get user detail from Redux store or use passed user prop
    const { userDetail, userDetailLoading, error } = useSelector((state) => state.users);

    // Determine the user ID to fetch
    const targetUserId = userId || user?.id;

    // Fetch user detail when modal opens and we have a userId
    useEffect(() => {
        if (isOpen && targetUserId) {
            // Always fetch from API to get full user details
            dispatch(fetchUserById(targetUserId));
        }
    }, [isOpen, targetUserId, dispatch]);

    // Use fetched user detail (from API) or passed user prop as fallback
    const displayUser = userDetail || user;

    // Show loading state
    if (isOpen && !displayUser && userDetailLoading) {
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
                        padding: "40px",
                        textAlign: "center",
                    }}
                >
                    <div>Loading user details...</div>
                </div>
            </div>
        );
    }

    // Show error state
    if (isOpen && error && !displayUser) {
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
                        padding: "40px",
                        textAlign: "center",
                    }}
                >
                    <div style={{ color: "red", marginBottom: "20px" }}>Error: {error}</div>
                    <button
                        onClick={onClose}
                        style={{
                            padding: "10px 20px",
                            backgroundColor: "#ff5a5f",
                            color: "white",
                            border: "none",
                            borderRadius: "5px",
                            cursor: "pointer",
                        }}
                    >
                        Close
                    </button>
                </div>
            </div>
        );
    }

    if (!isOpen || !displayUser) return null;

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
                background: "white",
                borderRadius: "12px",
                width: "650px",
                height: "450px",
                display: "flex",
                boxShadow: "0 8px 32px rgba(0,0,0,0.15)",
                position: "relative",
                left: "20px"
            }}
        >
            <div style={{ width: "150px" }}>
                <LeftPanel
                    user={user}
                    statusColor={getStatusColor(user.isActive)}
                    statusText={getStatusText(user.isActive)}
                />
            </div>

            <AnimatePresence mode="wait">
                {isResetPassWordOpen ? (
                    <motion.div
                        key="reset"
                        initial={{ opacity: 0, x: 40 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -40 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                        className="ml-[70px]"
                    >
                        <ResetPassWord
                            setIsResetPassWord={setIsResetPassWordOpen}
                            userId={user.id}
                            updateOption="change"
                        />
                    </motion.div>
                ) : (
                    <motion.div
                        key="info"
                        initial={{ opacity: 0, x: -40 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -40 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                        className="w-full"
                    >
                        <RightPanel
                            propUser={displayUser}
                            onRefresh={onRefresh}
                            formatDate={formatDate}
                            getGenderText={getGenderText}
                            setIsResetPassWordOpen={setIsResetPassWordOpen}
                            userId={targetUserId}
                        />
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Close Button */}
            <button
                onClick={isResetPassWordOpen ? () => setIsResetPassWordOpen(false) : onClose}
                className={`absolute ${isResetPassWordOpen ? "top-10 right-10" : "top-5 right-5"} 
                text-white hover:text-[#dc3545] hover:scale-120 flex items-center justify-center
                cursor-pointer font-bold text-[20px] transition-all duration-400 ease-in-out z-[9999] p-2`}
            >
                {isResetPassWordOpen ? (
                    <ArrowLeftOutlined className="!text-[#ff5a5f] text-[25px]" />
                ) : (
                    <FaTimes className="text-[#ff5a5f] text-[20px]" />
                )}
            </button>
        </div>
    );
}

