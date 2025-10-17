import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { FaHeartbeat, FaCog, FaSignOutAlt } from "react-icons/fa";
import { logout } from "../../redux/features/userSlice";

export default function Header({ pageTitle }) {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.user);

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to log out?")) {
      dispatch(logout());
    }
  };

  return (
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
        {pageTitle && (
          <>
            <span style={{ margin: "0 10px", color: "#ccc" }}>›</span>
            <span style={{ color: "#ff5a5f" }}>{pageTitle}</span>
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
          <span style={{ marginRight: "5px", color: "#888" }}>Welcome, </span>
          <span style={{ fontWeight: "bold", color: "#ff5a5f" }}>
            [{user?.name || "User"}]
          </span>
        </div>
        <div style={{ display: "flex", gap: "15px" }}>
          <FaCog
            style={{ color: "#888", fontSize: "18px", cursor: "pointer" }}
            title="Settings"
          />
          <FaSignOutAlt
            style={{ color: "#888", fontSize: "18px", cursor: "pointer" }}
            title="Logout"
            onClick={handleLogout}
          />
        </div>
      </div>
    </header>
  );
}
