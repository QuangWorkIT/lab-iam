import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { FaHeartbeat, FaCog, FaUserCog, FaSignOutAlt, FaCheckCircle, FaExclamationCircle, FaRegDotCircle } from "react-icons/fa";
import { logout } from "../../redux/features/userSlice";
import UserDetailModal from "../common/UserDetailModal";
import { DoubleRightOutlined } from "@ant-design/icons"
import { motion, AnimatePresence } from "motion/react"
import NotificationComponent from "../common/NotificationComponent"
import { Tooltip } from "antd";
import { useNavigate } from "react-router";
import MobileSidebar from "../common/MobileSideBar";
import MobileToggle from "../common/MobileToggle";
import { useSidebarMenu } from "../../hooks/useSideBarMenu";
import { ChevronsRight, Users, LogOut } from "lucide-react";

export default function Header({ pageTitle }) {
  const dispatch = useDispatch();
  const nav = useNavigate()
  const { userInfo } = useSelector((state) => state.user);
  const [isOpen, setIsOpen] = useState(false);
  const displayItems = useSidebarMenu()

  const toggleSideBar = () => {
    setIsOpen(!isOpen);
  };

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

    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isDetailModalOpen]);

  const handleLogout = () => {
    setShowConfirm(true);
  };

  const confirmLogout = () => {
    dispatch(logout());
    setShowConfirm(false);
    nav("/login", { replace: true });
  };

  const closeConfirm = () => setShowConfirm(false);

  // Handler for viewing user detail from settings icon
  const handleViewUserDetail = () => {
    setIsDetailModalOpen(true);
  };


  // Convert userInfo to the format expected by UserDetailModal
  const getUserDetailData = () => {
    if (!userInfo) return null;

    return {
      id: userInfo.id,
      name: userInfo.userName || userInfo.name || "N/A",
      role: userInfo.role || "N/A",
      email: userInfo.email || "N/A",
      identityNumber: userInfo.identityNumber || "N/A",
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
      backgroundColor: "rgba(0, 0, 0, 0.8)",
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
      borderTop: "5px solid #FF5A5A",
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
      backgroundColor: "#FF5A5A",
      color: "#ffffff",
    },
    closeX: {
      position: "absolute",
      top: "8px",
      right: "10px",
      background: "transparent",
      border: "none",
      fontSize: "24px",
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
          height: "60px"
        }}
      >

        <div className="flex">
          <div className="lg:hidden">
            <MobileToggle isOpen={isOpen} onToggle={toggleSideBar} />
            <MobileSidebar isOpen={isOpen} menuItems={displayItems} toggleSideBar={toggleSideBar} />
          </div>
          <div className=" items-center hidden md:flex">
            <div style={{ display: "flex", alignItems: "center" }}>
              <FaHeartbeat
                style={{
                  color: "#FF5A5A",
                  fontSize: "24px",
                  marginRight: "10px",
                }}
              />
              <span
                style={{ color: "black", fontWeight: "bold", fontSize: "16px" }}
              >
                Laboratory Management
              </span>
            </div>
            {pageTitle && (
              <>
                <span style={{ margin: "0 10px", color: "#777777"}}>
                  <ChevronsRight style={{fontSize: "24px"}}/>
                </span>
                <span style={{ color: "#FF5A5A", fontWeight: "bold" }}>{pageTitle}</span>
              </>
            )}
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center" }}>
          <div
            className="md:flex items-center mr-[15px] hidden"
          >
            <span style={{ marginTop: "3px", marginRight: "10px", color: "#777777", cursor: "default", fontSize: "14px" }}>Welcome: </span>
            <span style={{ fontWeight: "bold", color: "black", cursor: "default" }}>
              {userInfo?.userName || "User"}
            </span>
          </div>
          <div style={{ display: "flex", gap: "25px", alignItems: "center" }}>
            <NotificationComponent />
            <Tooltip title={"User details"}>
              <Users
                style={{ color: "#777", fontSize: "24px", cursor: "pointer" }}
                onClick={handleViewUserDetail}
                className="hover:scale-108 transition-all duration-300 ease-in-out"
              />
            </Tooltip>
            <Tooltip title={"Logout"} placement="bottomLeft">
              <LogOut
                style={{ color: "#777", fontSize: "24px", cursor: "pointer" }}
                onClick={handleLogout}
                className="hover:scale-108 transition-all duration-300 ease-in-out"
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
              <FaSignOutAlt style={{ color: "#FF5A5A", fontSize: "24px" }} />
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
                onMouseEnter={e => e.currentTarget.style.backgroundColor = "#FF3A3A"}
                onMouseLeave={e => e.currentTarget.style.backgroundColor = "#FF5A5A"}
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
            className="fixed inset-0 bg-black/80 flex md:items-center justify-center z-[1000]"
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
