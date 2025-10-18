import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../configs/axios";

// Async thunks for API calls
export const fetchRoles = createAsyncThunk(
  "roles/fetchRoles",
  async (params = {}, { rejectWithValue }) => {
    try {
      // Chuẩn hóa và map tham số
      const {
        sortBy = "name",
        sortDir = "asc",
        keyword,
        fromDate, // hiện backend chưa hỗ trợ
        toDate, // hiện backend chưa hỗ trợ
        page = 0,
        size = 10,
      } = params;

      // Nếu có keyword hoặc khoảng ngày => dùng API search tổng hợp
      if ((keyword && keyword.trim() !== "") || fromDate || toDate) {
        const qp = new URLSearchParams();
        if (keyword && keyword.trim() !== "") {
          qp.append("q", keyword.trim()); // tham số mới
          qp.append("name", keyword.trim()); // giữ tương thích cũ
        }
        if (fromDate) qp.append("fromDate", fromDate);
        if (toDate) qp.append("toDate", toDate);
        if (sortBy) qp.append("sortBy", sortBy);
        if (sortDir) qp.append("direction", sortDir);
        const response = await api.get(`/roles/search?${qp.toString()}`);
        // Chuẩn hóa dữ liệu trả về dạng thống nhất
        return {
          roles: response.data || [],
          currentPage: 0,
          totalItems: Array.isArray(response.data) ? response.data.length : 0,
          totalPages: 1,
          pageSize: Array.isArray(response.data) ? response.data.length : size,
        };
      }

      // Nếu có tham số phân trang/sắp xếp => dùng API /paged
      const qp = new URLSearchParams();
      // page có thể là 0 nên cần check khác null/undefined
      if (page !== undefined && page !== null) qp.append("page", page);
      if (size !== undefined && size !== null) qp.append("size", size);
      if (sortBy) qp.append("sortBy", sortBy);
      if (sortDir) qp.append("direction", sortDir);

      const response = await api.get(`/roles/paged?${qp.toString()}`);
      const data = response.data || {};
      // Backend trả { roles, currentPage, totalItems, totalPages }
      if (Array.isArray(data.roles)) {
        return {
          roles: data.roles,
          currentPage: data.currentPage ?? page,
          totalItems: data.totalItems ?? data.roles.length,
          totalPages: data.totalPages ?? 1,
          pageSize: size,
        };
      }

      // Fallback: gọi /roles (không phân trang)
      const allRes = await api.get(`/roles`);
      return {
        roles: allRes.data || [],
        currentPage: 0,
        totalItems: Array.isArray(allRes.data) ? allRes.data.length : 0,
        totalPages: 1,
        pageSize: Array.isArray(allRes.data) ? allRes.data.length : size,
      };
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
      const response = await api.get(`/roles/${code}`);
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
      const response = await api.post(`/roles`, roleData);
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
      const response = await api.put(`/roles/${code}`, roleData);
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
      await api.delete(`/roles/${code}`);
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
  totalItems: 0,
  totalPages: 0,
  currentPage: 0,
  pageSize: 10,
  sortBy: "name", // Default sort by name
  sortDir: "asc", // Default sort direction
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
        // payload đã được chuẩn hóa ở thunk
        state.roles = payload.roles || [];
        state.totalItems = payload.totalItems ?? state.roles.length;
        state.totalPages = payload.totalPages ?? 1;
        state.currentPage = payload.currentPage ?? 0;
        state.pageSize = payload.pageSize ?? state.pageSize;
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
