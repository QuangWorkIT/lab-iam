import React from "react";
import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ element: Component, allowedRoles }) => {
  const token = useSelector((state) => state.user.token);
  const userInfo = useSelector((state) => state.user.userInfo);

  // not logged in? yeet to login
  if (!token || !userInfo) {
    return <Navigate to="/login" replace />;
  }

  // user logged in but not allowed
  if (allowedRoles && !allowedRoles.includes(userInfo.role)) {
    return <Navigate to="/" replace />;
  }

  // allowed to pass
  return <Component />;
};

export default ProtectedRoute;
