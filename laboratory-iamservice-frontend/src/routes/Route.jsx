import React from "react";
import TestPages from "../pages/TestPages";
import RoleList from "../pages/role/RoleList";
import { Navigate } from "react-router-dom";
// import UserListPage from "../pages/users/UserListPage";
// import CreateUserPage from "../pages/users/CreateUserPage";


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
  // {
  //   path: "/users",
  //   element: <UserListPage />,
  // },
  // {
  //   path: "/users/create",
  //   element: <CreateUserPage />,
  // },
];

export default routes;