import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../configs/axios.js";

const initialState = {
    accounts: [],
    loading: false,
    error: null,
    totalPages: 0,
    totalElements: 0,
};

/**
 * Map Backend UserDTO to Account UI format
 */
function mapUserDTOToAccount(dto) {
    return {
        id: dto.userId,
        name: dto.fullName || "",
        email: dto.email || "",
        role: dto.roleCode || dto.rolecode || dto.role || "",
        isActive: dto.isActive ?? true,
        createdAt: dto.createdAt || null,
    };
}

/**
 * API: GET /api/users
 * Fetch all user accounts with their status
 */
export const fetchAccounts = createAsyncThunk(
    "account/fetchAccounts",
    async (searchParams = {}, { rejectWithValue }) => {
        try {
            const params = {};
            if (searchParams.keyword && searchParams.keyword.trim()) {
                params.keyword = searchParams.keyword.trim();
            }
            if (searchParams.fromDate) {
                params.fromDate = searchParams.fromDate;
            }
            if (searchParams.toDate) {
                params.toDate = searchParams.toDate;
            }
            if (searchParams.statusFilter !== undefined && searchParams.statusFilter !== "") {
                params.isActive = searchParams.statusFilter === "active";
            }
            if (searchParams.page !== undefined) {
                params.page = searchParams.page;
            }
            if (searchParams.size) {
                params.size = searchParams.size;
            }
            if (searchParams.sortBy) {
                params.sortBy = searchParams.sortBy;
            }
            if (searchParams.sortDir) {
                params.sortDir = searchParams.sortDir;
            }

            console.log('🔍 Fetching accounts with params:', params);
            const response = await api.get("/api/users", { params });

            // Handle both paginated and non-paginated responses
            let userDTOs, totalPages, totalElements;

            if (response.data.content && Array.isArray(response.data.content)) {
                // Paginated response
                userDTOs = response.data.content;
                totalPages = response.data.totalPages || 1;
                totalElements = response.data.totalElements || userDTOs.length;
            } else if (Array.isArray(response.data)) {
                // Simple array response - Apply client-side filtering and pagination
                let allUsers = response.data;

                // Client-side filtering
                if (params.keyword || params.isActive !== undefined || params.fromDate || params.toDate) {
                    allUsers = allUsers.filter(dto => {
                        // Keyword matching
                        const matchKeyword = !params.keyword ||
                            (dto.fullName && dto.fullName.toLowerCase().includes(params.keyword.toLowerCase())) ||
                            (dto.email && dto.email.toLowerCase().includes(params.keyword.toLowerCase()));

                        // Status matching
                        const matchStatus = params.isActive === undefined || dto.isActive === params.isActive;

                        // Date matching
                        const matchDate =
                            (!params.fromDate || new Date(dto.createdAt) >= new Date(params.fromDate)) &&
                            (!params.toDate || new Date(dto.createdAt) <= new Date(params.toDate));

                        return matchKeyword && matchStatus && matchDate;
                    });
                }

                // Client-side pagination
                const pageSize = params.size || 10;
                const currentPage = params.page || 0;
                totalElements = allUsers.length;
                totalPages = Math.ceil(totalElements / pageSize);

                const startIndex = currentPage * pageSize;
                const endIndex = startIndex + pageSize;
                userDTOs = allUsers.slice(startIndex, endIndex);
            } else {
                userDTOs = [];
                totalPages = 0;
                totalElements = 0;
            }

            const accounts = userDTOs.map(mapUserDTOToAccount);

            return {
                content: accounts,
                totalElements,
                totalPages,
            };
        } catch (error) {
            console.error('❌ Error fetching accounts:', error);
            return rejectWithValue(
                error.response?.data?.message || error.message || "Failed to fetch accounts"
            );
        }
    }
);

/**
 * API: PUT /api/users/activate
 * Activate a user account by email
 */
export const activateAccount = createAsyncThunk(
    "account/activateAccount",
    async (email, { rejectWithValue }) => {
        try {
            const response = await api.put("/api/users/activate", null, {
                params: { email }
            });
            return { email, message: response.data };
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || error.message || "Failed to activate account"
            );
        }
    }
);

/**
 * API: GET /api/users/inactive
 * Fetch all inactive user accounts
 */
export const fetchInactiveAccounts = createAsyncThunk(
    "account/fetchInactiveAccounts",
    async (_, { rejectWithValue }) => {
        try {
            const response = await api.get("/api/users/inactive");
            const userDTOs = Array.isArray(response.data) ? response.data : [];
            const accounts = userDTOs.map(mapUserDTOToAccount);

            return {
                content: accounts,
                totalElements: accounts.length,
                totalPages: 1,
            };
        } catch (error) {
            console.error('❌ Error fetching inactive accounts:', error);
            return rejectWithValue(
                error.response?.data?.message || error.message || "Failed to fetch inactive accounts"
            );
        }
    }
);

const accountSlice = createSlice({
    name: "account",
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // Fetch accounts
            .addCase(fetchAccounts.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchAccounts.fulfilled, (state, action) => {
                state.loading = false;
                state.accounts = action.payload.content || [];
                state.totalPages = action.payload.totalPages || 0;
                state.totalElements = action.payload.totalElements || 0;
            })
            .addCase(fetchAccounts.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || action.error.message;
            })
            // Activate account
            .addCase(activateAccount.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(activateAccount.fulfilled, (state, action) => {
                state.loading = false;
                // Update the account in the list
                const account = state.accounts.find(acc => acc.email === action.payload.email);
                if (account) {
                    account.isActive = true;
                }
            })
            .addCase(activateAccount.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || action.error.message;
            })
            // Fetch inactive accounts
            .addCase(fetchInactiveAccounts.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchInactiveAccounts.fulfilled, (state, action) => {
                state.loading = false;
                state.accounts = action.payload.content || [];
                state.totalPages = action.payload.totalPages || 0;
                state.totalElements = action.payload.totalElements || 0;
            })
            .addCase(fetchInactiveAccounts.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || action.error.message;
            });
    },
});

export const { clearError } = accountSlice.actions;
export default accountSlice.reducer;

