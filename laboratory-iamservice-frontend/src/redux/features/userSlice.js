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

export const fetchCurrentUser = createAsyncThunk("user/fetchCurrentUser", async (_, { rejectWithValue }) => {
  try {
    const response = await api.get("/api/auth/user-info");
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || "Failed to fetch user info");
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
    removeLocalUser: (state) => {
      state.token = null;
      state.userInfo = null;
      localStorage.removeItem("token");
    },
    updateUserInfo: (state, action) => {
      state.userInfo = { 
        ...state.userInfo, 
        ...action.payload,
        userName: action.payload.fullName,
        dateOfBirth: action.payload.birthdate
      };
    },
    addBannedElement: (state, action) => {
      state.bannedElements.push(action.payload);
    },
    removerBannedElement: (state, action) => {
      state.bannedElements = state.bannedElements.filter(e => e.type !== action.payload)
    },
    setLoading: (state, action) => {
      state.loading = action.payload
    }
  },
  extraReducers: (builder) => {
    builder
      // merge persisted data to the initial state
      .addCase("persist/REHYDRATE", (state, action) => {
        if (action.payload?.user) {
          return {
            ...state,
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
      .addCase(fetchCurrentUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchCurrentUser.fulfilled, (state, action) => {
        state.loading = false;
        state.userInfo = { ...state.userInfo, ...action.payload };
      })
      .addCase(fetchCurrentUser.rejected, (state, action) => {
        state.loading = false;
        console.error("Failed to fetch user info:", action.payload);
      })
  }
});

export const { login, removeLocalUser, updateUserInfo, addBannedElement, removerBannedElement, setLoading } = userSlice.actions;
export default userSlice.reducer;
