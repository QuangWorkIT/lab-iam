import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchUsers,
  createUser,
} from "../../redux/features/userManagementSlice";
import UserTable from "../../components/modules/user/UserTable";
import UserModal from "../../components/modules/user/UserModal";
import AddUserModal from "../../components/modules/user/AddUserModal";
import UserDetailModal from "../../components/common/UserDetailModal";
import MainLayout from "../../components/layout/MainLayout";
import { toast } from "react-toastify";
import { motion, AnimatePresence } from "motion/react"

export default function UserList() {
  //Redux hooks
  const dispatch = useDispatch();
  const { users, loading, error, totalPages, totalElements } = useSelector(
    (state) => state.users
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [viewingUser, setViewingUser] = useState(null);
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

  //Handle cho sort
  const handleSort = (key, direction) => {
    setSearchParams((prev) => ({
      ...prev,
      sortBy: key,
      sortDir: direction,
    }));
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

  const handleEditUser = (user) => {
    setEditingUser(user);
    setIsModalOpen(true);
  };

  // const handleToggleStatus = (user) => {
  //     const action = user.isActive ? "lock" : "unlock";
  //     if (window.confirm(`Are you sure you want to ${action} this user?`)) {
  //         const updatedUserData = {
  //             ...user,
  //             isActive: !user.isActive,
  //         };
  //         dispatch(updateUser({ id: user.id, userData: updatedUserData }))
  //             .unwrap()
  //             .then(() => {
  //                 dispatch(fetchUsers(searchParams));
  //                 alert(`User ${action}ed successfully`);
  //             })
  //             .catch((error) => {
  //                 alert(
  //                     `Failed to ${action} user: ${error?.message ||
  //                     error?.response?.data?.message ||
  //                     "Unknown error"
  //                     }`
  //                 );
  //             })
  //     }
  // };

  // Handler cho việc lưu user (thêm hoặc sửa)
  // const handleSaveUser = (userData) => {
  //     // Nếu đang edit (có editingUser)
  //     if (editingUser) {
  //         dispatch(updateUser({ id: editingUser.id, userData }))
  //             .unwrap()
  //             .then(() => {
  //                 setIsModalOpen(false);
  //                 dispatch(fetchUsers(searchParams));
  //                 alert("User updated successfully!");
  //             })
  //             .catch((error) => {
  //                 alert(
  //                     `Failed to update user: ${error.message || JSON.stringify(error) || "Unknown error"
  //                     }`
  //                 );
  //             });
  //     } else {
  //         // Thêm mới
  //         dispatch(createUser(userData))
  //             .unwrap()
  //             .then(() => {
  //                 setIsModalOpen(false);
  //                 dispatch(fetchUsers(searchParams));
  //                 alert("User created successfully!");
  //             })
  //             .catch((error) => {
  //                 alert(`Failed to create user: ${error}`);
  //             });
  //     }
  // };

  // Handler cho việc lưu user từ AddUserModal
  const handleSaveNewUser = async (userData) => {
    await dispatch(createUser(userData)).unwrap();
    setIsAddModalOpen(false);
    dispatch(fetchUsers(searchParams));
    toast.success("User created successfully!");
  };

  // Handler for refresh user detail
  const handleRefreshUser = () => {
    if (viewingUser) {
      dispatch(fetchUsers(searchParams));
    }
  };

  return (
    <MainLayout
      pageTitle="USER MANAGEMENT"
      pageDescription="Manage user accounts"
    >
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
        <h2
          style={{
            fontSize: "18px",
            marginBottom: "20px",
            color: "#ff5a5f",
            fontWeight: "600",
          }}
        >
          User Lists
        </h2>
        {loading && !isSearching ? (
          <div style={{ textAlign: "center", padding: "20px" }}>Loading...</div>
        ) : error ? (
          <div style={{ color: "red", textAlign: "center", padding: "20px" }}>
            Error: {error}
          </div>
        ) : (
          <UserTable
            users={users}
            onSearch={handleSearch}
            onSort={handleSort}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
            onView={handleViewUser}
            onEdit={handleEditUser}
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
      <UserModal
        user={editingUser}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveNewUser}
      />
      <AddUserModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSave={handleSaveNewUser}
      />

      <AnimatePresence>
        {isDetailModalOpen && (
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="fixed inset-0 bg-black/80 flex items-center justify-center z-[1000]"
          >
            <motion.div
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
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </MainLayout>
  );
}
