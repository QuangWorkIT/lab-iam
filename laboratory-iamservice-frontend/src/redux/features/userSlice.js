import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../configs/axios.js";
import { toast } from "react-toastify";

const initialState = {
  userInfo: null,
  token: null,
  loading: false,
  bannedElements: []
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
    },
    addBannedElement: (state, action) => {
      state.bannedElements.push(action.payload);
    },
    removerBannedElement: (state, action) => {
      state.bannedElements = state.bannedElements.filter(item => item !== action.payload)
    }
  },
  extraReducers: (builder) => {
    builder
      // merge persisted data to the initial state
      .addCase("persist/REHYDRATE", (state, action) => {
        if (action.payload?.user) {
          return {
            ...initialState,
            ...action.payload.user, 
          };
        }
      })
      .addCase(logout.fulfilled, (state) => {
        state.token = null
        state.userInfo = null
        localStorage.removeItem("token")
        toast.success("Logout success")
      })
      .addCase(logout.rejected, (state, action) => {
        state.token = null
        state.userInfo = null
        localStorage.removeItem("token")
        console.error(action.payload)
      })
  }
});

export const { login, addBannedElement, removerBannedElement } = userSlice.actions;
export default userSlice.reducer;
