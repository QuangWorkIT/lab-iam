import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchRoles,
  createRole,
  updateRole,
  deleteRole,
} from "../../redux/features/roleSlice";
import RoleTable from "../../components/modules/role/RoleTable";
import RoleModal from "../../components/modules/role/RoleModal";
import MainLayout from "../../components/layout/MainLayout";

export default function RoleList() {
  //Redux hooks
  const dispatch = useDispatch();
  const { roles, loading, error, totalPages } = useSelector(
    (state) => state.roles
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Local state for search and filter params
  const [searchParams, setSearchParams] = useState({
    keyword: "",
    fromDate: "",
    toDate: "",
    page: 0,
    size: 10,
    sortBy: "name",
    sortDir: "asc",
  });

  // Fetch roles when component mounts or search params change
  useEffect(() => {
    dispatch(fetchRoles(searchParams));
  }, [dispatch, searchParams]);

  // Handlers for RoleTable
  const handleSearch = (keyword, fromDate, toDate) => {
    setSearchParams((prev) => ({
      ...prev,
      keyword,
      fromDate,
      toDate,
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
  const handleViewRole = (role) => {
    setEditingRole(role);
    setIsModalOpen(true);
  };

  const handleAddRole = () => {
    setEditingRole(null); // null = thêm mới
    setIsModalOpen(true);
  };

  const handleEditRole = (role) => {
    setEditingRole(role);
    setIsModalOpen(true);
  };

  const handleDelete = (code) => {
    if (window.confirm("Are you sure you want to delete this role?")) {
      setActionLoading(true);
      dispatch(deleteRole(code))
        .unwrap()
        .then(() => {
          dispatch(fetchRoles(searchParams));
          alert("Role deleted successfully");
        })
        .catch((error) => {
          alert(
            `Failed to delete: ${
              error?.message ||
              error?.response?.data?.message ||
              "Unknown error"
            }`
          );
        })
        .finally(() => {
          setActionLoading(false);
        });
    }
  };

  // Handler cho việc lưu role (thêm hoặc sửa)
  const handleSaveRole = (roleData) => {
    // Nếu đang edit (có editingRole)
    if (editingRole) {
      dispatch(updateRole({ code: editingRole.code, roleData }))
        .unwrap()
        .then(() => {
          setIsModalOpen(false);
          dispatch(fetchRoles(searchParams));
          alert("Role updated successfully!");
        })
        .catch((error) => {
          alert(
            `Failed to update role: ${
              error.message || JSON.stringify(error) || "Unknown error"
            }`
          );
        });
    } else {
      // Thêm mới
      dispatch(createRole(roleData))
        .unwrap()
        .then(() => {
          setIsModalOpen(false);
          dispatch(fetchRoles(searchParams));
          alert("Role created successfully!");
        })
        .catch((error) => {
          alert(`Failed to create role: ${error}`);
        });
    }
  };

  return (
    <MainLayout pageTitle="ROLE MANAGEMENT" pageDescription="Manage user roles">
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
          User Roles
        </h2>
        {loading ? (
          <div style={{ textAlign: "center", padding: "20px" }}>Loading...</div>
        ) : error ? (
          <div style={{ color: "red", textAlign: "center", padding: "20px" }}>
            Error: {error}
          </div>
        ) : (
          <RoleTable
            roles={roles}
            onSearch={handleSearch}
            onSort={handleSort}
            onPageChange={handlePageChange}
            onView={handleViewRole}
            onEdit={handleEditRole}
            onDelete={handleDelete}
            onAdd={handleAddRole}
            currentPage={searchParams.page}
            totalPages={totalPages}
          />
        )}
      </div>
      <RoleModal
        role={editingRole}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveRole}
      />
    </MainLayout>
  );
}
