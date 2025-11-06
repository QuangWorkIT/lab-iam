import { FaUser, FaTimes } from "react-icons/fa";
import { Tooltip } from "antd";
import { CheckCircleTwoTone, EditOutlined, ArrowLeftOutlined, ExclamationCircleTwoTone, InfoCircleOutlined } from '@ant-design/icons';
import ResetPassWord from "../modules/auth/ResetPassWordForm.jsx";
import { useState, useEffect } from "react"
import { getRoleName } from "../../utils/formatter.js"
import { useSelector } from "react-redux";
import { motion as Motion, AnimatePresence } from "motion/react"
import { useDispatch } from "react-redux";
import { fetchUserById, updateOwnProfile, requestSelfDeletion } from "../../redux/features/userManagementSlice";
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
                {getRoleName(user?.roleCode) || "N/A"}
            </p>
        </div>
    );
}

// Right Panel Component - Detailed Information
function RightPanel({ propUser, formatDate, getGenderText, setIsResetPassWordOpen, onOpenUpdate, onDeleteAccount }) {
    const { userInfo } = useSelector((state) => state.user)
    const canUpdate = userInfo.id === propUser.id;

    // Check if user has PATIENT role (handle both "PATIENT" and "ROLE_PATIENT" formats)
    const isPatient = propUser?.role === "ROLE_PATIENT" ||
        propUser?.roleCode === "ROLE_PATIENT";

    // Check if user has requested account deletion (deletedAt is not null)
    const hasRequestedDeletion = propUser?.deletedAt !== null && propUser?.deletedAt !== undefined;

    // Debug: Log để kiểm tra giá trị
    console.log("🔍 Debug RightPanel:", {
        canUpdate,
        isPatient,
        hasRequestedDeletion,
        deletedAt: propUser?.deletedAt,
        propUserRole: propUser?.role,
        propUserRoleCode: propUser?.roleCode,
        userInfoId: userInfo.id,
        propUserId: propUser.id,
        propUser
    });

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
                        {label === "Identity Number" && userInfo.id === propUser.id &&
                            <Tooltip
                                placement="top"
                                title="To update your Identity Number, please contact an administrator"
                                overlayStyle={{ maxWidth: '250px' }}
                                color="#000000"
                            >
                                <InfoCircleOutlined
                                    className="ml-2 text-[14px] cursor-pointer"
                                    style={{
                                        color: "#000000",
                                        verticalAlign: "middle"
                                    }}
                                />
                            </Tooltip>
                        }
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
                    {renderField("Identity Number",
                        (propUser?.identityNumber && propUser.identityNumber !== "N/A") ? propUser.identityNumber :
                            (propUser?.identifyNumber && propUser.identifyNumber !== "N/A") ? propUser.identifyNumber : "N/A"
                    )}
                    {renderField("Phone Number",
                        (propUser?.phoneNumber && propUser.phoneNumber !== "N/A") ? propUser.phoneNumber : "N/A"
                    )}
                    {renderField("Gender",
                        (propUser?.gender && propUser.gender !== "N/A") ?
                            (getGenderText ? getGenderText(propUser.gender) : propUser.gender) : "N/A"
                    )}
                    {renderField("Email", propUser?.email || "N/A")}
                </div>

                {/* Right Column */}
                <div>
                    {renderField("Date of Birth",
                        (propUser?.dateOfBirth && propUser.dateOfBirth !== "N/A") ?
                            (formatDate ? formatDate(propUser.dateOfBirth) : propUser.dateOfBirth) : "N/A"
                    )}
                    {renderField("Age",
                        (propUser?.age !== undefined && propUser?.age !== null && propUser?.age !== "N/A") ?
                            `${propUser.age} years old` : "N/A"
                    )}
                    {renderField("Address",
                        (propUser?.address && propUser.address !== "N/A") ? propUser.address : "N/A"
                    )}
                    {userInfo.id === propUser.id && (renderField("Password", "*********"))}
                </div>
            </div>

            {/* Action buttons: Delete → Update - Only show if user has NOT requested deletion */}
            {canUpdate && !hasRequestedDeletion && (
                <>
                    {/* Delete Account button - only for PATIENT role */}
                    {isPatient && (
                        <button
                            onClick={onDeleteAccount}
                            style={{
                                position: "absolute",
                                bottom: "20px",
                                right: "90px",
                                padding: "8px 12px",
                                backgroundColor: "#ff5a5f",
                                color: "white",
                                border: "none",
                                borderRadius: "6px",
                                cursor: "pointer",
                                fontSize: "12px",
                                fontWeight: 600,
                                zIndex: 9999,
                                transition: "all 0.2s ease"
                            }}
                            onMouseEnter={(e) => { e.target.style.backgroundColor = "#ff5a5f"; }}
                            onMouseLeave={(e) => { e.target.style.backgroundColor = "#ff5a5f"; }}
                        >
                            Delete Account
                        </button>
                    )}

                    {/* Update button */}
                    <button
                        onClick={onOpenUpdate}
                        style={{
                            position: "absolute",
                            bottom: "20px",
                            right: "20px",
                            padding: "8px 12px",
                            backgroundColor: "#28a745",
                            color: "white",
                            border: "none",
                            borderRadius: "6px",
                            cursor: "pointer",
                            fontSize: "12px",
                            fontWeight: 600,
                            zIndex: 9999,
                            transition: "all 0.2s ease"
                        }}
                        onMouseEnter={(e) => { e.target.style.backgroundColor = "#218838"; }}
                        onMouseLeave={(e) => { e.target.style.backgroundColor = "#28a745"; }}
                    >
                        Update
                    </button>
                </>
            )}

            {/* Display notification if account deletion is requested */}
            {canUpdate && hasRequestedDeletion && (
                <div
                    style={{
                        position: "absolute",
                        bottom: "-5px",
                        right: "20px",
                        left: "20px",
                        padding: "12px 16px",
                        backgroundColor: "#fff3cd",
                        borderLeft: "4px solid #ffc107",
                        borderRadius: "6px",
                        color: "#856404",
                        fontSize: "13px",
                        fontWeight: 500,
                        lineHeight: "1.5"
                    }}
                >
                    ⚠️ Your account deletion has been requested. You cannot update or delete your account during this period.
                </div>
            )}
        </div>
    );
}

