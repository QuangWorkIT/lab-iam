import React from "react";
import { useLocation, Link } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  FaHome,
  FaUsers,
  FaFlask,
  FaTools,
  FaShieldAlt,
  FaCalendarAlt,
  FaChartLine,
  FaBars,
  FaUserCog, FaUserCheck
} from "react-icons/fa";

// Inline component
function SidebarIcon({ icon, active, to = "#" }) {
  const iconStyle = {
    width: "40px",
    height: "40px",
    borderRadius: "5px",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    margin: "5px 0",
    backgroundColor: active ? "rgba(255,255,255,0.2)" : "transparent",
    cursor: "pointer",
  };

  if (to === "#") {
    return <div style={iconStyle}>{icon}</div>;
  }

  return (
    <Link to={to} style={{ textDecoration: "none", color: "inherit" }}>
      <div style={iconStyle}>{icon}</div>
    </Link>
  );
}

export default function Sidebar() {
  const location = useLocation();
  const { userInfo } = useSelector((state) => state.user);

  // Demo data - sử dụng dữ liệu giả lập thay vì lấy từ Redux
  // const demoUserRoles = ["ADMIN", "USER"]; // Giả lập quyền admin

  // Kiểm tra quyền truy cập
  const hasAccess = (requiredRoles) => {
    if (!requiredRoles || requiredRoles.length === 0) return true;
    if (!userInfo) return false; // Thêm kiểm tra này
    return requiredRoles.some((role) => userInfo.role.includes(role));
  };

  // Định nghĩa menu items
  const menuItems = [
    { path: "/home", icon: <FaHome size={20} />, roles: [] },
    { path: "/roles", icon: <FaUsers size={20} />, roles: ["ROLE_ADMIN"] },
    { path: "/test", icon: <FaUserCog size={20} />, roles: ["ROLE_ADMIN","ROLE_LAB_MANAGER"] }, // User management
    { path: "/test", icon: <FaUserCheck size={20} />, roles: ["ROLE_ADMIN"] }, // Admin Approval page
    {
      path: "/test",
      icon: <FaFlask size={20} />,
      roles: ["ROLE_ADMIN", "ROLE_LAB_MANAGER"],
    },
    {
      path: "/test",
      icon: <FaTools size={20} />,
      roles: ["ROLE_ADMIN", "ROLE_LAB_MANAGER", "ROLE_TECHNICIAN"],
    },
    { path: "/test", icon: <FaShieldAlt size={20} />, roles: ["ROLE_ADMIN"] },
    {
      path: "/test",
      icon: <FaCalendarAlt size={20} />,
      roles: ["ROLE_LAB_MANAGER"],
    },
    {
      path: "/test",
      icon: <FaChartLine size={20} />,
      roles: ["ROLE_ADMIN", "ROLE_LAB_MANAGER"],
    },
  ];

  return (
    <div
      style={{
        width: "60px",
        backgroundColor: "#ff5a5f",
        color: "white",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        paddingTop: "20px",
        position: "fixed",
        left: 0,
        top: 0,
        bottom: 0,
        zIndex: 100,
      }}
    >
      <div
        style={{
          padding: "6px",
          borderBottom: "1px solid rgba(255,255,255,0.2)",
          width: "100%",
          display: "flex",
          justifyContent: "center",
          marginBottom: "20px",
        }}
      >
        <FaBars style={{ fontSize: "24px" }} />
      </div>

      {menuItems.map(
        (item, index) =>
          hasAccess(item.roles) && (
            <SidebarIcon
              key={index}
              icon={item.icon}
              active={location.pathname === item.path}
              to={item.path}
            />
          )
      )}
    </div>
  );
}
