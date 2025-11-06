import React, { useState, useEffect } from "react";
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
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [viewingUser, setViewingUser] = useState(null);
  const [editingUser, setEditingUser] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [searchTimeout, setSearchTimeout] = useState(null);

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
        // Clear timeout and reset loading state
        if (searchTimeout) {
          clearTimeout(searchTimeout);
          setSearchTimeout(null);
        }
        setIsSearching(false);
      }
    };
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    // Clear existing timeout
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }

    // Set loading state after a small delay to avoid flicker for fast searches
    const timeout = setTimeout(() => {
      setIsSearching(true);
    }, 150); // 150ms delay

    setSearchTimeout(timeout);

    setSearchParams((prev) => ({
      ...prev,
      keyword,
      fromDate,
      toDate,
      roleFilter,
      page: 0, // Reset về trang đầu khi tìm kiếm
    }));
    // Loading state sẽ được reset khi fetchUsers hoàn thành
  };

  //Handler cho phân trang
  const handlePageChange = (newPage) => {
    setSearchParams((prev) => ({
      ...prev,
      page: newPage,
    }));
  };

  //Handler cho thay đổi số items mỗi trang
  const handlePageSizeChange = (newSize) => {
    setSearchParams((prev) => ({
      ...prev,
      size: newSize,
      page: 0, // Reset về trang đầu khi thay đổi page size
    }));
  };

  // Handlers cho các action buttons
  const handleViewUser = (user) => {
    setViewingUser(user);
    setIsDetailModalOpen(true);
  };

  const handleAddUser = () => {
    setIsAddModalOpen(true);
  };

  const handleEditUser = async (user) => {
    try {
      // Fetch full user details including identityNumber
      const result = await dispatch(fetchUserById(user.id)).unwrap();
      console.log("Fetched user detail:", result);
      setEditingUser(result);
      setIsUpdateModalOpen(true);
    } catch (error) {
      console.error("Failed to fetch user details:", error);
      toast.error("Failed to load user details");
    }
  };

  const handleDeleteUser = async (userId) => {
    try {
      console.log("=== DELETE USER DEBUG ===");
      console.log("User ID to delete:", userId);
      console.log("User ID type:", typeof userId);

      const result = await dispatch(deleteUserByAdmin(userId)).unwrap();
      console.log("Delete result:", result);

      toast.success("User deleted successfully!");

      // Refresh lại danh sách users sau khi xóa
      await dispatch(fetchUsers(searchParams));
    } catch (error) {
      console.error("=== DELETE USER ERROR ===");
      console.error("Full error object:", error);
      console.error("Error message:", error.message);
      console.error("Error response:", error.response);

      // Show detailed error message
      let errorMessage = "Failed to delete user!";
      if (typeof error === 'string') {
        errorMessage = error;
      } else if (error.message) {
        errorMessage = error.message;
      }

      toast.error(errorMessage);
    }
  };

  // Handler cho việc lưu user từ AddUserModal
  const handleSaveNewUser = async (userData) => {
    await dispatch(createUser(userData)).unwrap();
    setIsAddModalOpen(false);
    dispatch(fetchUsers(searchParams));
    toast.success("Create user successfully!");
  };

  // Handler for refresh user detail
  const handleRefreshUser = () => {
    if (viewingUser) {
      dispatch(fetchUsers(searchParams));
    }
  };

  // Handler for update user
  const handleUpdateUser = async (userData) => {
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

      // Refresh user list
      dispatch(fetchUsers(searchParams));
    } catch (error) {
      toast.error(error || "Failed to update user!");
      console.error("Update user error:", error);
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
            />
          )}
        </div>

        {/* Right: User Role Chart */}
        <UserRoleChart users={users} />
      </div>
      <AddUserModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSave={handleSaveNewUser}
      />

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