// Main Modal Component
import UpdateSelfForm from "../modules/user/UpdateSelfForm.jsx";
import { toast } from "react-toastify";

export default function UserDetailModal({ user, userId, isOpen, onClose, onRefresh }) {
    const dispatch = useDispatch();
    const [isResetPassWordOpen, setIsResetPassWordOpen] = useState(false);
    const [isSelfUpdateOpen, setIsSelfUpdateOpen] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

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

    // Debug log
    console.log("🔍 UserDetailModal Debug:", {
        isOpen,
        userDetail,
        user,
        displayUser,
        userDetailLoading,
        error,
        targetUserId
    });

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

    // Don't render if modal is not open
    if (!isOpen) return null;

    // If no user data available at all, show a message
    if (!displayUser) {
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
                onClick={onClose}
            >
                <div
                    style={{
                        backgroundColor: "white",
                        borderRadius: "12px",
                        padding: "40px",
                        textAlign: "center",
                    }}
                    onClick={(e) => e.stopPropagation()}
                >
                    <div style={{ marginBottom: "20px" }}>No user data available</div>
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

    const handleDeleteAccount = () => {
        setShowDeleteConfirm(true);
    };

    const handleConfirmDelete = async () => {
        try {
            // Call API to request deletion (for PATIENT role with 7 days grace period)
            await dispatch(requestSelfDeletion(displayUser.id)).unwrap();

            toast.success("Your deletion request has been submitted. Account will be deleted after 7 days.");
            setShowDeleteConfirm(false);
            onClose();

            // Refresh data if callback provided
            if (onRefresh) {
                await onRefresh();
            }
        } catch (error) {
            toast.error(error || "Failed to submit deletion request");
            console.error("Delete account error:", error);
        }
    };

    const handleCancelDelete = () => {
        setShowDeleteConfirm(false);
    };

    const handleUpdateSubmit = async (formData) => {
        try {
            // Dispatch Redux action to update profile
            await dispatch(
                updateOwnProfile({
                    userId: displayUser.id,
                    profileData: formData
                })
            ).unwrap(); // unwrap() to get result or throw error

            toast.success("Update user successfully!");

            // Refresh data if callback provided
            if (onRefresh) {
                await onRefresh();
            }

            // Close modal completely
            setIsSelfUpdateOpen(false);
            onClose();
        } catch (error) {
            toast.error(error || "Failed to update profile!");
            console.error("Update profile error:", error);
        }
    };

    // integrated update form via AnimatePresence below

    return (
        <>
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
                        user={displayUser}
                        statusColor={getStatusColor(displayUser.isActive)}
                        statusText={getStatusText(displayUser.isActive)}
                    />
                </div>

                <AnimatePresence mode="wait">
                    {isResetPassWordOpen ? (
                        <Motion.div
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
                        </Motion.div>
                    ) : isSelfUpdateOpen ? (
                        <Motion.div
                            key="update"
                            initial={{ opacity: 0, x: 40 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -40 }}
                            transition={{ duration: 0.3, ease: "easeInOut" }}
                            className="w-full flex justify-center items-center"
                        >
                            <div style={{ width: "100%", maxWidth: "520px", padding: "16px 30px", boxSizing: "border-box" }}>
                                <UpdateSelfForm
                                    user={displayUser}
                                    onCancel={() => setIsSelfUpdateOpen(false)}
                                    onSubmit={handleUpdateSubmit}
                                />
                            </div>
                        </Motion.div>
                    ) : (
                        <Motion.div
                            key="info"
                            initial={{ opacity: 0, x: -40 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -40 }}
                            transition={{ duration: 0.3, ease: "easeInOut" }}
                            className="w-full"
                        >
                            <RightPanel
                                propUser={displayUser}
                                formatDate={formatDate}
                                getGenderText={getGenderText}
                                setIsResetPassWordOpen={setIsResetPassWordOpen}
                                onOpenUpdate={() => setIsSelfUpdateOpen(true)}
                                onDeleteAccount={handleDeleteAccount}
                            />
                        </Motion.div>
                    )}

                    {/* Update form now integrated with animation */}
                </AnimatePresence>

                {/* Close Button */}
                <button
                    onClick={isResetPassWordOpen ? () => setIsResetPassWordOpen(false) : isSelfUpdateOpen ? () => setIsSelfUpdateOpen(false) : onClose}
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

            {/* Delete Confirmation Modal */}
            {showDeleteConfirm && (
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
                        zIndex: 10000,
                    }}
                    onClick={handleCancelDelete}
                >
                    <Motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        transition={{ duration: 0.2 }}
                        style={{
                            backgroundColor: "white",
                            borderRadius: "12px",
                            padding: "30px",
                            maxWidth: "400px",
                            width: "90%",
                            boxShadow: "0 8px 32px rgba(0,0,0,0.2)"
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h3 style={{
                            color: "#ff5a5f",
                            marginBottom: "15px",
                            fontSize: "20px",
                            fontWeight: "bold"
                        }}>
                            Confirm Delete Account
                        </h3>
                        <p style={{
                            marginBottom: "20px",
                            color: "#333",
                            fontSize: "14px",
                            lineHeight: "1.6"
                        }}>
                            Are you sure you want to delete your account?
                        </p>
                        <p style={{
                            marginBottom: "25px",
                            color: "#666",
                            fontSize: "13px",
                            lineHeight: "1.6",
                            padding: "12px",
                            backgroundColor: "#fff3cd",
                            borderLeft: "4px solid #ffc107",
                            borderRadius: "4px"
                        }}>
                            <strong>⚠️ Important:</strong> You will have <strong>7 days</strong> to continue accessing your account. After <strong>7 days</strong>, your account will be permanently locked and cannot be recovered.
                        </p>
                        <div style={{
                            display: "flex",
                            gap: "10px",
                            justifyContent: "flex-end"
                        }}>
                            <button
                                onClick={handleCancelDelete}
                                style={{
                                    padding: "10px 20px",
                                    backgroundColor: "#6c757d",
                                    color: "white",
                                    border: "none",
                                    borderRadius: "6px",
                                    cursor: "pointer",
                                    fontSize: "14px",
                                    fontWeight: 600
                                }}
                                onMouseEnter={(e) => { e.target.style.backgroundColor = "#5a6268"; }}
                                onMouseLeave={(e) => { e.target.style.backgroundColor = "#6c757d"; }}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleConfirmDelete}
                                style={{
                                    padding: "10px 20px",
                                    backgroundColor: "#dc3545",
                                    color: "white",
                                    border: "none",
                                    borderRadius: "6px",
                                    cursor: "pointer",
                                    fontSize: "14px",
                                    fontWeight: 600
                                }}
                                onMouseEnter={(e) => { e.target.style.backgroundColor = "#c82333"; }}
                                onMouseLeave={(e) => { e.target.style.backgroundColor = "#dc3545"; }}
                            >
                                Delete
                            </button>
                        </div>
                    </Motion.div>
                </div>
            )}
        </>
    );
}

