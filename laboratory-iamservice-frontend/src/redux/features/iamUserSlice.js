import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "@/configs/axios";

// GET LIST (có phân trang, sort, filter)
export const fetchUsers = createAsyncThunk(
    "iamUsers/fetch",
    async (params, { rejectWithValue }) => {
        try {
            const res = await api.get("/api/users", { params });
            // backend nên trả { content, totalElements } theo chuẩn Spring Data
            return res.data;
        } catch (e) {
            return rejectWithValue(e.response?.data || { message: "Load users failed" });
        }
    }
);

// CREATE USER
export const createUser = createAsyncThunk(
    "iamUsers/create",
    async (payload, { rejectWithValue }) => {
        try {
            const res = await api.post("/api/users", payload);
            return res.data;
        } catch (e) {
            return rejectWithValue(e.response?.data || { message: "Create user failed" });
        }
    }
);

const iamUserSlice = createSlice({
    name: "iamUsers",
    initialState: {
        list: [],
        total: 0,
        loading: false,
        error: null,
        creating: false,
        createError: null,
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            // fetch
            .addCase(fetchUsers.pending, (s) => { s.loading = true; s.error = null; })
            .addCase(fetchUsers.fulfilled, (s, a) => {
                s.loading = false;
                s.list = a.payload?.content || a.payload || [];
                s.total = a.payload?.totalElements ?? (a.payload?.length || 0);
            })
            .addCase(fetchUsers.rejected, (s, a) => { s.loading = false; s.error = a.payload; })

            // create
            .addCase(createUser.pending, (s) => { s.creating = true; s.createError = null; })
            .addCase(createUser.fulfilled, (s) => { s.creating = false; })
            .addCase(createUser.rejected, (s, a) => { s.creating = false; s.createError = a.payload; });
    },
});

export default iamUserSlice.reducer;
