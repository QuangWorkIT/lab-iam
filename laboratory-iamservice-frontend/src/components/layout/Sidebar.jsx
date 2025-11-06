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

  // Kiểm tra quyền truy cập
  const hasAccess = (requiredRoles) => {
    if (!requiredRoles || requiredRoles.length === 0) return true;
    if (!userInfo) return false; // Thêm kiểm tra này
    return requiredRoles.some((role) => userInfo.role.includes(role));
  };

  // Định nghĩa menu items
  const menuItems = [
    { path: "/home", icon: <FaHome size={20} />, roles: [], desc: "Home" },
    {
      path: "/roles",
      icon: <FaUsers size={20} />,
      roles: ["ROLE_ADMIN"],
      desc: "Role management",
    },
    {
      path: "/users",
      icon: <FaUserCog size={20} />,
      roles: ["ROLE_ADMIN", "ROLE_LAB_MANAGER"],
      desc: "User management",
    }, // User management
    {
      path: "/accounts",
      icon: <FaUserCheck size={20} />,
      roles: ["ROLE_ADMIN"],
      desc: "Account management",
    }, // Account status management
    {
      path: "/test",
      icon: <FaFlask size={20} />,
      roles: ["ROLE_ADMIN", "ROLE_LAB_MANAGER"],
      desc: "Laboratory test",
    },
    {
      path: "/test",
      icon: <FaTools size={20} />,
      roles: ["ROLE_ADMIN", "ROLE_LAB_MANAGER", "ROLE_TECHNICIAN"],
      desc: "Laboratory test",
    },
    {
      path: "/test",
      icon: <FaShieldAlt size={20} />,
      roles: ["ROLE_ADMIN"],
      desc: "Laboratory test",
    },
    {
      path: "/test",
      icon: <FaCalendarAlt size={20} />,
      roles: ["ROLE_LAB_MANAGER"],
      desc: "Laboratory test",
    },
    {
      path: "/test",
      icon: <FaChartLine size={20} />,
      roles: ["ROLE_ADMIN", "ROLE_LAB_MANAGER"],
      desc: "Laboratory test",
    },
  ];

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

      {menuItems.map(
        (item, index) =>
          hasAccess(item.roles) && (
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
          )
      )}
    </div>
  );
}
