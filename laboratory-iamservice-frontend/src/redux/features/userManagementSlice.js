import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../configs/axios.js";

const initialState = {
    users: [],
    currentUser: null,
    userDetail: null,
    loading: false,
    userDetailLoading: false,
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
        id: dto.userId,
        name: dto.fullName || "",
        fullName: dto.fullName || "",
        email: dto.email || "",
        roleCode: dto.roleCode || "",
        createdAt: dto.createdAt || null,
        isActive: dto.isActive ?? true,
        identityNumber: dto.identityNumber || "",
        phoneNumber: dto.phoneNumber || dto.phone || "",
        gender: dto.gender || "",
        birthdate: dto.birthdate || dto.dateOfBirth || dto.birthDate || dto.dob || null,
        dateOfBirth: dto.birthdate || dto.dateOfBirth || dto.birthDate || dto.dob || null,
        age: dto.age || null,
        address: dto.address || "",
        isDeleted: dto.isDeleted || false,
        deletedAt: dto.deletedAt || null
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

                // Client-side filtering as fallback
                if (params.keyword || params.roleFilter || params.fromDate || params.toDate) {
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
            } else {
                userDTOs = [];
                totalPages = 0;
                totalElements = 0;
            }

            const users = userDTOs.map(mapUserDTOToUI);

            return {
                content: users,
                totalElements,
                totalPages,
            };
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || error.response?.data?.error || error.message
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
            const response = await api.post("/api/users", userData);
            return mapUserDTOToUI(response.data);
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || error.response?.data?.error || error.message
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
                error.response?.data?.message || error.response?.data?.error || error.message
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
                error.response?.data?.message || error.response?.data?.error || error.message
            );
        }
    }
);

/**
 * API: GET /api/users/{id}
 * Lấy user theo ID (cho user detail modal)
 */
export const fetchUserById = createAsyncThunk(
    "userManagement/fetchUserById",
    async (userId, { rejectWithValue }) => {
        try {
            const response = await api.get(`/api/users/${userId}/profile`);
            const detailUserDTO = response.data?.data || response.data;
            return mapUserDTOToUI(detailUserDTO);
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || error.response?.data?.error || error.message
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
                error.response?.data?.message || error.response?.data?.error || error.message
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
                error.response?.data?.message || error.response?.data?.error || error.message
            );
        }
    }
);

/**
 * API: PUT /api/users/{id}/profile
 * Update user's own profile
 * Body: { fullName, phoneNumber, gender, dateOfBirth, address }
 */
export const updateOwnProfile = createAsyncThunk(
    "userManagement/updateOwnProfile",
    async ({ userId, profileData }, { rejectWithValue }) => {
        try {
            const response = await api.put(`/api/users/${userId}/profile`, {
                fullName: profileData.fullName,
                phoneNumber: profileData.phoneNumber,
                gender: profileData.gender,
                dateOfBirth: profileData.birthdate,
                address: profileData.address
            });
            return mapUserDTOToUI(response.data);
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || error.response?.data?.error || error.message
            );
        }
    }
);

/**
 * API: PUT /api/users/{id}
 * Update user by admin (full update with all fields)
 * Body: { fullName, phoneNumber, identityNumber, gender, birthdate, address, isActive, roleCode }
 */
export const updateUserByAdmin = createAsyncThunk(
    "userManagement/updateUserByAdmin",
    async ({ userId, userData }, { rejectWithValue }) => {
        try {
            const response = await api.put(`/api/users/${userId}`, {
                fullName: userData.fullName,
                phoneNumber: userData.phoneNumber,
                identityNumber: userData.identityNumber,
                gender: userData.gender,
                birthdate: userData.birthdate,
                address: userData.address,
                isActive: userData.isActive,
                roleCode: userData.roleCode
            });
            return mapUserDTOToUI(response.data);
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || error.response?.data?.error || error.message
            );
        }
    }
);

/**
 * API: DELETE /api/users/{id}/request-deletion
 * Patient request self deletion (soft delete with 7 days grace period)
 * Requires: ROLE_PATIENT and user must be deleting their own account
 */
