import React from "react";
import TestPages from "../pages/TestPages";
import RoleList from "../pages/RoleList";
import { Navigate } from "react-router-dom";
const routes = [
  // {
  //   path: "/",
  //   element: <TestPages />,
  // },
  {
    path: "/",
    element: <Navigate to="/roles" replace />,
  },
  {
    path: "/roles",
    element: <RoleList />,
  },
];

export default routes;
