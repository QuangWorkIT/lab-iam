import { Link, useLocation } from "react-router-dom";
import { SidebarIcon } from "../layout/Sidebar";
import { motion, AnimatePresence } from "motion/react";

export default function MobileSidebar({ isOpen, menuItems, toggleSideBar }) {
    const location = useLocation();

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Background overlay */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 0.5 }}
                        exit={{ opacity: 0 }}
                        onClick={toggleSideBar}
                        transition={{ duration: 0.2 }}
                        className="fixed inset-0 bg-black z-[998]"
                    />

                    {/* Sidebar */}
                    <motion.div
                        initial={{ x: "-100%", opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: "-100%", opacity: 0 }}
                        transition={{ duration: 0.25 }}
                        className="fixed top-0 left-0 z-[999] w-[250px] h-screen 
                        bg-[#fe535b] text-white pt-5 shadow-xl"
                    >
                        {menuItems.map((item, index) => (
                            <Link
                                to={item.path}
                                key={index}
                                className={`flex items-center w-full px-2 mb-5 transition-all duration-200 ease-in-out hover:cursor-pointer 
                                ${isOpen ? "hover:bg-white/20 rounded-r-full" : "bg-transparent hover:bg-transparent"}
                                ${isOpen && location.pathname === item.path && "bg-[#FFFFFF33]"}
                                ${index === 0 && "mt-4"}
                                `}
            
                            >
                                <SidebarIcon
                                    icon={<item.icon size={24} />}
                                    isSideBarOpen={true}
                                />

                                <span className="text-[15px] whitespace-nowrap">
                                    {item.desc}
                                </span>
                            </Link>
                        ))}
                    </motion.div>
                </>
            )}
        </AnimatePresence>

    );
}
