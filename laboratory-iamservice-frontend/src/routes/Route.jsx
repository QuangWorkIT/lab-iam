import RoleList from "../pages/role/RoleList";
import UserList from "../pages/user/UserList";
import AccountList from "../pages/account/AccountList";
import LoginPage from "../pages/auths/LoginPage.jsx";
import ProtectedRoute from "./ProtectedRoute";
import HomePage from "../pages/HomePage";

const MENU_PRIVILEGES = {
  HOME: "READ_ONLY",
  ROLE_MANAGEMENT: "VIEW_ROLE",
  USER_MANAGEMENT: "VIEW_USER",
};

const routes = [
  {
    path: "/", // default redirect to login
    element: (
      <ProtectedRoute element={HomePage} privilege={MENU_PRIVILEGES.HOME}/>
    ) 
  },
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/home",
    element: <ProtectedRoute element={HomePage} privilege={MENU_PRIVILEGES.HOME} />,
  },
  {
    path: "/roles",
    element: (
      <ProtectedRoute
        element={RoleList}
         privilege={MENU_PRIVILEGES.ROLE_MANAGEMENT}/>
    ),
  },
  {
    path: "/users",
    element: (
      <ProtectedRoute
        element={UserList}
       privilege = {MENU_PRIVILEGES.USER_MANAGEMENT}
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
];

export default routes;
