import { useState } from "react";
import { useLocation, Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { motion } from "motion/react";
import {
  FaHome,
  FaUsers,
  FaFlask,
  FaTools,
  FaShieldAlt,
  FaCalendarAlt,
  FaChartLine,
  FaBars,
  FaUserCog,
  FaUserCheck,
} from "react-icons/fa";

const MENU_PRIVILEGES = {
  HOME: "READ_ONLY",
  ROLE_MANAGEMENT: "VIEW_ROLE",
  USER_MANAGEMENT: "VIEW_USER",
  LAB_TESTS: "READ_ONLY",
  EQUIPMENT_MANAGEMENT: "VIEW_INSTRUMENT",
  BLOOD_TESTING_MANAGEMENT: "EXECUTE_BLOOD_TESTING",
  ANALYTICS: "VIEW_EVENT_LOGS",
};

// Inline component
function SidebarIcon({ icon, active, to = "#", isSideBarOpen }) {
  return (
    <Link to={to}>
      <div
        className={`w-10 h-10 rounded-[5px] flex justify-center items-center cursor-pointer transition-all duration-300 ease-in-out
      ${active ? "bg-[#FFFFFF33]" : "bg-transparent"}
      ${!isSideBarOpen && "hover:bg-[#FFFFFF33]"}`}
      >
        {icon}
      </div>
    </Link>
  );
}

export default function Sidebar() {
  const location = useLocation();
  const { userInfo } = useSelector((state) => state.user);
  const [rotation, setRotation] = useState(0);
  const [isSideBarOpen, setIsSideBarOpen] = useState(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme) {
      const parsed = JSON.parse(savedTheme);
      return parsed.isSideBarOpen ?? false;
    }
    return false;
  });

  const handleRotate = () => {
    setRotation((prev) => prev + 360);
    setIsSideBarOpen(!isSideBarOpen);
    const theme = { isSideBarOpen: !isSideBarOpen };
    localStorage.setItem("theme", JSON.stringify(theme));
  };

  // Demo data - sử dụng dữ liệu giả lập thay vì lấy từ Redux
  // const demoUserRoles = ["ADMIN", "USER"]; // Giả lập quyền admin

  const hasPrivilege = (privilege) => {
    if (!privilege) return true;
    if (!userInfo?.privileges) return false;
    return (
      Array.isArray(userInfo.privileges) &&
      userInfo.privileges.includes(privilege)
    );
  };

  // Định nghĩa menu items
  const menuItems = [
    {
      path: "/home",
      icon: <FaHome size={20} />,
      privilege: MENU_PRIVILEGES.HOME,
      desc: "Home",
    },
    {
      path: "/roles",
      icon: <FaUsers size={20} />,
      privilege: MENU_PRIVILEGES.ROLE_MANAGEMENT,
      desc: "Role management",
    },
    {
      path: "/users",
      icon: <FaUserCog size={20} />,
      privilege: MENU_PRIVILEGES.USER_MANAGEMENT,
      desc: "User management",
    }, // User management
    {
      path: "/accounts",
      icon: <FaUserCheck size={20} />,
      privilege: MENU_PRIVILEGES.USER_MANAGEMENT,
      desc: "Account management",
    }, // Account status management
    {
      path: "/test",
      icon: <FaFlask size={20} />,
      privilege: MENU_PRIVILEGES.LAB_TESTS,
      desc: "Laboratory test",
    },
    {
      path: "/test",
      icon: <FaTools size={20} />,
      privilege: MENU_PRIVILEGES.EQUIPMENT_MANAGEMENT,
      desc: "Lab equipment",
    },
    {
      path: "/test",
      icon: <FaShieldAlt size={20} />,
      privilege: MENU_PRIVILEGES.BLOOD_TESTING_MANAGEMENT,
      desc: "Laboratory test",
    },
    {
      path: "/test",
      icon: <FaCalendarAlt size={20} />,
      privilege: MENU_PRIVILEGES.BLOOD_TESTING_MANAGEMENT,
      desc: "Laboratory test",
    },
    {
    path: "/test",
      icon: <FaChartLine size={20} />,
      privilege: MENU_PRIVILEGES.ANALYTICS,
      desc: "Analytics",
    },
  ];

  const visibleMenuItems = menuItems.filter((item) =>
    hasPrivilege(item.privilege)
  );

const visibleMenuItems = menuItems.filter((item) =>
    hasPrivilege(item.privilege)
  );

  return (
    <div
      className={`bg-[#fe535b] text-white flex flex-col items-center pt-[18px]
          z-[100] transition-all duration-200 ease-in-out
        ${isSideBarOpen ? "w-[250px] " : "w-[100px]"}`}
    >
      <div
        style={{
          padding: "6px",
          borderBottom: "1px solid rgba(255,255,255,0.2)",
          width: "100%",
          display: "flex",
          justifyContent: "center",
          marginBottom: "20px",
        }}
      >
        <motion.div
          animate={{ rotate: rotation }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
        >
          <FaBars
            onClick={handleRotate}
            className="text-[24px] hover:cursor-pointer hover:scale-120 transition-all duration-200"
          />
        </motion.div>
      </div>

      {visibleMenuItems.map((item, index) => (
        <Link
          to={item.path}
          key={index}
          className={`flex items-center w-full px-2 mb-5 transition-all duration-200 ease-in-out
               hover:cursor-pointer hover:scale-110
                  ${
                    isSideBarOpen
                      ? " hover:bg-white/20 rounded-r-full "
                      : "bg-transparent hover:bg-transparent"
                  }
                  ${
                    isSideBarOpen &&
                    location.pathname === item.path &&
                    "bg-[#FFFFFF33]"
                  }`}
        >
          <div className="pl-[22px]">
            <SidebarIcon
              icon={item.icon}
              to={item.path}
              active={!isSideBarOpen && location.pathname === item.path}
              isSideBarOpen={isSideBarOpen}
            />
          </div>
          {isSideBarOpen && (
            <span className="pt-1 whitespace-nowrap text-[14px] transition-all duration-300 ease-in-out hover:cursor-pointer">
              {item.desc}
            </span>
          )}
        </Link>
      ))}
    </div>
  );
}
