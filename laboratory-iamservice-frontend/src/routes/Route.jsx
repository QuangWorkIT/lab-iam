import React from "react";
import TestPages from "../pages/TestPages";
import RoleList from "../pages/role/RoleList";
import { Navigate } from "react-router-dom";
import LoginPage from "../pages/auths/LoginPage.jsx";
const routes = [
  {
    path: "/",
    element: <RoleList />,
  },
  {
    path: "/roles",
    element: <RoleList />,
  },
  {
    path: "/login",
    element: <LoginPage />,
  },
];

export default routes;
