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
 * Lấy danh sách tất cả users từ backend
 */
export const fetchUsers = createAsyncThunk(
    "userManagement/fetchUsers",
    async (_, { rejectWithValue }) => {
        try {
            const response = await api.get("/api/users");
            const userDTOs = Array.isArray(response.data) ? response.data : [];
            const users = userDTOs.map(mapUserDTOToUI);

            return {
                content: users,
                totalElements: users.length,
                totalPages: 1,
            };
        } catch (error) {
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
            const response = await api.post("/api/users", userData);
            return mapUserDTOToUI(response.data);
        } catch (error) {
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
