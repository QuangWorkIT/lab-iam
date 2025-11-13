import React, { useMemo, useEffect, useState } from "react";
import { getRoleColor, formatRoleName } from "../role/RoleBadge";
import api from "../../../configs/axios";

export default function UserRoleChart({ refreshTrigger = 0 }) {
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch toàn bộ users từ API (không qua Redux)
  useEffect(() => {
    const fetchAllUsers = async () => {
      try {
        setLoading(true);
        const response = await api.get("/api/users", {
          params: {
            page: 0,
            size: 10000, // Lấy toàn bộ users
          },
        });

        // Handle response format
        let users = [];
        if (response.data.content && Array.isArray(response.data.content)) {
          users = response.data.content;
        } else if (Array.isArray(response.data)) {
          users = response.data;
        }

        setAllUsers(users);
      } catch (error) {
        console.error("Error fetching users for chart:", error);
        setAllUsers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAllUsers();
  }, [refreshTrigger]);

  // Tính toán số lượng user theo role
  const roleStats = useMemo(() => {
    const stats = {};
    allUsers.forEach((user) => {
      const role = user.roleCode || user.role || "UNKNOWN";
      if (!stats[role]) {
        stats[role] = 0;
      }
      stats[role]++;
    });

    // Convert to array và sort theo số lượng giảm dần
    return Object.entries(stats)
      .map(([role, count]) => ({
        role,
        displayName: formatRoleName(role),
        count,
        color: getRoleColor(role),
      }))
      .sort((a, b) => b.count - a.count);
  }, [allUsers]);

  const maxCount = useMemo(() => {
    return Math.max(...roleStats.map((r) => r.count), 1);
  }, [roleStats]);

  // Tính scale cho trục X (làm tròn lên số đẹp)
  const maxScale = useMemo(() => {
    const max = maxCount;
    // Làm tròn lên bội số của 5
    return Math.ceil(max / 5) * 5;
  }, [maxCount]);

  // Tạo các điểm trên trục X
  const xAxisPoints = useMemo(() => {
    const points = [];
    const step = maxScale / 4; // Chia thành 4 khoảng
    for (let i = 0; i <= 4; i++) {
      points.push(Math.round(step * i));
    }
    return points;
  }, [maxScale]);

  // Loading state
  if (loading) {
    return (
      <div
        style={{
          backgroundColor: "white",
          padding: "20px",
          borderRadius: "8px",
          boxShadow: "0 2px 4px rgba(0,0,0,0.08)",
          border: "1px solid #eee",
          height: "400px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <span style={{ color: "#666" }}>Loading chart...</span>
      </div>
    );
  }

  return (
    <div
      style={{
        backgroundColor: "white",
        padding: "20px",
        borderRadius: "8px",
        boxShadow: "0 2px 4px rgba(0,0,0,0.08)",
        border: "1px solid #eee",
        height: "fit-content",
      }}
    >
      {/* Header */}
      <div
        style={{
          marginBottom: "20px",
          paddingBottom: "15px",
          borderBottom: "2px solid #f5f5f5",
        }}
      >
        <h3
          style={{
            fontSize: "16px",
            fontWeight: "600",
            color: "#666",
            margin: "0 0 12px 0",
            textAlign: "center",
          }}
        >
          User Role Chart
        </h3>

        {/* Legend với chấm tròn */}
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "center",
            gap: "16px",
            marginTop: "12px",
          }}
        >
          {roleStats.map((stat) => (
            <div
              key={stat.role}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                fontSize: "12px",
              }}
            >
              <div
                style={{
                  width: "10px",
                  height: "10px",
                  borderRadius: "50%",
                  backgroundColor: stat.color,
                }}
              />
              <span style={{ color: "#666", fontWeight: "500" }}>
                {stat.displayName}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Chart area */}
      <div
        style={{
          position: "relative",
          paddingBottom: "30px",
        }}
      >
        {/* Y-axis labels (Role names) and bars */}
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {roleStats.map((stat) => {
            const barWidth = (stat.count / maxScale) * 100;
            return (
              <div
                key={stat.role}
                style={{ display: "flex", alignItems: "center" }}
              >
                {/* Role name label */}
                <div
                  style={{
                    width: "70px",
                    textAlign: "right",
                    paddingRight: "10px",
                    fontSize: "13px",
                    fontWeight: "500",
                    color: "#333",
                  }}
                >
                  {stat.displayName}
                </div>

                {/* Bar container with grid lines */}
                <div
                  style={{
                    flex: 1,
                    position: "relative",
                    height: "40px",
                  }}
                >
                  {/* Grid lines */}
                  <div
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      display: "flex",
                      justifyContent: "space-between",
                    }}
                  >
                    {xAxisPoints.map((point, idx) => (
                      <div
                        key={idx}
                        style={{
                          width: "1px",
                          height: "100%",
                          backgroundColor: idx === 0 ? "#ccc" : "#e5e5e5",
                        }}
                      />
                    ))}
                  </div>

                  {/* Bar */}
                  <div
                    style={{
                      position: "relative",
                      width: `${barWidth}%`,
                      height: "100%",
                      backgroundColor: stat.color,
                      transition: "width 0.6s ease-out",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "flex-end",
                      paddingRight: "8px",
                    }}
                  >
                    {/* Count label inside bar */}
                    {barWidth > 15 && (
                      <span
                        style={{
                          fontSize: "12px",
                          fontWeight: "600",
                          color: "white",
                        }}
                      >
                        {stat.count}
                      </span>
                    )}
                  </div>

                  {/* Count label outside bar (if bar too small) */}
                  {barWidth <= 15 && (
                    <span
                      style={{
                        position: "absolute",
                        left: `${barWidth}%`,
                        top: "50%",
                        transform: "translateY(-50%)",
                        marginLeft: "6px",
                        fontSize: "12px",
                        fontWeight: "600",
                        color: stat.color,
                      }}
                    >
                      {stat.count}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* X-axis */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: "80px",
            right: 0,
            display: "flex",
            justifyContent: "space-between",
            paddingTop: "8px",
            borderTop: "2px solid #ccc",
          }}
        >
          {xAxisPoints.map((point, idx) => (
            <div
              key={idx}
              style={{
                fontSize: "12px",
                color: "#666",
                fontWeight: "500",
                minWidth: "20px",
                textAlign:
                  idx === 0
                    ? "left"
                    : idx === xAxisPoints.length - 1
                    ? "right"
                    : "center",
              }}
            >
              {point}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
