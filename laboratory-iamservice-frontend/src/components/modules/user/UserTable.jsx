import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { FaPlus } from "react-icons/fa";
import SearchBar from "../../common/SearchBar";
import Pagination from "../../common/Pagination";
import StatusBadge from "../../common/StatusBadge";
import UserBadge from "./UserBadge";
import UserActionButtons from "./UserActionButtons";
import { formatDate, truncateId } from "../../../utils/formatter";
import { fetchRolesForUser } from "../../../redux/features/userManagementSlice";

export default function UserTable({
  users,
  onSearch,
  onDelete,
  onPageChange,
  onPageSizeChange,
  onView,
  onEdit,
  onAdd,
  currentPage = 0,
  totalPages = 1,
  totalElements = 0,
  pageSize = 10,
  searchParams = {},
  isSearching = false,
}) {
  const [filteredUsers, setFilteredUsers] = useState(users);

  // Fetch roles for role filter options (moved from previous wrapper)
  const dispatch = useDispatch();
  const { roles } = useSelector((state) => state.users || {});
  useEffect(() => {
    dispatch(fetchRolesForUser());
  }, [dispatch]);

  const roleOptions = useMemo(() => {
    if (roles && roles.length > 0) return roles;
    return [
      { code: "ADMIN", name: "Administrator" },
      { code: "MANAGER", name: "Manager" },
      { code: "LAB_USER", name: "Lab User" },
      { code: "SERVICE_USER", name: "Service User" },
      { code: "GUEST", name: "Guest" },
    ];
  }, [roles]);

  useEffect(() => {
    setFilteredUsers(users);
  }, [users]);

  const handleSearch = useCallback(
    (keyword, fromDate, toDate, roleFilter) => {
      if (onSearch) {
        onSearch(keyword, fromDate, toDate, roleFilter);
      } else {
        // Local filtering if no callback provided
        const filtered = users.filter((user) => {
          const matchKeyword =
            user.name.toLowerCase().includes(keyword) ||
            user.email.toLowerCase().includes(keyword) ||
            (user.role && user.role.toLowerCase().includes(keyword));

          const matchDate =
            (!fromDate || new Date(user.createdAt) >= new Date(fromDate)) &&
            (!toDate || new Date(user.createdAt) <= new Date(toDate));

          const matchRole = !roleFilter || user.role === roleFilter;

          return matchKeyword && matchDate && matchRole;
        });
        setFilteredUsers(filtered);
      }
    },
    [onSearch, users]
  );

  // Chuẩn hóa trạng thái active từ nhiều kiểu dữ liệu trả về
  const normalizeActive = useCallback((user) => {
    if (user && typeof user.isActive === "boolean") return user.isActive;
    if (user && typeof user.is_active === "boolean") return user.is_active; // phòng khi API trả snake_case
    if (user && typeof user.inactive === "boolean") return !user.inactive;
    if (user && typeof user.status === "string")
      return user.status.toLowerCase() === "active";
    return true; // Mặc định là active nếu không có thông tin
  }, []);

  // Memoize users list để tránh re-render không cần thiết
  const usersToRender = useMemo(() => {
    return filteredUsers.length > 0 ? filteredUsers : users;
  }, [filteredUsers, users]);

  return (
    <div className="user-table-container" style={{ width: "100%" }}>
      <style>
        {`
                    @keyframes spin {
                        0% { transform: rotate(0deg); }
                        100% { transform: rotate(360deg); }
                    }
                    @keyframes fadeIn {
                        0% { opacity: 0; }
                        100% { opacity: 1; }
                    }
                `}
      </style>
      {/* Toolbar & Search */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "15px",
          width: "100%",
        }}
      >
        <SearchBar
          onSearch={handleSearch}
          initialKeyword={searchParams.keyword || ""}
          initialFromDate={searchParams.fromDate || ""}
          initialToDate={searchParams.toDate || ""}
          initialRoleFilter={searchParams.roleFilter || ""}
          roleOptions={roleOptions}
          placeholder="Search by name, email..."
          allRolesLabel="All Roles"
          autoSearchOnRoleChange={true}
        />

        <div className="add-new-button">
          <button
            style={{
              backgroundColor: "#ff5a5f",
              color: "white",
              border: "none",
              borderRadius: "4px",
              padding: "8px 15px",
              fontWeight: "bold",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              fontSize: "14px",
            }}
            onClick={() => (onAdd ? onAdd() : console.log("Add new user"))}
          >
            <FaPlus style={{ marginRight: "5px" }} />
            Add New User
          </button>
        </div>
      </div>

      {/* Bảng users */}
      <div style={{ width: "100%", overflowX: "auto", position: "relative" }}>
        {/* Loading overlay */}
        {isSearching && (
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: "rgba(255, 255, 255, 0.9)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 10,
              borderRadius: "4px",
              animation: "fadeIn 0.2s ease-in-out",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                //color: "#888",
                fontSize: "13px",
                fontWeight: "500",
              }}
            >
              <div
                style={{
                  width: "16px",
                  height: "16px",
                  border: "2px solid #e0e0e0",
                  borderTop: "2px solid #4CAF50",
                  borderRadius: "50%",
                  animation: "spin 0.8s linear infinite",
                }}
              />
              Searching...
            </div>
          </div>
        )}
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
            borderRadius: "4px",
            overflow: "hidden",
            minWidth: "800px",
          }}
        >
          <thead>
            <tr style={{ backgroundColor: "#fe535b" }}>
              <th
                style={{
                  padding: "12px 15px 12px 18px",
                  textAlign: "left",
                  color: "white",
                  fontWeight: "600",
                  fontSize: "14px",
                  minWidth: "80px",
                  whiteSpace: "nowrap",
                  verticalAlign: "middle",
                }}
              >
                ID
              </th>
              <th
                style={{
                  padding: "12px 15px 12px 18px",
                  textAlign: "left",
                  color: "white",
                  fontWeight: "600",
                  fontSize: "14px",
                  minWidth: "160px",
                  whiteSpace: "nowrap",
                  verticalAlign: "middle",
                }}
              >
                Name
              </th>
              <th
                style={{
                  padding: "12px 15px 12px 18px",
                  textAlign: "left",
                  color: "white",
                  fontWeight: "600",
                  fontSize: "14px",
                  minWidth: "160px",
                  whiteSpace: "nowrap",
                  verticalAlign: "middle",
                }}
              >
                Email
              </th>
              <th
                style={{
                  padding: "12px 15px 12px 18px",
                  textAlign: "left",
                  color: "white",
                  fontWeight: "600",
                  fontSize: "14px",
                  minWidth: "120px",
                  whiteSpace: "nowrap",
                  verticalAlign: "middle",
                }}
              >
                Role
              </th>
              <th
                style={{
                  padding: "12px 12px",
                  textAlign: "left",
                  color: "white",
                  fontWeight: "600",
                  fontSize: "14px",
                  minWidth: "120px",
                  whiteSpace: "nowrap",
                  verticalAlign: "middle",
                }}
              >
                Created Date
              </th>
              <th
                style={{
                  padding: "12px 15px 12px 16px",
                  textAlign: "left",
                  color: "white",
                  fontWeight: "600",
                  fontSize: "14px",
                }}
              >
                Status
              </th>
              <th
                style={{
                  padding: "12px 15px",
                  textAlign: "center",
                  color: "white",
                  fontWeight: "600",
                  fontSize: "14px",
                }}
              >
                Action
              </th>
            </tr>
          </thead>
          <tbody>
            {usersToRender.length === 0 ? (
              <tr>
                <td
                  colSpan={8}
                  style={{
                    textAlign: "center",
                    padding: "60px 20px",
                    backgroundColor: "#fafafa",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: "16px",
                    }}
                  >
                    <div
                      style={{
                        width: "80px",
                        height: "80px",
                        borderRadius: "50%",
                        backgroundColor: "#f0f0f0",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "32px",
                        color: "#ccc",
                      }}
                    >
                      👥
                    </div>
                    <div>
                      <h3
                        style={{
                          margin: "0 0 8px 0",
                          fontSize: "18px",
                          fontWeight: "600",
                          color: "white",
                        }}
                      >
                        No Users Found
                      </h3>
                      <p
                        style={{
                          margin: "0",
                          fontSize: "14px",
                          color: "#888",
                          maxWidth: "300px",
                        }}
                      >
                        {users.length === 0
                          ? "There are no users in the system yet. Click 'Add New User' to create the first user."
                          : "No users match your current search criteria. Try adjusting your filters."}
                      </p>
                    </div>
                    {users.length === 0 && (
                      <button
                        onClick={() => onAdd && onAdd()}
                        style={{
                          backgroundColor: "#ff5a5f",
                          color: "white",
                          border: "none",
                          borderRadius: "6px",
                          padding: "10px 20px",
                          fontSize: "14px",
                          fontWeight: "500",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                        }}
                      >
                        <FaPlus />
                        Add First User
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ) : (
              usersToRender.map((user) => (
                <tr
                  key={user.id}
                  style={{
                    backgroundColor: "#fff",
                  }}
                >
                  <td
                    style={{
                      padding: "12px 15px",
                      fontWeight: "500",
                      color: "#333",
                    }}
                    title={user.id}
                  >
                    {truncateId(user.id)}
                  </td>
                  <td
                    style={{
                      padding: "12px 15px",
                      fontWeight: "500",
                      color: "#333",
                    }}
                  >
                    {user.name}
                  </td>
                  <td
                    style={{
                      padding: "12px 15px",
                      color: "#555",
                    }}
                  >
                    {user.email}
                  </td>
                  <td
                    style={{
                      padding: "12px 15px",
                    }}
                  >
                    <UserBadge roleName={user.role} />
                  </td>
                  <td
                    style={{
                      padding: "12px 15px",
                      color: "#555",
                    }}
                  >
                    {formatDate(user.createdAt)}
                  </td>
                  <td
                    style={{
                      padding: "12px 15px",
                      color: "#555",
                    }}
                  >
                    <StatusBadge active={normalizeActive(user)} />
                  </td>
                  <td
                    style={{
                      padding: "12px 15px",
                    }}
                  >
                    <UserActionButtons
                      user={user}
                      onView={onView}
                      onEdit={onEdit}
                      onDelete={onDelete}
                    />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Phần pagination */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalElements={totalElements}
        pageSize={pageSize}
        onPageChange={onPageChange}
        onPageSizeChange={onPageSizeChange}
      />
    </div>
  );
}
