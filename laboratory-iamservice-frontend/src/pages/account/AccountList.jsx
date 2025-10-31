import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchInactiveAccounts,
  activateAccount,
} from "../../redux/features/accountSlice";
import AccountTable from "../../components/modules/account/AccountTable";
import MainLayout from "../../components/layout/MainLayout";
import UserDetailModal from "../../components/common/UserDetailModal";
import { toast } from "react-toastify";

export default function AccountList() {
  // Redux hooks
  const dispatch = useDispatch();
  const { accounts, loading, error } = useSelector((state) => state.accounts);

  // State for detail modal
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [viewingAccount, setViewingAccount] = useState(null);

  // Local state for search params (simplified - no pagination/status filter needed)
  const [searchParams, setSearchParams] = useState({
    keyword: "",
    fromDate: "",
    toDate: "",
    roleFilter: "",
  });

  // Fetch inactive accounts when component mounts
  useEffect(() => {
    dispatch(fetchInactiveAccounts());
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

  // Handler for viewing account details
  const handleViewAccount = (account) => {
    setViewingAccount(account);
    setIsDetailModalOpen(true);
  };

  // Handler for refresh account detail
  const handleRefreshAccount = () => {
    if (viewingAccount) {
      dispatch(fetchInactiveAccounts());
    }
  };

  // Handler for activating account (only inactive accounts can be activated)
  const handleActivateAccount = (account) => {
    if (account.isActive) {
      toast.warning("This account is already active!");
      return;
    }

    if (
      window.confirm(
        `Are you sure you want to activate this account?\n\nUser: ${account.name}\nEmail: ${account.email}`
      )
    ) {
      dispatch(activateAccount(account.email))
        .unwrap()
        .then(() => {
          dispatch(fetchInactiveAccounts());
          toast.success(`Account activated successfully!`);
        })
        .catch((error) => {
          toast.error(
            `Failed to activate account: ${
              error?.message ||
              error?.response?.data?.message ||
              "Unknown error"
            }`
          );
        });
    }
  };

  return (
    <MainLayout
      pageTitle="ACCOUNT MANAGEMENT"
      pageDescription="Manage user account status and permissions"
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
            color: "#fe535b",
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
          onActivate={handleActivateAccount}
          searchParams={searchParams}
        />
      </div>

      {/* User Detail Modal */}
      <UserDetailModal
        user={viewingAccount}
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        onRefresh={handleRefreshAccount}
      />
    </MainLayout>
  );
}
