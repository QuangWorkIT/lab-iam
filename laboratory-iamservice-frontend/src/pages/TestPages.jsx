import React from "react";
import { Card } from "antd";
import MainLayout from "../components/layout/MainLayout";

export default function TestPages() {
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
        </Card>
      </div>
    </MainLayout>
  );
}
