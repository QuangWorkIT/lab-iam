import { combineReducers } from "@reduxjs/toolkit";
import userReducer from "./features/userSlice";
import roleReducer from "./features/roleSlice";
import userManagementReducer from "./features/userManagementSlice";
import accountReducer from "./features/accountSlice";

const rootReducer = combineReducers({
  user: userReducer,                    // Authentication & current user info
  roles: roleReducer,                   // Role management
  users: userManagementReducer,         // User management (list, create, etc.)
  accounts: accountReducer,             // Account status management
});

export default rootReducer;
