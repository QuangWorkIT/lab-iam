import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../configs/axios.js";

const initialState = {
    users: [],
    currentUser: null,
    loading: false,
    error: null,
    totalPages: 0,
    totalElements: 0,
    roles: [],
    rolesLoading: false,
};

/**
 * Map Backend UserDTO to UI format
 * Backend: { userId, fullName, email, isActive, createdAt, ... }
 * UI: { id, name, email, role, isActive, createdAt, createdBy }
 */
function mapUserDTOToUI(dto) {
    return {
        id: dto.userId,                    // Backend: userId -> UI: id
        name: dto.fullName || "",          // Backend: fullName -> UI: name
        email: dto.email || "",
        role: dto.roleCode || dto.rolecode || dto.role || "",  // Try multiple field names
        createdAt: dto.createdAt || null,
        isActive: dto.isActive ?? true,
    };
}

/**
 * API: GET /api/users
 * Lấy danh sách users từ backend với search params
 * searchParams: { keyword, fromDate, toDate, roleFilter, page, size, sortBy, sortDir }
 */
export const fetchUsers = createAsyncThunk(
    "userManagement/fetchUsers",
    async (searchParams = {}, { rejectWithValue }) => {
        try {
            // Build query params, only include non-empty values
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
            if (searchParams.roleFilter) {
                params.roleFilter = searchParams.roleFilter;
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

            console.log('🔍 Fetching users with params:', params);
            const response = await api.get("/api/users", { params });
            console.log('✅ API Response:', response.data);

            // Log all unique roles to help with debugging
            if (Array.isArray(response.data)) {
                const roles = [...new Set(response.data.map(u =>
                    `${u.roleCode || u.role || 'NO_ROLE'}`.toUpperCase()
                ))];
                console.log('📋 Available roles in response:', roles);
            }

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

                // Client-side filtering as fallback
                if (params.keyword || params.roleFilter || params.fromDate || params.toDate) {
                    console.log('⚠️ Backend returned full list, applying client-side filtering...');
                    console.log('Filter params:', { keyword: params.keyword, role: params.roleFilter, fromDate: params.fromDate, toDate: params.toDate });

                    allUsers = allUsers.filter(dto => {
                        // Keyword matching
                        const matchKeyword = !params.keyword ||
                            (dto.fullName && dto.fullName.toLowerCase().includes(params.keyword.toLowerCase())) ||
                            (dto.email && dto.email.toLowerCase().includes(params.keyword.toLowerCase()));

                        // Role matching - support multiple role field names and formats
                        let matchRole = true;
                        if (params.roleFilter) {
                            const filterRole = params.roleFilter.toUpperCase().trim();
                            const dtoRoleCode = (dto.roleCode || dto.rolecode || '').toUpperCase().trim();
                            const dtoRole = (dto.role || '').toUpperCase().trim();

                            // Try matching with roleCode, role, or partial match
                            matchRole = dtoRoleCode === filterRole ||
                                dtoRole === filterRole ||
                                dtoRoleCode.includes(filterRole) ||
                                dtoRole.includes(filterRole);
                        }

                        // Date matching
                        const matchDate =
                            (!params.fromDate || new Date(dto.createdAt) >= new Date(params.fromDate)) &&
                            (!params.toDate || new Date(dto.createdAt) <= new Date(params.toDate));

                        return matchKeyword && matchRole && matchDate;
                    });
                    console.log(`📊 Filtered ${allUsers.length} users from ${response.data.length} total`);
                }

                // Client-side pagination
                const pageSize = params.size || 10;
                const currentPage = params.page || 0;
                totalElements = allUsers.length;
                totalPages = Math.ceil(totalElements / pageSize);

                // Get users for current page
                const startIndex = currentPage * pageSize;
                const endIndex = startIndex + pageSize;
                userDTOs = allUsers.slice(startIndex, endIndex);

                console.log(`📄 Page ${currentPage + 1}/${totalPages}: Showing ${userDTOs.length} users (${startIndex + 1}-${Math.min(endIndex, totalElements)} of ${totalElements})`);
            } else {
                userDTOs = [];
                totalPages = 0;
                totalElements = 0;
            }

            const users = userDTOs.map(mapUserDTOToUI);
            console.log('✨ Returning users:', users.length, 'users');

            return {
                content: users,
                totalElements,
                totalPages,
            };
        } catch (error) {
            console.error('❌ Error fetching users:', error);
            return rejectWithValue(
                error.response?.data?.message || error.message || "Failed to fetch users"
            );
        }
    }
);

