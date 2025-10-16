import React from "react";
import LoginPage from "../pages/Auth/LoginPage.jsx";

const routes = [
  {
    path: "/",
    element: <div>hello</div>,
  },

  {
    path: "/login",
    element: <LoginPage />
  }

];

export default routes;