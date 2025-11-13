import React, { useState, useEffect, useMemo } from "react";
import { FaPlus } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchUsers,
  createUser,
  updateUserByAdmin,
  fetchRolesForUser,
  fetchUserById,
  deleteUserByAdmin,
} from "../../redux/features/userManagementSlice";
import UserTable from "../../components/modules/user/UserTable";
import AddUserModal from "../../components/modules/user/AddUserModal";
import UserDetailModal from "../../components/common/UserDetailModal";
import UpdateUserModal from "../../components/modules/user/UpdateUserModal";
import UserRoleChart from "../../components/modules/user/UserRoleChart";
import MainLayout from "../../components/layout/MainLayout";
import { toast } from "react-toastify";
import { motion as Motion, AnimatePresence } from "motion/react";

export default function UserList() {
  //Redux hooks
  const dispatch = useDispatch();
  const { users, loading, error, totalPages, totalElements, roles } =
    useSelector((state) => state.users);

  // ✅ Lấy privileges từ Redux store (giống RoleList)
  const userPrivileges = useSelector(
    (state) => state.user?.userInfo?.privileges || [],
    (prev, next) => JSON.stringify(prev) === JSON.stringify(next)
  );

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [viewingUser, setViewingUser] = useState(null);
  const [editingUser, setEditingUser] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [searchTimeout, setSearchTimeout] = useState(null);
  const [chartRefreshTrigger, setChartRefreshTrigger] = useState(0);

  // Local state for search and filter params
  const [searchParams, setSearchParams] = useState({
    keyword: "",
    fromDate: "",
    toDate: "",
    roleFilter: "",
    page: 0,
    size: 10,
    sortBy: "name",
    sortDir: "asc",
  });

  // ✅ Parse privileges (giống RoleList)
  const parsePrivileges = (privs) => {
    if (!privs) return [];
    if (Array.isArray(privs)) return privs;
    if (typeof privs === "string") {
      return privs
        .split(",")
        .map((p) => p.trim())
        .filter((p) => p.length > 0);
    }
    return [];
  };

  const privilegesArray = useMemo(
    () => parsePrivileges(userPrivileges),
    [userPrivileges]
  );

  const hasPrivilege = (privilegeName) => {
    if (!privilegesArray) return false;
    return privilegesArray.includes(privilegeName);
  };

  // ✅ Định nghĩa các quyền (giống RoleList)
  const canViewUser = hasPrivilege("VIEW_USER");
  const canCreateUser = hasPrivilege("CREATE_USER");
  const canModifyUser = hasPrivilege("MODIFY_USER");
  const canDeleteUser = hasPrivilege("DELETE_USER");

  // Fetch roles when component mounts
  useEffect(() => {
    dispatch(fetchRolesForUser());
  }, [dispatch]);

  // Fetch users when component mounts or search params change
  useEffect(() => {
    const fetchData = async () => {
      try {
        await dispatch(fetchUsers(searchParams));
      } finally {
        if (searchTimeout) {
          clearTimeout(searchTimeout);
          setSearchTimeout(null);
        }
        setIsSearching(false);
      }
    };
    fetchData();
  }, [dispatch, searchParams]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeout) {
        clearTimeout(searchTimeout);
      }
    };
  }, [searchTimeout]);

  // Handlers for UserTable
  const handleSearch = async (keyword, fromDate, toDate, roleFilter) => {
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }

    const timeout = setTimeout(() => {
      setIsSearching(true);
    }, 150);

    setSearchTimeout(timeout);

    setSearchParams((prev) => ({
      ...prev,
      keyword,
      fromDate,
      toDate,
      roleFilter,
      page: 0,
    }));
  };

  const handlePageChange = (newPage) => {
    setSearchParams((prev) => ({
      ...prev,
      page: newPage,
    }));
  };

  const handlePageSizeChange = (newSize) => {
    setSearchParams((prev) => ({
      ...prev,
      size: newSize,
      page: 0,
    }));
  };

  const handleViewUser = (user) => {
    // ✅ Kiểm tra quyền VIEW_USER
    if (!canViewUser) {
      toast.error("You don't have permission to view user details");
      return;
    }
    setViewingUser(user);
    setIsDetailModalOpen(true);
  };

  const handleAddUser = () => {
    // ✅ Kiểm tra quyền CREATE_USER
    if (!canCreateUser) {
      toast.error("You don't have permission to create users");
      return;
    }
    setIsAddModalOpen(true);
  };

  const handleEditUser = async (user) => {
    // ✅ Kiểm tra quyền MODIFY_USER
    if (!canModifyUser) {
      toast.error("You don't have permission to modify users");
      return;
    }

    try {
      const result = await dispatch(fetchUserById(user.id)).unwrap();
      setEditingUser(result);
      setIsUpdateModalOpen(true);
    } catch (error) {
      toast.error("Failed to load user details");
    }
  };

  const handleDeleteUser = async (userId) => {
    // ✅ Kiểm tra quyền DELETE_USER
    if (!canDeleteUser) {
      toast.error("You don't have permission to delete users");
      return;
    }

    try {

      const result = await dispatch(deleteUserByAdmin(userId)).unwrap();

      toast.success("User deleted successfully!");

      await dispatch(fetchUsers(searchParams));
      setChartRefreshTrigger((prev) => prev + 1);
    } catch (error) {

      let errorMessage = "Failed to delete user!";
      if (typeof error === "string") {
        errorMessage = error;
      } else if (error.message) {
        errorMessage = error.message;
      }

      toast.error(errorMessage);
    }
  };

  const handleSaveNewUser = async (userData) => {
    // ✅ Kiểm tra quyền CREATE_USER
    if (!canCreateUser) {
      toast.error("You don't have permission to create users");
      return;
    }

    try {
      await dispatch(createUser(userData)).unwrap();
      setIsAddModalOpen(false);
      await dispatch(fetchUsers(searchParams));
      setChartRefreshTrigger((prev) => prev + 1);
      toast.success("Create user successfully!");
    } catch (error) {
      toast.error(error?.message || "Failed to create user!");
    }
  };

  const handleRefreshUser = () => {
    if (viewingUser) {
      dispatch(fetchUsers(searchParams));
    }
  };

  const handleUpdateUser = async (userData) => {
    // ✅ Kiểm tra quyền MODIFY_USER
    if (!canModifyUser) {
      toast.error("You don't have permission to modify users");
      return;
    }

    try {
      await dispatch(
        updateUserByAdmin({
          userId: editingUser.id,
          userData: userData,
        })
      ).unwrap();

      toast.success("User updated successfully!");
      setIsUpdateModalOpen(false);
      setEditingUser(null);

      await dispatch(fetchUsers(searchParams));
      setChartRefreshTrigger((prev) => prev + 1);
    } catch (error) {
      toast.error(error || "Failed to update user!");
    }
  };

  return (
    <MainLayout
      pageTitle="USER MANAGEMENT"
      pageDescription="Manage user accounts"
    >
      {/* Add responsive styles */}
      <style>
        {`
          .user-list-container {
            display: grid;
            grid-template-columns: 1fr 400px;
            gap: 20px;
            width: 100%;
            align-items: start;
          }
          
          @media (max-width: 1400px) {
            .user-list-container {
              grid-template-columns: 1fr 350px;
            }
          }
          
          @media (max-width: 1200px) {
            .user-list-container {
              grid-template-columns: 1fr;
            }
          }
        `}
      </style>

      <div className="user-list-container">
        {/* Left: User Table */}
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
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: "20px",
              gap: 12,
            }}
          >
            <h2
              style={{
                fontSize: "18px",
                margin: 0,
                color: "#ff5a5f",
                fontWeight: "600",
              }}
            >
              User Lists
            </h2>
            {/* ✅ Chỉ hiển thị nút Add nếu có quyền CREATE_USER */}
            {canCreateUser && (
              <button
                type="button"
                onClick={handleAddUser}
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
                  gap: 6,
                }}
              >
                <FaPlus />
                Add New User
              </button>
            )}
          </div>
          {loading && !isSearching ? (
            <div style={{ textAlign: "center", padding: "20px" }}>
              Loading...
            </div>
          ) : error ? (
            <div style={{ color: "red", textAlign: "center", padding: "20px" }}>
              Error: {error}
            </div>
          ) : (
            <UserTable
              users={users}
              onSearch={handleSearch}
              onPageChange={handlePageChange}
              onPageSizeChange={handlePageSizeChange}
              onView={handleViewUser}
              onEdit={handleEditUser}
              onDelete={handleDeleteUser}
              onAdd={handleAddUser}
              currentPage={searchParams.page}
              totalPages={totalPages}
              totalElements={totalElements}
              pageSize={searchParams.size}
              searchParams={searchParams}
              isSearching={isSearching}
              // ✅ Truyền quyền xuống UserTable (giống RoleTable)
              canViewUser={canViewUser}
              canModifyUser={canModifyUser}
              canDeleteUser={canDeleteUser}
            />
          )}
        </div>

        {/* Right: User Role Chart */}
        <UserRoleChart refreshTrigger={chartRefreshTrigger} />
      </div>

      {/* ✅ Chỉ render modal nếu có quyền CREATE_USER */}
      {canCreateUser && (
        <AddUserModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onSave={handleSaveNewUser}
        />
      )}

      {/* ✅ Chỉ render modal nếu có quyền MODIFY_USER */}
      {canModifyUser && (
        <UpdateUserModal
          isOpen={isUpdateModalOpen}
          user={editingUser}
          roles={roles}
          onClose={() => {
            setIsUpdateModalOpen(false);
            setEditingUser(null);
          }}
          onSubmit={handleUpdateUser}
        />
      )}

      <AnimatePresence>
        {isDetailModalOpen && (
          <Motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="fixed inset-0 bg-black/80 flex items-center justify-center z-[1000]"
          >
            <Motion.div
              key="modal"
              initial={{ scale: 0.9, opacity: 0, y: 40 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 40 }}
              transition={{ duration: 0.25, ease: "easeInOut" }}
              className="relative"
            >
              <UserDetailModal
                user={viewingUser}
                isOpen={isDetailModalOpen}
                onClose={() => setIsDetailModalOpen(false)}
                onRefresh={handleRefreshUser}
              />
            </Motion.div>
          </Motion.div>
        )}
      </AnimatePresence>
    </MainLayout>
  );
}
