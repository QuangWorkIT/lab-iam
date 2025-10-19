import TestPages from "../pages/TestPages.jsx";
import LoginPage from "../pages/auths/LoginPage.jsx";
import UserListPage from "../pages/users/UserListPage.jsx";
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
    path: "/login",
    element: <LoginPage />,
  }
];

export default routes;
