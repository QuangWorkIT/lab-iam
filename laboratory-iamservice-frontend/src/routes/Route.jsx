import React from "react";
import { Navigate } from "react-router-dom";
import TestPages from "../pages/TestPages";
import RoleList from "../pages/role/RoleList";
import LoginPage from "../pages/auths/LoginPage.jsx";
import ProtectedRoute from "./ProtectedRoute";

const routes = [
  {
    path: "/",
    element: <Navigate to="/login" replace />, // default redirect to login
  },
  {
    path: "/login",
    element: <LoginPage />,
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
    path: "/test",
    element: (
      <ProtectedRoute
        element={TestPages}
        allowedRoles={["ROLE_USER", "ROLE_OTHER"]} // whatever other roles
      />
    ),
  },
];

export default routes;
