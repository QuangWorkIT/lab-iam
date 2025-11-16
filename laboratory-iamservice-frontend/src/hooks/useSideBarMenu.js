import { useSelector } from "react-redux";
import {
  FaHome,
  FaUsers,
  FaFlask,
  FaTools,
  FaShieldAlt,
  FaCalendarAlt,
  FaChartLine,
  FaUserCog,
  FaUserCheck,
} from "react-icons/fa";


export const useSidebarMenu = () => {
  const { userInfo } = useSelector((state) => state.user);

  const hasPrivilege = (privilege) => {
    if (!privilege) return true;
    if (!userInfo?.privileges) return false;

    return (
      Array.isArray(userInfo.privileges) &&
      userInfo.privileges.includes(privilege)
    );
  };

   const menuItems = [
    { path: "/home", icon: FaHome, privilege: "READ_ONLY", desc: "Home" },
    { path: "/roles", icon: FaUsers, privilege: "VIEW_ROLE", desc: "Role management" },
    { path: "/users", icon: FaUserCog, privilege: "VIEW_USER", desc: "User management" },
    { path: "/accounts", icon: FaUserCheck, privilege: "VIEW_USER", desc: "Account management" },
    { path: "/test", icon: FaFlask, privilege: "READ_ONLY", desc: "Laboratory test" },
    { path: "/test", icon: FaTools, privilege: "VIEW_INSTRUMENT", desc: "Lab equipment" },
    { path: "/test", icon: FaShieldAlt, privilege: "EXECUTE_BLOOD_TESTING", desc: "Laboratory test" },
    { path: "/test", icon: FaCalendarAlt, privilege: "EXECUTE_BLOOD_TESTING", desc: "Laboratory test" },
    { path: "/test", icon: FaChartLine, privilege: "VIEW_EVENT_LOGS", desc: "Analytics" },
  ];

  return menuItems.filter((item) => hasPrivilege(item.privilege));
};
