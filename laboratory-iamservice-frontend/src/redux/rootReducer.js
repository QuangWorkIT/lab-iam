import { combineReducers } from "@reduxjs/toolkit";
import userReducer from "./features/userSlice";
import roleReducer from "./features/roleSlice";

const rootReducer = combineReducers({
  user: userReducer,
  roles: roleReducer,
});

export default rootReducer;
