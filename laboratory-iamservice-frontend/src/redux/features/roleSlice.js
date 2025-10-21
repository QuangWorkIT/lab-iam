import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../configs/axios";

// Async thunks for API calls
// ...existing code...
export const fetchRoles = createAsyncThunk(
  "roles/fetchRoles",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get(`/api/roles`); // Lấy toàn bộ roles
      const data = response.data || [];
      return { roles: Array.isArray(data) ? data : data.roles || [] };
    } catch (error) {
      const errorMsg =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        "Failed to fetch roles";
      return rejectWithValue(errorMsg);
    }
  }
);

export const getRoleByCode = createAsyncThunk(
  "roles/getRoleByCode",
  async (code, { rejectWithValue }) => {
    try {
      const response = await api.get(`/api/roles/${code}`);
      return response.data;
    } catch (error) {
      const errorMsg =
        error.response?.data?.message ||
        error.response?.data ||
        error.message ||
        "Failed to get role details";
      return rejectWithValue(errorMsg);
    }
  }
);

export const createRole = createAsyncThunk(
  "roles/createRole",
  async (roleData, { rejectWithValue }) => {
    try {
      const response = await api.post(`/api/roles`, roleData);
      return response.data;
    } catch (error) {
      const errorMsg =
        error.response?.data?.message ||
        error.response?.data ||
        error.message ||
        "Failed to create role";
      return rejectWithValue(errorMsg);
    }
  }
);

export const updateRole = createAsyncThunk(
  "roles/updateRole",
  async ({ code, roleData }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/api/roles/${code}`, roleData);
      return response.data;
    } catch (error) {
      const errorMsg =
        error.response?.data?.message ||
        error.response?.data ||
        error.message ||
        "Failed to update role";
      return rejectWithValue(errorMsg);
    }
  }
);

export const deleteRole = createAsyncThunk(
  "roles/deleteRole",
  async (code, { rejectWithValue }) => {
    try {
      await api.delete(`/api/roles/${code}`);
      return code;
    } catch (error) {
      const errorMsg =
        error.response?.data?.message ||
        error.response?.data ||
        error.message ||
        "Failed to delete role";
      return rejectWithValue(errorMsg);
    }
  }
);

// Initial state
const initialState = {
  roles: [],
  role: null,
  loading: false,
  error: null,
  success: false,
};

// Create slice
const roleSlice = createSlice({
  name: "roles",
  initialState,
  reducers: {
    resetRoleState: (state) => {
      state.loading = false;
      state.error = null;
      state.success = false;
    },
    setPageSize: (state, action) => {
      state.pageSize = action.payload;
    },
    setSortConfig: (state, action) => {
      state.sortBy = action.payload.key;
      state.sortDir = action.payload.direction;
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchRoles
      .addCase(fetchRoles.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRoles.fulfilled, (state, action) => {
        state.loading = false;
        const payload = action.payload || {};
        state.roles = payload.roles || [];
        state.success = true;
      })
      .addCase(fetchRoles.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
      })

      // getRoleByCode
      .addCase(getRoleByCode.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getRoleByCode.fulfilled, (state, action) => {
        state.loading = false;
        state.role = action.payload;
      })
      .addCase(getRoleByCode.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // createRole
      .addCase(createRole.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createRole.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        // Nếu muốn thêm role mới vào state
        state.roles.push(action.payload);
      })
      .addCase(createRole.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // updateRole
      .addCase(updateRole.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateRole.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        // Cập nhật role trong state
        const index = state.roles.findIndex(
          (role) => role.code === action.payload.code
        );
        if (index !== -1) {
          state.roles[index] = action.payload;
        }
      })
      .addCase(updateRole.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // deleteRole
      .addCase(deleteRole.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteRole.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        // Xóa role khỏi state
        state.roles = state.roles.filter(
          (role) => role.code !== action.payload
        );
      })
      .addCase(deleteRole.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

// Export actions and reducer
export const { resetRoleState, setPageSize, setSortConfig } = roleSlice.actions;

export default roleSlice.reducer;
