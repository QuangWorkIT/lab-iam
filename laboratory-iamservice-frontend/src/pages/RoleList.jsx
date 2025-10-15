import React, { useState } from "react";
import RoleTable from "../components/RoleTable";
import {
  FaHome,
  FaUsers,
  FaFlask,
  FaTools,
  FaShieldAlt,
  FaCalendarAlt,
  FaChartLine,
  FaBars,
  FaCog,
  FaHeartbeat,
} from "react-icons/fa";

export default function RoleList() {
  const [roles, setRoles] = useState([
    {
      id: "ADMIN",
      name: "Administrator",
      description: "Full access to all system features",
      privileges: "CREATE, READ, UPDATE, DELETE, MANAGE_USERS",
      createdAt: "2025-09-01T08:30:00",
      lastUpdateAt: "2025-10-10T14:22:33",
      isActive: "Yes",
    },
    {
      id: "MGR",
      name: "Lab Manager",
      description: "Manage department resources and staff",
      privileges: "CREATE, READ, UPDATE, MANAGE_STAFF",
      createdAt: "2025-09-05T10:15:00",
      lastUpdateAt: "2025-10-05T09:45:21",
      isActive: "Yes",
    },
    {
      id: "STAFF",
      name: "Service User",
      description: "Regular staff access to basic features",
      privileges: "READ, CREATE",
      createdAt: "2025-09-10T13:20:00",
      lastUpdateAt: "2025-09-10T13:20:00",
      isActive: "Yes",
    },
    {
      id: "GUEST",
      name: "Lab User",
      description: "Limited access to view-only features",
      privileges: "READ",
      createdAt: "2025-09-15T09:00:00",
      lastUpdateAt: "2025-10-01T16:05:12",
      isActive: "Yes",
    },
  ]);

  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        backgroundColor: "#f8f9fa",
        width: "100%",
        maxWidth: "100%",
        overflowX: "hidden",
      }}
    >
      {/* Sidebar */}
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
            padding: "10px",
            borderBottom: "1px solid rgba(255,255,255,0.2)",
            width: "100%",
            display: "flex",
            justifyContent: "center",
            marginBottom: "20px",
          }}
        >
          <FaBars style={{ fontSize: "24px" }} />
        </div>

        <SidebarIcon icon={<FaHome size={20} />} active={false} />
        <SidebarIcon icon={<FaUsers size={20} />} active={true} />
        <SidebarIcon icon={<FaFlask size={20} />} active={false} />
        <SidebarIcon icon={<FaTools size={20} />} active={false} />
        <SidebarIcon icon={<FaShieldAlt size={20} />} active={false} />
        <SidebarIcon icon={<FaCalendarAlt size={20} />} active={false} />
        <SidebarIcon icon={<FaChartLine size={20} />} active={false} />
      </div>

      {/* Main content */}
      <div style={{ flex: 1, marginLeft: "60px", width: "calc(100% - 60px)" }}>
        {/* Header */}
        <header
          style={{
            borderBottom: "1px solid #ddd",
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
                  color: "#ff5a5f",
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
            <span style={{ margin: "0 10px", color: "#ccc" }}>›</span>
            <span style={{ color: "#ff5a5f" }}>User & Role Management</span>
          </div>

          <div style={{ display: "flex", alignItems: "center" }}>
            <div
              style={{
                marginRight: "15px",
                display: "flex",
                alignItems: "center",
              }}
            >
              <span style={{ marginRight: "5px", color: "#888" }}>
                Welcome,{" "}
              </span>
              <span style={{ fontWeight: "bold", color: "#ff5a5f" }}>
                [Administrator]
              </span>
            </div>
            <FaCog
              style={{ color: "#888", fontSize: "20px", cursor: "pointer" }}
            />
          </div>
        </header>

        {/* Page content */}
        <div
          style={{
            padding: "20px 30px",
            width: "100%",
            boxSizing: "border-box",
          }}
        >
          <div style={{ marginBottom: "20px", width: "100%" }}>
            <h1
              style={{
                color: "#ff5a5f",
                fontSize: "24px",
                marginBottom: "10px",
                textTransform: "uppercase",
                fontWeight: "bold",
              }}
            >
              USER & ROLE MANAGEMENT
            </h1>
            <p style={{ color: "#888" }}>Manage user accounts and user roles</p>
          </div>

          <div
            style={{
              backgroundColor: "white",
              padding: "20px",
              borderRadius: "5px",
              boxShadow: "0 2px 4px rgba(0,0,0,0.08)",
              border: "1px solid #eee",
              width: "100%",
              boxSizing: "border-box",
              overflowX: "auto",
            }}
          >
            <h2
              style={{
                fontSize: "18px",
                marginBottom: "20px",
                color: "#ff5a5f",
                fontWeight: "normal",
              }}
            >
              User Roles
            </h2>
            <RoleTable roles={roles} />
          </div>
        </div>
      </div>
    </div>
  );
}

// Component for sidebar icons
function SidebarIcon({ icon, active }) {
  return (
    <div
      style={{
        width: "40px",
        height: "40px",
        borderRadius: "5px",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        margin: "5px 0",
        backgroundColor: active ? "rgba(255,255,255,0.2)" : "transparent",
        cursor: "pointer",
      }}
    >
      {icon}
    </div>
  );
}