/**
 * API: POST /api/users
 * Tạo user mới
 * Body: { fullName, email, ... }
 */
export const createUser = createAsyncThunk(
    "userManagement/createUser",
    async (userData, { rejectWithValue }) => {
        try {
            console.log('🔵 [CREATE USER] Request payload:', userData);
            const response = await api.post("/api/users", userData);
            console.log('🟢 [CREATE USER] Response from backend:', response.data);
            return mapUserDTOToUI(response.data);
        } catch (error) {
            console.error('🔴 [CREATE USER] Error:', error.response?.data || error);
            return rejectWithValue(
                error.response?.data?.message || error.message || "Failed to create user"
            );
        }
    }
);

/**
 * API: PUT /api/users/activate
 * Kích hoạt user theo email
 */
export const activateUser = createAsyncThunk(
    "userManagement/activateUser",
    async (email, { rejectWithValue }) => {
        try {
            const response = await api.put("/api/users/activate", null, {
                params: { email }
            });
            return response.data;
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || error.message || "Failed to activate user"
            );
        }
    }
);

/**
 * API: GET /api/users/email
 * Lấy user theo email
 */
export const getUserByEmail = createAsyncThunk(
    "userManagement/getUserByEmail",
    async (email, { rejectWithValue }) => {
        try {
            const response = await api.get("/api/users/email", {
                params: { email }
            });
            return mapUserDTOToUI(response.data);
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || error.message || "User not found"
            );
        }
    }
);

/**
 * API: GET /api/users/inactive
 * Lấy danh sách users inactive
 */
export const getInactiveUsers = createAsyncThunk(
    "userManagement/getInactiveUsers",
    async (_, { rejectWithValue }) => {
        try {
            const response = await api.get("/api/users/inactive");
            const userDTOs = Array.isArray(response.data) ? response.data : [];
            return userDTOs.map(mapUserDTOToUI);
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || error.message || "Failed to fetch inactive users"
            );
        }
    }
);

/**
 * API: GET /api/roles
 * Lấy danh sách tất cả roles từ backend
 */
export const fetchRolesForUser = createAsyncThunk(
    "userManagement/fetchRolesForUser",
    async (_, { rejectWithValue }) => {
        try {
            const response = await api.get("/api/roles");
            const data = response.data || [];
            return Array.isArray(data) ? data : data.roles || [];
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || error.message || "Failed to fetch roles"
            );
        }
    }
);

const userManagementSlice = createSlice({
    name: "userManagement",
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null;
        },
        clearCurrentUser: (state) => {
            state.currentUser = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // Fetch users
            .addCase(fetchUsers.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchUsers.fulfilled, (state, action) => {
                state.loading = false;
                state.users = action.payload.content || [];
                state.totalPages = action.payload.totalPages || 0;
                state.totalElements = action.payload.totalElements || 0;
            })
            .addCase(fetchUsers.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || action.error.message;
            })
            // Create user
            .addCase(createUser.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(createUser.fulfilled, (state, action) => {
                state.loading = false;
                state.users.push(action.payload);
                state.totalElements += 1;
            })
            .addCase(createUser.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || action.error.message;
            })
            // Activate user
            .addCase(activateUser.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(activateUser.fulfilled, (state) => {
                state.loading = false;
            })
            .addCase(activateUser.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || action.error.message;
            })
            // Get user by email
            .addCase(getUserByEmail.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getUserByEmail.fulfilled, (state, action) => {
                state.loading = false;
                state.currentUser = action.payload;
            })
            .addCase(getUserByEmail.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || action.error.message;
            })
            // Get inactive users
            .addCase(getInactiveUsers.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getInactiveUsers.fulfilled, (state, action) => {
                state.loading = false;
                state.users = action.payload;
                state.totalElements = action.payload.length;
            })
            .addCase(getInactiveUsers.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || action.error.message;
            })
            // Fetch roles for user
            .addCase(fetchRolesForUser.pending, (state) => {
                state.rolesLoading = true;
                state.error = null;
            })
            .addCase(fetchRolesForUser.fulfilled, (state, action) => {
                state.rolesLoading = false;
                state.roles = action.payload;
            })
            .addCase(fetchRolesForUser.rejected, (state, action) => {
                state.rolesLoading = false;
                state.error = action.payload || action.error.message;
            });
    },
});

export const { clearError, clearCurrentUser } = userManagementSlice.actions;
export default userManagementSlice.reducer;
