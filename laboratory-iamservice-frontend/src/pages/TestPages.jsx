import React from "react";
import { Button, Card } from "antd";
import { useDispatch, useSelector } from "react-redux";
import { login, logout } from "../redux/features/userSlice";
import api from "../configs/axios.js";
import MainLayout from "../components/layout/MainLayout";
import CountDownTimer from "../components/common/CountDownTimer.jsx";
export default function TestPages() {
  const dispatch = useDispatch();
  const endTime = new Date("2025-11-07T16:16:50.427195200")
  const fetchRoles = async () => {
    try {
      const response = await api.get("/api/roles")
      console.log(response.data)
    } catch (error) {
      console.log("get role failed", error)
    }
  }
  return (
    <MainLayout
      pageTitle="Feature In Development"
      pageDescription="This module is not yet available for your role."
    >
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "70vh",
          flexDirection: "column",
        }}
      >
        <Card
          style={{
            width: "400px",
            textAlign: "center",
            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
            padding: "20px",
            borderRadius: "8px",
          }}
        >
          <h2
            style={{
              color: "#fe535b",
              marginBottom: "10px",
              fontWeight: "bold",
            }}
          >
            🚧 Feature In Development
          </h2>
          <p style={{ color: "#555" }}>
            The feature you’re trying to access is currently under construction.
            Please check back later or contact an administrator for more info.
          </p>

          <Button onClick={() => fetchRoles()}>Get roles</Button>
        </Card>

        <CountDownTimer endTime={endTime}/>

      </div>
    </MainLayout>
  );
}
