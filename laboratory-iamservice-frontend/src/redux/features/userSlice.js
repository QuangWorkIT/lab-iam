import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../configs/axios.js";

const initialState = {
  user: null,
  isAuthenticated: false,
  userRoles: [], // Khởi tạo mảng rỗng thay vì undefined
  loading: false,
  error: null,
};

export const logout = createAsyncThunk("user/logout", async (_, { rejectWithValue }) => {
  try {
    await api.delete("/api/auth/logout")
    return "Logout success"
  } catch (error) {
    return rejectWithValue(error.response.data?.message || "Logout failed")
  }
})

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    login: (state, action) => {
      const { token, userInfo } = action.payload;
      state.token = token;
      state.userInfo = userInfo;
      localStorage.setItem("token", token);
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(logout.fulfilled, (state, action) => {
        console.log(action.payload)
        state.token = null
        state.userInfo = null
        localStorage.removeItem("token")
      })
      .addCase(logout.rejected, (action) => {
        console.error(action.payload)
      })
  }
});

export const { login } = userSlice.actions;
export default userSlice.reducer;
