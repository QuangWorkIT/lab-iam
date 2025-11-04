import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { FaHeartbeat, FaCog, FaSignOutAlt, FaCheckCircle, FaExclamationCircle, FaRegDotCircle } from "react-icons/fa";
import { logout } from "../../redux/features/userSlice";
import UserDetailModal from "../common/UserDetailModal";
import { DoubleRightOutlined } from "@ant-design/icons"
import { motion, AnimatePresence } from "motion/react"
import NotificationDropdown from "../common/NotificationDropdown";
import { Tooltip } from "antd";


export default function Header({ pageTitle }) {
  const dispatch = useDispatch();
  const { userInfo } = useSelector((state) => state.user);
  const notifyItems = [
    {
      key: '1',
      label: 'Success 1',
      icon: <FaCheckCircle color="#52c41a" style={{ fontSize: "14px" }} />
    },
    {
      key: '2',
      label: 'Warning 2',
      icon: <FaExclamationCircle color="#ffcc00" style={{ fontSize: "14px" }}/>
    },
    {
      key: '3',
      label: 'Processing 3',
      icon: <FaRegDotCircle  color="#40a6ce" style={{ fontSize: "14px" }}/>
    },
  ]
  // Confirm modal state
  const [showConfirm, setShowConfirm] = useState(false);
  const confirmBtnRef = useRef(null);

  // User detail modal state
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  // disable scroll when modal open
  useEffect(() => {
    if (isDetailModalOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }

    // Cleanup to restore scroll when component unmounts
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isDetailModalOpen]);

  const handleLogout = () => {
    // Mở popup confirm thay vì window.confirm
    setShowConfirm(true);
  };

  const confirmLogout = () => {
    dispatch(logout());
    setShowConfirm(false);
  };

  const closeConfirm = () => setShowConfirm(false);

  // Handler for viewing user detail from settings icon
  const handleViewUserDetail = () => {
    setIsDetailModalOpen(true);
  };

  // Handler for refresh user detail
  const handleRefreshUser = () => {
    // Can add refresh logic here if needed
    // For now, just refresh the page or fetch user info again
  };

  // Convert userInfo to the format expected by UserDetailModal
  const getUserDetailData = () => {
    if (!userInfo) return null;

    return {
      id: userInfo.id,
      name: userInfo.userName || userInfo.name || "N/A",
      role: userInfo.role || "N/A",
      email: userInfo.email || "N/A",
      identifyNumber: userInfo.identifyNumber || userInfo.identityNumber || "N/A",
      phoneNumber: userInfo.phoneNumber || userInfo.phone || "N/A",
      gender: userInfo.gender || "N/A",
      dateOfBirth: userInfo.dateOfBirth || userInfo.dob || null,
      age: userInfo.age !== undefined ? userInfo.age : null,
      address: userInfo.address || "N/A",
      createdAt: userInfo.createdAt || userInfo.created_at || null,
      isActive: userInfo.isActive || true,
    };
  };

  // Focus nút "Đăng xuất" và hỗ trợ phím Esc để đóng
  useEffect(() => {
    if (showConfirm) {
      confirmBtnRef.current?.focus();
      const onKeyDown = (e) => {
        if (e.key === "Escape") closeConfirm();
      };
      window.addEventListener("keydown", onKeyDown);
      return () => window.removeEventListener("keydown", onKeyDown);
    }
  }, [showConfirm]);

  // Styles cho modal
  const styles = {
    overlay: {
      position: "fixed",
      inset: 0,
      backgroundColor: "rgba(17, 24, 39, 0.45)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 9999,
      padding: "16px",
    },
    modal: {
      position: "relative",
      width: "100%",
      maxWidth: "420px",
      backgroundColor: "#ffffff",
      borderRadius: "12px",
      boxShadow:
        "0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05)",
      padding: "18px 20px",
      borderTop: "5px solid #fe535b",
    },
    titleRow: {
      display: "flex",
      alignItems: "center",
      gap: "10px",
      marginBottom: "6px",
    },
    title: { margin: 0, fontSize: "18px", fontWeight: 700, color: "#111827" },
    text: { margin: "0 0 16px 0", color: "#4b5563", lineHeight: 1.5 },
    actions: { display: "flex", justifyContent: "flex-end", gap: "10px" },
    btnBase: {
      padding: "8px 14px",
      borderRadius: "8px",
      border: "1px solid transparent",
      fontWeight: 600,
      cursor: "pointer",
      fontSize: "14px",
    },
    btnCancel: {
      backgroundColor: "#ffffff",
      borderColor: "#e5e7eb",
      color: "#374151",
    },
    btnDanger: {
      backgroundColor: "#fe535b",
      color: "#ffffff",
    },
    closeX: {
      position: "absolute",
      top: "8px",
      right: "10px",
      background: "transparent",
      border: "none",
      fontSize: "22px",
      color: "#9ca3af",
      cursor: "pointer",
      lineHeight: 1,
    },
  };

  return (
    <>
      <header
        style={{
          borderBottom: "1px solid #e1e7ef",
          padding: "15px 20px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          backgroundColor: "white",
        }}
      >
        <div style={{ display: "flex", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center" }}>
            <FaHeartbeat
              style={{
                color: "#fe535b",
                fontSize: "24px",
                marginRight: "10px",
              }}
            />
            <span
              style={{ color: "black", fontWeight: "bold", fontSize: "18px" }}
            >
              Laboratory Management
            </span>
          </div>
          {pageTitle && (
            <>
              <span style={{ margin: "0 10px", color: "lightgray" }}>
                <DoubleRightOutlined />
              </span>
              <span style={{ color: "#fe535b", fontWeight: "bold" }}>{pageTitle}</span>
            </>
          )}
        </div>

        <div style={{ display: "flex", alignItems: "center" }}>
          <div
            style={{
              marginRight: "15px",
              display: "flex",
              alignItems: "center",
            }}
          >
            <span style={{ marginRight: "5px", color: "#888", cursor: "default" }}>Welcome, </span>
            <span style={{ fontWeight: "bold", color: "#fe535b", cursor: "default" }}>
              [{userInfo?.userName || "User"}]
            </span>
          </div>
          <div style={{ display: "flex", gap: "15px", alignItems: "center" }}>
            <NotificationDropdown  items={notifyItems}/>
            <Tooltip title={"User details"}>
              <FaCog
                style={{ color: "#888", fontSize: "18px", cursor: "pointer" }}
                onClick={handleViewUserDetail}
                className="hover:scale-120 transition-all duration-300 ease-in-out"
              />
            </Tooltip>
            <Tooltip title={"Logout"} placement="bottomLeft">
              <FaSignOutAlt
                style={{ color: "#888", fontSize: "18px", cursor: "pointer" }}
                onClick={handleLogout}
                className="hover:scale-120 transition-all duration-300 ease-in-out"
              />
            </Tooltip>
          </div>
        </div>
      </header>

      {showConfirm && (
        <div style={styles.overlay} onClick={closeConfirm}>
          <div
            style={styles.modal}
            role="dialog"
            aria-modal="true"
            aria-labelledby="logout-title"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              aria-label="Close dialog"
              style={styles.closeX}
              onClick={closeConfirm}
            >
              ×
            </button>

            <div style={styles.titleRow}>
              <FaSignOutAlt style={{ color: "#fe535b", fontSize: "20px" }} />
              <h3 id="logout-title" style={styles.title}>
                Confirm Logout
              </h3>
            </div>

            <p style={styles.text}>Are you sure you want to log out?</p>

            <div style={styles.actions}>
              <button
                style={{ ...styles.btnBase, ...styles.btnCancel }}
                onClick={closeConfirm}
              >
                Cancel
              </button>
              <button
                ref={confirmBtnRef}
                style={{ ...styles.btnBase, ...styles.btnDanger }}
                onClick={confirmLogout}
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}

      {/* User Detail Modal */}
      <AnimatePresence>
        {isDetailModalOpen && (
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="fixed inset-0 bg-black/80 flex items-center justify-center z-[1000]"
          >
            <motion.div
              key="modal"
              initial={{ scale: 0.9, opacity: 0, y: 40 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 40 }}
              transition={{ duration: 0.25, ease: "easeInOut" }}
              className="relative"
            >
              <UserDetailModal
                user={getUserDetailData()}
                isOpen={isDetailModalOpen}
                onClose={() => setIsDetailModalOpen(false)}
                onRefresh={() => { }}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
