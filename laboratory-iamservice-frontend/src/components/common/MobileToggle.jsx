import { useEffect } from "react";
import { FaBars } from "react-icons/fa";

export default function MobileToggle({ isOpen, onToggle }) {
    useEffect(() => {
        const handleScrollLock = () => {
            const isMobile = window.innerWidth <= 780;
            if (isOpen && isMobile) {
                document.body.style.overflowY = "hidden";
            } else {
                document.body.style.overflowY = "auto";
            }
        };

        handleScrollLock(); // apply on mount or change
        window.addEventListener("resize", handleScrollLock); // update on resize

        return () => {
            document.body.style.overflowY = "auto";
            window.removeEventListener("resize", handleScrollLock);
        };
    }, [isOpen])

    return (
        <div className="h-[55px] w-full p-3 flex items-center z-[999]">
            <div
                className={`p-2 rounded-[5px] transition-all duration-200 hover:scale-110
            ${isOpen ? "bg-white/30" : ""}`}
                onClick={onToggle}
            >
                <FaBars size={24} />
            </div>
        </div>
    );
}
