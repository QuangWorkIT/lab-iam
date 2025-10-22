import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
    fetchUsers,
    createUser,
} from "../../redux/features/userManagementSlice";
import UserTable from "../../components/modules/user/UserTable";
import UserModal from "../../components/modules/user/UserModal";
import AddUserModal from "../../components/modules/user/AddUserModal";
import UserDetailModal from "../../components/modules/user/UserDetailModal";
import MainLayout from "../../components/layout/MainLayout";

export default function UserList() {
    //Redux hooks
    const dispatch = useDispatch();
    const { users, loading, error, totalPages } = useSelector(
        (state) => state.users
    );
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [viewingUser, setViewingUser] = useState(null);

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
        dispatch(fetchUsers(searchParams));
    }, [dispatch, searchParams]);

    // Handlers for UserTable
    const handleSearch = (keyword, fromDate, toDate, roleFilter) => {
        setSearchParams((prev) => ({
            ...prev,
            keyword,
            fromDate,
            toDate,
            roleFilter,
            page: 0, // Reset về trang đầu khi tìm kiếm
        }));
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
    const handleSaveNewUser = (userData) => {
        dispatch(createUser(userData))
            .unwrap()
            .then(() => {
                setIsAddModalOpen(false);
                dispatch(fetchUsers(searchParams));
                alert("User created successfully!");
            })
            .catch((error) => {
                alert(`Failed to create user: ${error}`);
            });
    };

    // Handler for refresh user detail
    const handleRefreshUser = () => {
        if (viewingUser) {
            dispatch(fetchUsers(searchParams));
        }
    };

    return (
        <MainLayout pageTitle="USER MANAGEMENT" pageDescription="Manage user accounts">
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
                        fontWeight: "normal",
                    }}
                >
                    User Lists
                </h2>
                {loading ? (
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
                        onView={handleViewUser}
                        onEdit={handleEditUser}
                        onAdd={handleAddUser}
                        currentPage={searchParams.page}
                        totalPages={totalPages}
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
            <UserDetailModal
                user={viewingUser}
                isOpen={isDetailModalOpen}
                onClose={() => setIsDetailModalOpen(false)}
                onRefresh={handleRefreshUser}
            />
        </MainLayout>
    );
}
