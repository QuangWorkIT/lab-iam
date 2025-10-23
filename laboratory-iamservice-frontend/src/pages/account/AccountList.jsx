import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
    fetchInactiveAccounts,
    activateAccount,
} from "../../redux/features/accountSlice";
import AccountTable from "../../components/modules/account/AccountTable";
import MainLayout from "../../components/layout/MainLayout";
import { toast } from 'react-toastify';

export default function AccountList() {
    // Redux hooks
    const dispatch = useDispatch();
    const { accounts, loading, error } = useSelector(
        (state) => state.accounts
    );

    // Local state for search params (simplified - no pagination/status filter needed)
    const [searchParams, setSearchParams] = useState({
        keyword: "",
        fromDate: "",
        toDate: "",
    });

    // Fetch inactive accounts when component mounts
    useEffect(() => {
        dispatch(fetchInactiveAccounts());
    }, [dispatch]);

    // Handlers for AccountTable
    const handleSearch = (keyword, fromDate, toDate) => {
        setSearchParams({
            keyword,
            fromDate,
            toDate,
        });
    };

    // Handler for refreshing the list
    const handleRefresh = () => {
        dispatch(fetchInactiveAccounts());
        toast.info("Refreshing inactive accounts list...");
    };

    // Handler for viewing account details
    const handleViewAccount = (account) => {
        // For now, just show an alert with account details
        // In the future, you could open a modal with detailed information
        alert(`Account Details:\n\nName: ${account.name}\nEmail: ${account.email}\nRole: ${account.role}\nStatus: ${account.isActive ? 'Active' : 'Inactive'}\nCreated: ${account.createdAt}`);
    };

    // Handler for activating account (only inactive accounts can be activated)
    const handleActivateAccount = (account) => {
        if (account.isActive) {
            toast.warning("This account is already active!");
            return;
        }

        if (window.confirm(`Are you sure you want to activate this account?\n\nUser: ${account.name}\nEmail: ${account.email}`)) {
            dispatch(activateAccount(account.email))
                .unwrap()
                .then(() => {
                    dispatch(fetchInactiveAccounts());
                    toast.success(`Account activated successfully!`);
                })
                .catch((error) => {
                    toast.error(
                        `Failed to activate account: ${error?.message ||
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
                        color: "#ff5a5f",
                        fontWeight: "normal",
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
                    onRefresh={handleRefresh}
                    searchParams={searchParams}
                />
            </div>
        </MainLayout>
    );
}

