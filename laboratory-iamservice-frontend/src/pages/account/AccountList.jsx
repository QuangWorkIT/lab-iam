import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchInactiveAccounts,
  fetchDeletedAccounts,
  activateAccount,
  restoreAccount,
} from "../../redux/features/accountSlice";
import AccountTable from "../../components/modules/account/AccountTable";
import DeletedAccountsTable from "../../components/modules/account/DeletedAccountsTable";
import MainLayout from "../../components/layout/MainLayout";
import UserDetailModal from "../../components/common/UserDetailModal";
import { toast } from "react-toastify";
import { motion, AnimatePresence } from "motion/react";

export default function AccountList() {
  // Redux hooks
  const dispatch = useDispatch();
  const { accounts, deletedAccounts, loading, deletedLoading, error } = useSelector((state) => state.accounts);

  // State for detail modal
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [viewingAccount, setViewingAccount] = useState(null);

  // State for confirmation dialogs
  const [confirmState, setConfirmState] = useState({ open: false, type: null, account: null });

  // Local state for search params (simplified - no pagination/status filter needed)
  const [searchParams, setSearchParams] = useState({
    keyword: "",
    fromDate: "",
    toDate: "",
    roleFilter: "",
  });

  // Local state for deleted accounts search params
  const [deletedSearchParams, setDeletedSearchParams] = useState({
    keyword: "",
    fromDate: "",
    toDate: "",
    roleFilter: "",
  });

  // Fetch inactive accounts and deleted accounts when component mounts
  useEffect(() => {
    dispatch(fetchInactiveAccounts());
    dispatch(fetchDeletedAccounts());
  }, [dispatch]);

  // Handlers for AccountTable
  const handleSearch = (keyword, fromDate, toDate, roleFilter) => {
    setSearchParams({
      keyword,
      fromDate,
      toDate,
      roleFilter,
    });
  };

  // Handlers for DeletedAccountsTable
  const handleDeletedSearch = (keyword, fromDate, toDate, roleFilter) => {
    setDeletedSearchParams({
      keyword,
      fromDate,
      toDate,
      roleFilter,
    });
  };

  // Handler for viewing account details
  const handleViewAccount = (account) => {
    setViewingAccount(account);
    setIsDetailModalOpen(true);
  };

  // Handler for refresh account detail
  const handleRefreshAccount = () => {
    if (viewingAccount) {
      dispatch(fetchInactiveAccounts());
      dispatch(fetchDeletedAccounts());
    }
  };

  // Handler to open activate confirm dialog
  const requestActivate = (account) => {
    if (account.isActive) {
      toast.warning("This account is already active!");
      return;
    }
    // Check if account is deleted
    if (account.isDelete || account.deletedAt) {
      toast.error("Cannot activate a deleted account! Please restore it first.");
      return;
    }
    setConfirmState({ open: true, type: "activate", account });
  };

  // Handler to confirm activate
  const handleConfirmActivate = async () => {
    const account = confirmState.account;
    setConfirmState({ open: false, type: null, account: null });

    try {
      await dispatch(activateAccount(account.email)).unwrap();
      await dispatch(fetchInactiveAccounts());
      toast.success("Account activated successfully!");
    } catch (error) {
      console.error("Activate error:", error);
      const errorMessage = error || "Unknown error";
      toast.error(`Failed to activate account: ${errorMessage}`);
    }
  };

  // Handler to open restore confirm dialog
  const requestRestore = (account) => {
    setConfirmState({ open: true, type: "restore", account });
  };

  // Handler to confirm restore
  const handleConfirmRestore = async () => {
    const account = confirmState.account;
    setConfirmState({ open: false, type: null, account: null });

    try {
      await dispatch(restoreAccount(account.id)).unwrap();
      await dispatch(fetchDeletedAccounts());
      await dispatch(fetchInactiveAccounts());
      toast.success("Account restored successfully!");
    } catch (error) {
      toast.error(
        `Failed to restore account: ${error?.message || error || "Unknown error"
        }`
      );
    }
  };

  // Handler to cancel confirm
  const handleCancelConfirm = () => {
    setConfirmState({ open: false, type: null, account: null });
  };

  return (
    <MainLayout
      pageTitle="ACCOUNT MANAGEMENT"
      pageDescription="Manage user account status and permissions"
    >
      {/* Inactive Account Approval Section */}
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
          marginBottom: "30px",
        }}
      >
        <h2
          style={{
            fontSize: "18px",
            marginBottom: "20px",
            color: "#FF5A5A",
            fontWeight: "600",
          }}
        >
          Inactive Account Approval
        </h2>
        {error && (
          <div style={{ color: "red", textAlign: "center", padding: "20px" }}>
            Error: {error}
          </div>
        )}
        <AccountTable
          accounts={accounts}
          loading={loading}
          onSearch={handleSearch}
          onView={handleViewAccount}
          onActivate={requestActivate}
          searchParams={searchParams}
        />
      </div>

      {/* Recently Deleted Accounts Section */}
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
            color: "#FF5A5A",
            fontWeight: "600",
          }}
        >
          Recently Deleted Accounts
        </h2>
        <DeletedAccountsTable
          accounts={deletedAccounts}
          loading={deletedLoading}
          onSearch={handleDeletedSearch}
          onView={handleViewAccount}
          onRestore={requestRestore}
          searchParams={deletedSearchParams}
        />
      </div>

      {/* Confirmation Dialog - Activate */}
      {confirmState.open && confirmState.type === "activate" && (
        <ConfirmDialog
          title="Activate Account"
          message={`Are you sure you want to activate account "${confirmState.account?.name || confirmState.account?.email || "this account"}"?`}
          confirmText="Activate"
          cancelText="Cancel"
          onConfirm={handleConfirmActivate}
          onCancel={handleCancelConfirm}
        />
      )}

      {/* Confirmation Dialog - Restore */}
      {confirmState.open && confirmState.type === "restore" && (
        <ConfirmDialog
          title="Restore Account"
          message={`Are you sure you want to restore account "${confirmState.account?.name || confirmState.account?.email || "this account"}"? This will cancel the deletion request.`}
          confirmText="Restore"
          cancelText="Cancel"
          onConfirm={handleConfirmRestore}
          onCancel={handleCancelConfirm}
        />
      )}

      {/* User Detail Modal */}
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
                user={viewingAccount}
                isOpen={isDetailModalOpen}
                onClose={() => setIsDetailModalOpen(false)}
                onRefresh={handleRefreshAccount}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </MainLayout>
  );
}

