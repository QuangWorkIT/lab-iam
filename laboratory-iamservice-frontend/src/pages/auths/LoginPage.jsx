import LoginForm from "../../components/common/LoginForm"
import {
    ForwardOutlined,
    LeftCircleOutlined
} from '@ant-design/icons';
import { motion, AnimatePresence } from "motion/react"
import { useState } from "react";
import { Button } from "antd";
import ForgetPassForm from "../../components/common/ForgetPassForm";
function LoginPage() {
    const welcomeText = "Welcome Back"
    const sentence1 = "To keep connected with us, please login with your personal info"
    const [isResetPassWord, setIsResetPassWord] = useState(false)
    return (
        <div className="w-full h-full min-h-screen flex flex-col items-center justify-center bg-[#E1E7EF]">
            <div className="flex w-full h-170 p-20">
                {/* hero component */}
                <div className="hidden lg:flex lg:flex-1 bg-white relative">
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="flex absolute left-25 -translate-y-20 w-[38rem] h-[42rem] bg-[#FE535B] flex-col justify-center text-white px-10">
                        <div className="absolute p-4 top-1/2 -translate-y-1/2 right-[-10px] h-25 w-25 rounded-full bg-white">
                            <div className="w-full h-full rounded-full bg-[#FE535B] flex justify-center items-center 
                                            hover:cursor-pointer hover:scale-115 hover:bg-[#fca9ad] 
                                            transition-all duration-300 ease-in-out">
                                <motion.div
                                    initial={{ opacity: 0, rotate: 540 }}
                                    animate={{ rotate: isResetPassWord ? 540 : 0, opacity: 1 }}
                                    whileHover={!isResetPassWord ? { rotate: -360 } : {}}
                                    transition={{ duration: 0.4, ease: "easeInOut" }}
                                    onClick={() => setIsResetPassWord(false)}
                                >
                                    <ForwardOutlined style={{ fontSize: "38px", marginLeft: "7px" }} />
                                </motion.div>
                            </div>
                        </div>
                        <div className="text-5xl font-bold ml-10 mb-1 cursor-default" >
                            {welcomeText.split(" ").map((word, index) => {
                                return (
                                    <span key={index}>
                                        <motion.span
                                            initial={{ opacity: 0, y: -20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ duration: 0.3, ease: "easeInOut", delay: index * 0.1 }}
                                            className="mb-3 inline-block transform transition-transform duration-300 hover:translate-y-[-10px]">
                                            {word}{" "}
                                        </motion.span>
                                        {word === "Welcome" && <br />}
                                    </span>
                                )
                            })}
                        </div>
                        <motion.div
                            className="w-38 h-[4px] bg-white mb-4 ml-10"
                            initial={{ opacity: 0, x: -50 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{
                                duration: 0.6,
                                ease: "easeInOut",
                            }}
                        />
                        <p className="italic text-lg leading-relaxed ml-10">
                            {sentence1.split(" ").map((word, index) => {
                                return (
                                    <motion.span
                                        initial={{ opacity: 0, y: -20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.2, delay: index * 0.09, ease: "linear" }}
                                        key={index + 1}
                                    >
                                        {word}{" "}
                                        {word === "us," && <br />}
                                    </motion.span>
                                )
                            })}
                        </p>
                    </motion.div>
                </div>

                {/* login form */}
                <div className="flex-1 bg-white flex justify-center">

                    <AnimatePresence mode="wait">
                        {isResetPassWord ? (
                            <motion.div
                                key={"forget"}
                                initial={{ opacity: 0, x: 10, y: -10 }}
                                animate={{ opacity: 1, x: 0, y: 0 }}
                                exit={{ opacity: 0, x: -10, y: 10 }}
                                transition={{ duration: 0.5, ease: "easeInOut" }}
                                className="w-full"
                            >
                                <ForgetPassForm setIsResetPassWord={setIsResetPassWord}></ForgetPassForm>
                            </motion.div>
                        ) : (
                            <motion.div
                                key={"login"}
                                initial={{ opacity: 0, x: 10, y: -10 }}
                                animate={{ opacity: 1, x: 0, y: 0 }}
                                exit={{ opacity: 0, x: -10, y: 10 }}
                                transition={{ duration: 0.5, ease: "easeInOut" }}
                                className="w-full"
                            >
                                <LoginForm setIsResetPassWord={setIsResetPassWord}></LoginForm>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

            </div>
        </div >
    )
}

export default LoginPage
