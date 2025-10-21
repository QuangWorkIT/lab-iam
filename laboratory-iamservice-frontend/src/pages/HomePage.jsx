import React from "react";
import { Card } from "antd";
import MainLayout from "../components/layout/MainLayout";

export default function HomePage() {

  return (
    <MainLayout pageTitle="HOMEPAGE" pageDescription="Start exploring features">
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "80vh",
          flexDirection: "column",
        }}
      >
        <Card
          style={{
            width: "100%",
            maxWidth: "600px",
            textAlign: "center",
            padding: "40px 20px",
            borderRadius: "10px",
            boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
          }}
        >
          <h2 style={{ color: "#FE535B", fontWeight: "bold", fontSize: "24px" }}>
            Good to see you again! 👋
          </h2>
          <p
            style={{
              marginTop: "10px",
              fontSize: "16px",
              color: "#555",
              lineHeight: "1.5",
            }}
          >
            Please choose one of the available features on the left to get started.
            <br />
            We’re happy to have you back 💖
          </p>
        </Card>
      </div>
    </MainLayout>
  );
}
