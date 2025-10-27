import React from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";

export default function MainLayout({ children, pageTitle, pageDescription }) {
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
      <Sidebar />

      <div style={{ flex: 1, width: "calc(100% - 60px)" }}>
        <Header pageTitle={pageTitle} />

        <div
          style={{
            padding: "20px 30px",
            width: "100%",
            boxSizing: "border-box",
          }}
        >
          {/* Page header */}
          {pageTitle && (
            <div style={{ marginBottom: "20px", width: "100%" }}>
              <h1
                style={{
                  color: "#fe535b",
                  fontSize: "24px",
                  marginBottom: "10px",
                  textTransform: "uppercase",
                  fontWeight: "bold",
                }}
              >
                {pageTitle}
              </h1>
              {pageDescription && (
                <p style={{ color: "#888" }}>{pageDescription}</p>
              )}
            </div>
          )}

          {/* Page content */}
          {children}
        </div>
      </div>
    </div>
  );
}
