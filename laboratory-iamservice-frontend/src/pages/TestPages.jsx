import React from "react";
import { Button, Card } from "antd";
import { useDispatch, useSelector } from "react-redux";
import { login, logout } from "../redux/features/userSlice";

export default function TestPages() {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user) || {};

  return (
    <div
      style={{
        height: "100vh",
        width: "100vw",
        background: "linear-gradient(135deg, #f0f9ff, #cbebff)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "2rem",
        justifyContent: "center",
      }}
    >
      <Card
        title="User Information"
        style={{
          width: 350,
          textAlign: "center",
          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
          marginBottom: "2rem",
        }}
      >
        <p>
          <strong>User:</strong> {user.userInfo?.userName || "Guest"}
        </p>
        <p>
          <strong>Token:</strong> {user.token || "None"}
        </p>
        <Button
          type="primary"
          onClick={() =>
            dispatch(
              login({
                token: "fake-token-123",
                userInfo: { name: "Kim", role: "Student" },
              })
            )
          }
          style={{ marginRight: "1rem" }}
        >
          Login (fake)
        </Button>
        <Button danger onClick={() => dispatch(logout())}>
          Logout
        </Button>
      </Card>
    </div>
  );
}
