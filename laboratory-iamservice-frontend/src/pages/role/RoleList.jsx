import React, { useState, useEffect, useMemo } from "react";
import { FaPlus } from "react-icons/fa";
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
import { toast } from "react-toastify";

export default function RoleList() {
  // Redux hooks
  const dispatch = useDispatch();
  const { roles, loading, error } = useSelector((state) => state.roles);
  const userPrivileges = useSelector(
  (state) => state.user?.userInfo?.privileges || "",
  (prev, next) => JSON.stringify(prev) === JSON.stringify(next)
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [modalMode, setModalMode] = useState("create"); // 'create' | 'edit' | 'view'

  // Helper: chuyển error sang string an toàn
  const errorText = useMemo(() => {
    if (!error) return "";
    if (typeof error === "string") return error;
    if (error?.message) return error.message;
    if (error?.response?.data?.message) return error.response.data.message;
    try {
      return JSON.stringify(error);
    } catch {
      return String(error);
    }
  }, [error]);

  // Local state cho search, sort, filter
  const [searchKeyword, setSearchKeyword] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });

  // Pagination state
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  // Fetch roles 1 lần khi mount
  useEffect(() => {
    dispatch(fetchRoles());
  }, [dispatch]);

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

  const privilegesArray = useMemo(() => parsePrivileges(userPrivileges), [userPrivileges]);

  const hasPrivilege = (privilegeName) => {
    if (!privilegesArray) return false;
    return privilegesArray.includes(privilegeName);
  };

  const canCreateRole = hasPrivilege("CREATE_ROLE");
  const canUpdateRole = hasPrivilege("UPDATE_ROLE");
  const canDeleteRole = hasPrivilege("DELETE_ROLE");
  const canViewRole = hasPrivilege("VIEW_ROLE");


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

  // Paginated roles
  const paginatedRoles = useMemo(() => {
    const startIndex = currentPage * pageSize;
    const endIndex = startIndex + pageSize;
    return filteredRoles.slice(startIndex, endIndex);
  }, [filteredRoles, currentPage, pageSize]);

  // Total pages
  const totalPages = useMemo(() => {
    return Math.ceil(filteredRoles.length / pageSize);
  }, [filteredRoles.length, pageSize]);

  const formatErr = (error) => {
    // Ưu tiên message từ backend
    if (error?.response?.data?.message) {
      return error.response.data.message;
    }
    if (error?.message) {
      // Loại bỏ các prefix kỹ thuật như "Error:", "TypeError:", etc.
      return error.message.replace(
        /^(Error|TypeError|ReferenceError):\s*/i,
        ""
      );
    }
    // Fallback: thông báo chung
    return "An error occurred. Please try again or contact support.";
  };

  const handleSaveRole = (roleData) => {
    // Guard chống double submit
    if (actionLoading) return;
    setActionLoading(true);

    if (editingRole) {
      dispatch(updateRole({ code: editingRole.code, roleData }))
        .unwrap()
        .then(() => {
          setIsModalOpen(false);
          dispatch(fetchRoles());
          toast.success("Role updated successfully!");
        })
        .catch((error) => {
          console.error("Update role error:", error); // Log đầy đủ cho dev
          const userMessage = formatErr(error);
          toast.error(`Failed to update role. ${userMessage}`);
        })
        .finally(() => setActionLoading(false));
    } else {
      dispatch(createRole(roleData))
        .unwrap()
        .then(() => {
          setIsModalOpen(false);
          dispatch(fetchRoles());
          toast.success("Role created successfully!");
        })
        .catch((error) => {
          console.error("Create role error:", error); // Log đầy đủ cho dev
          const userMessage = formatErr(error);
          toast.error(`Failed to create role. ${userMessage}`);
        })
        .finally(() => setActionLoading(false));
    }
  };

  // Handlers cho RoleTable
  const handleSearch = (keyword, from, to) => {
    setSearchKeyword(keyword);
    setFromDate(from);
    setToDate(to);
    setCurrentPage(0); // Reset về trang đầu khi search
  };
  const handleSort = (key, direction) => {
    setSortConfig({ key, direction });
  };

  // Pagination handlers
  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  const handlePageSizeChange = (newPageSize) => {
    setPageSize(newPageSize);
    setCurrentPage(0); // Reset về trang đầu khi đổi page size
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
    // Guard chống double submit
    if (actionLoading) return;
    setActionLoading(true);

    dispatch(deleteRole(code))
      .unwrap()
      .then(() => {
        dispatch(fetchRoles());
        toast.success("Role deleted successfully");
      })
      .catch((error) => {
        console.error("Delete role error:", error); // Log đầy đủ cho dev
        const userMessage = formatErr(error);
        toast.error(`Failed to delete role. ${userMessage}`);
      })
      .finally(() => {
        setActionLoading(false);
      });
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
              color: "#FF5A5A",
              fontWeight: "600",
            }}
          >
            User Roles
          </h2>
          {canCreateRole && (
            <button
              type="button"
              onClick={handleAddRole}
              onMouseEnter={e => e.currentTarget.style.backgroundColor = "#FF3A3A"}
              onMouseLeave={e => e.currentTarget.style.backgroundColor = "#FF5A5A"}
              style={{
                backgroundColor: "#FF5A5A",
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
            >
              <FaPlus style={{ marginRight: 6 }} />
              Add New Role
            </button>
          )}

        </div>
        {/* {errorText && (
          <div style={{ color: "red", textAlign: "center", padding: "20px" }}>
            Error: {errorText}
          </div>
        )} */}

        <RoleTable
          roles={paginatedRoles}
          onSearch={handleSearch}
          onSort={handleSort}
          onView={handleViewRole}
          onEdit={handleEditRole}
          onDelete={handleDelete}
          onAdd={handleAddRole}
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
          totalElements={filteredRoles.length}
          pageSize={pageSize}
          onPageSizeChange={handlePageSizeChange}
          canViewRole={canViewRole}
          canUpdateRole={canUpdateRole}
          canDeleteRole={canDeleteRole}
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
        isSaving={actionLoading} // thêm prop để disable nút Save
      />
    </MainLayout>
  );
}
