import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  user: null,
  isAuthenticated: false,
  userRoles: [], // Khởi tạo mảng rỗng thay vì undefined
  loading: false,
  error: null,
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    login: (state, action) => {
      const { token, userInfo } = action.payload;
      state.token = token;
      state.userInfo = userInfo;
      localStorage.setItem("token", token);
    },
    logout: (state) => {
      state.token = null;
      state.userInfo = null;
      localStorage.removeItem("token");
    },
  },
});

export const { login, logout } = userSlice.actions;
export default userSlice.reducer;