export const requestSelfDeletion = createAsyncThunk(
    "userManagement/requestSelfDeletion",
    async (userId, { rejectWithValue }) => {
        try {
            const response = await api.delete(`/api/users/${userId}/request-deletion`);

            return {
                userId,
                message: response.data || "Your deletion request has been submitted. Account will be deleted after 7 days."
            };
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || error.response?.data?.error || error.message
            );
        }
    }
);

/**
 * API: DELETE /api/users/{id}
 * Delete user by admin
 * Requires: ROLE_ADMIN or DELETE_USER or ROLE_LAB_MANAGER
 */
export const deleteUserByAdmin = createAsyncThunk(
    "userManagement/deleteUserByAdmin",
    async (userId, { rejectWithValue }) => {
        try {
            console.log("Calling DELETE API for user:", userId);

            const response = await api.delete(`/api/users/${userId}`);
            console.log("Delete API response:", response);

            return {
                userId,
                message: response.data || "User deleted successfully."
            };
        } catch (error) {
            console.error("Delete API error details:", {
                status: error.response?.status,
                statusText: error.response?.statusText,
                data: error.response?.data,
                message: error.message
            });

            // Return backend error message directly
            const errorMessage = error.response?.data?.message ||
                error.response?.data?.error ||
                error.message ||
                "Failed to delete user";

            return rejectWithValue(errorMessage);
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
            // Fetch user by ID (for detail modal)
            .addCase(fetchUserById.pending, (state) => {
                state.userDetailLoading = true;
                state.error = null;
            })
            .addCase(fetchUserById.fulfilled, (state, action) => {
                state.userDetailLoading = false;
                state.userDetail = action.payload;
            })
            .addCase(fetchUserById.rejected, (state, action) => {
                state.userDetailLoading = false;
                state.error = action.payload || action.error.message;
                state.userDetail = null;
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
            })
            // Update own profile
            .addCase(updateOwnProfile.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(updateOwnProfile.fulfilled, (state, action) => {
                state.loading = false;
                // Update userDetail if it's the same user
                if (state.userDetail && state.userDetail.id === action.payload.id) {
                    state.userDetail = action.payload;
                }
                // Update in users array if exists
                const index = state.users.findIndex(u => u.id === action.payload.id);
                if (index !== -1) {
                    state.users[index] = action.payload;
                }
            })
            .addCase(updateOwnProfile.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || action.error.message;
            })
            // Update user by admin
            .addCase(updateUserByAdmin.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(updateUserByAdmin.fulfilled, (state, action) => {
                state.loading = false;
                // Update userDetail if it's the same user
                if (state.userDetail && state.userDetail.id === action.payload.id) {
                    state.userDetail = action.payload;
                }
                // Update in users array
                const index = state.users.findIndex(u => u.id === action.payload.id);
                if (index !== -1) {
                    state.users[index] = action.payload;
                }
            })
            .addCase(updateUserByAdmin.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || action.error.message;
            })
            // Request self deletion (PATIENT)
            .addCase(requestSelfDeletion.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(requestSelfDeletion.fulfilled, (state) => {
                state.loading = false;
                // Deletion request submitted successfully
                // Backend will handle the deletion after 7 days
            })
            .addCase(requestSelfDeletion.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || action.error.message;
            })
            // Delete user by admin
            .addCase(deleteUserByAdmin.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(deleteUserByAdmin.fulfilled, (state, action) => {
                state.loading = false;
                // Remove user from users array
                state.users = state.users.filter(u => u.id !== action.payload.userId);
                // Update total elements
                state.totalElements = Math.max(0, state.totalElements - 1);
                // Clear userDetail if it's the deleted user
                if (state.userDetail && state.userDetail.id === action.payload.userId) {
                    state.userDetail = null;
                }
            })
            .addCase(deleteUserByAdmin.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || action.error.message;
            });
    },
});

export const { clearError, clearCurrentUser } = userManagementSlice.actions;
export default userManagementSlice.reducer;
