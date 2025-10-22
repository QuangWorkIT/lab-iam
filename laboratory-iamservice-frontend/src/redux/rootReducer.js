import { combineReducers } from "@reduxjs/toolkit";
import userReducer from "./features/userSlice";
import roleReducer from "./features/roleSlice";
import userManagementReducer from "./features/userManagementSlice";

const rootReducer = combineReducers({
  user: userReducer,                    // Authentication & current user info
  roles: roleReducer,                   // Role management
  users: userManagementReducer,         // User management (list, create, etc.)
});

export default rootReducer;