// Confirmation Dialog Component - Copy từ UserTable
function ConfirmDialog({
  title = "Confirm",
  message,
  confirmText = "OK",
  cancelText = "Cancel",
  onConfirm,
  onCancel,
}) {
  return (
    <div
      onClick={onCancel}
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(0,0,0,0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1100,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "#fff",
          borderRadius: 12,
          boxShadow: "0 12px 30px rgba(0,0,0,0.2)",
          width: 420,
          maxWidth: "90%",
          padding: "24px",
        }}
      >
        {/* Header & Message */}
        <div style={{ marginBottom: 16 }}>
          <div
            style={{
              color: "#FF5A5A",
              fontWeight: 800,
              letterSpacing: 1.5,
              textTransform: "uppercase",
              fontSize: 16,
              marginBottom: 8,
            }}
          >
            {title}
          </div>
          <div
            style={{
              color: "#404553",
              fontSize: 14,
              lineHeight: 1.5,
            }}
          >
            {message}
          </div>
        </div>

        {/* Action Buttons */}
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: 10,
            paddingTop: 16,
            borderTop: "1px solid #f0f2f5",
          }}
        >
          <button
            onClick={onCancel}
            style={{
              padding: "10px 16px",
              border: "1px solid #e1e7ef",
              borderRadius: 8,
              backgroundColor: "#ffffff",
              color: "#404553",
              cursor: "pointer",
              fontSize: 14,
              fontWeight: 600,
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#f7f9fc")}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#ffffff")}
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            style={{
              padding: "10px 18px",
              border: "none",
              borderRadius: 8,
              backgroundColor: "#FF5A5A",
              color: "#fff",
              fontWeight: 700,
              cursor: "pointer",
              fontSize: 14,
              transition: "background-color 0.2s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#FF3A3A")}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#FF5A5A")}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
