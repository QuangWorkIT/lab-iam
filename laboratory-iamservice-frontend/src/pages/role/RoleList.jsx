import React, { useState, useEffect, useMemo } from "react";
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
  // Redux hooks
  const dispatch = useDispatch();
  const { roles, loading, error } = useSelector((state) => state.roles);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [modalMode, setModalMode] = useState("create"); // 'create' | 'edit' | 'view'

  // Local state cho search, sort, filter
  const [searchKeyword, setSearchKeyword] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });

  // Fetch roles 1 lần khi mount
  useEffect(() => {
    dispatch(fetchRoles());
  }, [dispatch]);

  // Xử lý search, sort, filter hoàn toàn ở FE
  const filteredRoles = useMemo(() => {
    let result = [...roles];
    // Search
    if (searchKeyword) {
      const kw = searchKeyword.toLowerCase();
      result = result.filter(
        (r) =>
          (r.name && r.name.toLowerCase().includes(kw)) ||
          (r.code && r.code.toLowerCase().includes(kw))
      );
    }
    // Filter by date
    if (fromDate) {
      result = result.filter((r) => r.createdAt && r.createdAt >= fromDate);
    }
    if (toDate) {
      result = result.filter((r) => r.createdAt && r.createdAt <= toDate);
    }
    // Sort
    if (sortConfig.key) {
      result.sort((a, b) => {
        const aVal = (a[sortConfig.key] || "").toString().toLowerCase();
        const bVal = (b[sortConfig.key] || "").toString().toLowerCase();
        if (aVal < bVal) return sortConfig.direction === "asc" ? -1 : 1;
        if (aVal > bVal) return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      });
    }
    return result;
  }, [roles, searchKeyword, fromDate, toDate, sortConfig]);

  // Handlers cho RoleTable
  const handleSearch = (keyword, from, to) => {
    setSearchKeyword(keyword);
    setFromDate(from);
    setToDate(to);
  };
  const handleSort = (key, direction) => {
    setSortConfig({ key, direction });
  };

  // Handlers cho các action buttons
  const handleViewRole = (role) => {
    setEditingRole(role);
    setModalMode("view");
    setIsModalOpen(true);
  };
  const handleAddRole = () => {
    setEditingRole(null);
    setModalMode("create");
    setIsModalOpen(true);
  };
  const handleEditRole = (role) => {
    setEditingRole(role);
    setModalMode("edit");
    setIsModalOpen(true);
  };
  const handleDelete = (code) => {
    if (window.confirm("Are you sure you want to delete this role?")) {
      setActionLoading(true);
      dispatch(deleteRole(code))
        .unwrap()
        .then(() => {
          dispatch(fetchRoles());
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
  const handleSaveRole = (roleData) => {
    if (editingRole) {
      dispatch(updateRole({ code: editingRole.code, roleData }))
        .unwrap()
        .then(() => {
          setIsModalOpen(false);
          dispatch(fetchRoles());
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
      dispatch(createRole(roleData))
        .unwrap()
        .then(() => {
          setIsModalOpen(false);
          dispatch(fetchRoles());
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
            color: "#fe535b",
            fontWeight: "normal",
          }}
        >
          User Roles
        </h2>
        {/* Always render the table to preserve search inputs; show loading or error inline */}
        {error && (
          <div style={{ color: "red", textAlign: "center", padding: "20px" }}>
            Error: {error}
          </div>
        )}

        <RoleTable
          roles={filteredRoles}
          onSearch={handleSearch}
          onSort={handleSort}
          onView={handleViewRole}
          onEdit={handleEditRole}
          onDelete={handleDelete}
          onAdd={handleAddRole}
        />

        {loading && (
          <div style={{ textAlign: "center", padding: "12px", color: "#666" }}>
            Loading...
          </div>
        )}
      </div>
      <RoleModal
        role={editingRole}
        isOpen={isModalOpen}
        mode={modalMode}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveRole}
      />
    </MainLayout>
  );
}
