import { use } from "react";
import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ element: Component, allowedRoles, privilege }) => {
  const token = useSelector((state) => state.user.token);
  const userInfo = useSelector((state) => state.user.userInfo);
  const loading = useSelector((state) => state.user.loading);

  if(loading) {
    return <>App loading...</>
  }
  
  if (!token || !userInfo) {
    return <Navigate to="/login" replace />;
  }

  // Check role if provided
  if (allowedRoles && !allowedRoles.includes(userInfo.role)) {
    return <Navigate to="/home" replace />;
  }

  // Check privilege if provided
  if (privilege && !userInfo.privileges?.includes(privilege)) {
    return <Navigate to="/home" replace />;
  }

  return <Component />;
};

export default ProtectedRoute;
