import React from "react";
import { Navigate } from "react-router-dom";
import TestPages from "../pages/TestPages";
import RoleList from "../pages/role/RoleList";
import UserList from "../pages/user/UserList";
import AccountList from "../pages/account/AccountList";
import LoginPage from "../pages/auths/LoginPage.jsx";
import ProtectedRoute from "./ProtectedRoute";
import HomePage from "../pages/HomePage";

const routes = [
  {
    path: "/", // default redirect to login
    element: (
      <ProtectedRoute
        element={HomePage}
      />
    ) 
  },
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/home",
    element: <ProtectedRoute element={HomePage} />,
  },
  {
    path: "/roles",
    element: (
      <ProtectedRoute
        element={RoleList}
        allowedRoles={["ROLE_ADMIN", "ROLE_LAB_MANAGER"]}
      />
    ),
  },
  {
    path: "/users",
    element: (
      <ProtectedRoute
        element={UserList}
        allowedRoles={["ROLE_ADMIN", "ROLE_LAB_MANAGER"]}
      />
    ),
  },
  {
    path: "/accounts",
    element: (
      <ProtectedRoute
        element={AccountList}
        allowedRoles={["ROLE_ADMIN"]}
      />
    ),
  },
  {
    path: "/test",
    element: (
      <TestPages />
    ),
  },

];

export default routes;
