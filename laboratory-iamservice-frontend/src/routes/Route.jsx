import React from "react";
import TestPages from "../pages/TestPages";
import UserListPage from "../pages/users/UserListPage";
import CreateUserPage from "../pages/users/CreateUserPage";

const routes = [
  {
    path: "/",
    element: <TestPages />,
  },
  {
    path: "/users",
    element: <UserListPage />,
  },
  {
    path: "/users/create",
    element: <CreateUserPage />,
  },
];

export default routes;
