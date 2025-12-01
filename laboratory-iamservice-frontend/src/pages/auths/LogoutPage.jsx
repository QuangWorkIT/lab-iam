import { useNavigate } from "react-router";
import { logout } from "../../redux/features/userSlice";
import { useDispatch } from "react-redux";
import { useEffect } from "react";
import { motion } from "motion/react"
import { toast } from "react-toastify";

function LogoutPage() {
    const dispatch = useDispatch();
    const nav = useNavigate()

    useEffect(() => {
        const handleLogout = async () => {
            try {
                await dispatch(logout()).unwrap();
                nav("/login", { replace: true });
            } catch (error) {
                console.log("Error logout ", error)
                nav("/login", { replace: true });
            }
        }

        handleLogout()
    }, [dispatch, nav])


    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, repeat: Infinity }}
            className="h-screen w-screen flex items-center justify-center"
        >
            <p style={{ margin: 0, color: "#777777" }}>Logout...</p>
        </motion.div>
    )
}

export default LogoutPage
