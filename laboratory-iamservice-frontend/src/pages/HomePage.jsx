import { useMemo } from "react";
import { Card } from "antd";
import { ExclamationCircleOutlined } from "@ant-design/icons";
import { useSelector, useDispatch } from "react-redux";
import MainLayout from "../components/layout/MainLayout";

export default function HomePage() {
  const { userInfo } = useSelector((state) => state.user);
  const { userDetail } = useSelector((state) => state.users);


  // Use userDetail if available, fallback to userInfo
  const displayUser = userDetail || userInfo;

  // Calculate remaining days until account deletion
  const deletionInfo = useMemo(() => {
    if (!displayUser?.deletedAt) {
      return null;
    }

    const deletionDate = new Date(displayUser.deletedAt);
    const today = new Date();
    const timeDiff = deletionDate - today;
    const daysRemaining = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));

    return {
      daysRemaining,
      deletionDate: deletionDate.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
    };
  }, [displayUser?.deletedAt]);


  return (
    <MainLayout pageTitle="HOMEPAGE" pageDescription="Start exploring features">
      {/* Account Deletion Warning Banner */}
      {deletionInfo && deletionInfo.daysRemaining > 0 && (
        <div
          style={{
            backgroundColor: "#fff3cd",
            borderLeft: "4px solid #ffc107",
            padding: "16px 20px",
            marginBottom: "20px",
            borderRadius: "6px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <ExclamationCircleOutlined
              style={{
                fontSize: "20px",
                color: "#ffc107",
              }}
            />
            <div>
              <span
                style={{
                  fontSize: "14px",
                  fontWeight: 600,
                  color: "#856404",
                }}
              >
                Your account will be permanently deleted in {deletionInfo.daysRemaining} day{deletionInfo.daysRemaining > 1 ? 's' : ''}
              </span>
              <span
                style={{
                  fontSize: "13px",
                  color: "#856404",
                  marginLeft: "8px",
                }}
              >
                (on {deletionInfo.deletionDate})
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: deletionInfo ? "70vh" : "80vh",
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
          <h2 style={{ color: "#FF5A5A", fontWeight: "bold", fontSize: "18px" }}>
            Good to see you again! 👋
          </h2>
          <p
            style={{
              marginTop: "10px",
              fontSize: "16px",
              color: "#777777",
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
