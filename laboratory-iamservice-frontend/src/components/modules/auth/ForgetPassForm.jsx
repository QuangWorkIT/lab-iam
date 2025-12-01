import { Button, Form, Input, ConfigProvider, Spin } from "antd";
import { Segmented } from "antd";
import { useState } from "react";
import { CheckOutlined } from "@ant-design/icons";
import { motion, AnimatePresence } from "motion/react";
import { theme } from "../../common/LoginForm.jsx";
import publicApi from "../../../configs/publicAxios.js";
import { toast } from "react-toastify";
import VerifyOpt from "./VerifyOtpForm.jsx";
import ResetPassWord from "./ResetPassWordForm.jsx";
import { LuMail } from "react-icons/lu";
import { ArrowLeftOutlined } from '@ant-design/icons';

function ForgetPassForm({ setIsResetPassWord }) {
    const [form] = Form.useForm();
    const [isOptOpen, setIsOptOpen] = useState(false)
    const [isResetPassWordOpen, setIsResetPassWordOpen] = useState(false)
    const [verifyingEmail, setverifyingEmail] = useState(null)
    const [currentUser, setCurrentUser] = useState(null)

    const verifyEmail = async (values) => {
        try {
            setverifyingEmail("isVerifying")
            const response = await publicApi.post("/api/auth/user-lookup", {
                data: values["email"]
            })
            setCurrentUser(response.data.data)

            await publicApi.post("/api/auth/otp-send", { email: response.data.data.email })
            setverifyingEmail("success")
            setTimeout(() => {
                setIsOptOpen(true)
            }, 700);
            form.resetFields(["email"])
        } catch (error) {

            console.error("Error verify email", error)
            setverifyingEmail(null)

            const errMess = error.response?.data?.message
            if (errMess && errMess === "User not found")
                toast.error( "Email not found!", {
                    className: "!text-[#FF0000] font-bold text-[14px]"
                })
            else
                toast.error("Error verify email", {
                    className: "!text-[#FF0000] font-bold text-[14px]"
                })
        }
    };

    return (
        <div className="relative h-full overflow-hidden">
            <Button
                shape="circle"
                size="large"
                onClick={() => {
                    setIsResetPassWord(false)
                }}
                className="!absolute top-10 left-10 lg:!hidden">
                <ArrowLeftOutlined />
            </Button>
            <AnimatePresence>
                {isResetPassWordOpen ? (
                    <motion.div
                        key={"resetPass"}
                        initial={{ opacity: 0, x: 10, y: -10 }}
                        animate={{ opacity: 1, x: 0, y: 0 }}
                        exit={{ opacity: 0, x: -10, y: 10 }}
                        transition={{ duration: 0.5, ease: "easeInOut" }}
                        className="h-full"
                    >
                        <ResetPassWord setIsResetPassWord={setIsResetPassWord} userId={currentUser?.userId || ""} />
                    </motion.div>
                )
                    : isOptOpen ? (
                        <motion.div
                            key={"optOpen"}
                            initial={{ opacity: 0, x: 10, y: -10 }}
                            animate={{ opacity: 1, x: 0, y: 0 }}
                            exit={{ opacity: 0, x: -10, y: 10 }}
                            transition={{ duration: 0.5, ease: "easeInOut" }}
                            className="h-full"
                        >
                            <VerifyOpt data={currentUser?.email || ""} setIsResetPassWordOpen={setIsResetPassWordOpen} />
                        </motion.div>
                    )
                        : (
                            (
                                <motion.div
                                    key={"confirmEmailOrPhone"}
                                    initial={{ opacity: 0, x: 10, y: -10 }}
                                    animate={{ opacity: 1, x: 0, y: 0 }}
                                    exit={{ opacity: 0, x: -10, y: 10 }}
                                    transition={{ duration: 0.5, ease: "easeInOut" }}
                                    className="flex flex-col gap-5 items-center justify-center h-full min-w-[300px]">
                                    <div className="text-center">
                                        <p className="text-2xl md:text-[27px] font-semibold ml-2" style={{ marginBottom: "15px" }}>Forget your password?</p>
                                        <p className="text-sm md:text-[16px]" style={{ margin: 0 }}>Please enter your email</p>
                                    </div >


                                    <Form
                                        form={form}
                                        name="verifyEmail"
                                        initialValues={{ remember: true }}
                                        onFinish={verifyEmail}
                                        autoComplete="off"
                                    >
                                        <AnimatePresence mode="wait">
                                            (<motion.div
                                                key="email"
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: -20 }}
                                                transition={{ duration: 0.25, ease: "easeOut" }}
                                            >
                                                <ConfigProvider theme={theme}>
                                                    <Form.Item
                                                        name="email"
                                                        rules={[
                                                            { required: true, message: "Please input an email!" },
                                                            { max: 300, message: "Please enter a valid email!" }
                                                        ]}
                                                    >
                                                        <Input
                                                            prefix={<LuMail />}
                                                            type="email"
                                                            placeholder="Enter your email"
                                                            className="!w-[250px] md:!w-[320px]"
                                                            onFocus={(e) => {
                                                                const wrapper = e.target.closest(".ant-input-affix-wrapper");
                                                                if (wrapper) {
                                                                    wrapper.style.border = "1px solid #FF5A5A";
                                                                    wrapper.style.boxShadow = "none";
                                                                }
                                                            }}
                                                            onBlur={(e) => {
                                                                const wrapper = e.target.closest(".ant-input-affix-wrapper");
                                                                if (wrapper) {
                                                                    wrapper.style.border = "1px solid #CCC";
                                                                    wrapper.style.boxShadow = "none";
                                                                }
                                                            }}
                                                        />
                                                    </Form.Item>
                                                </ConfigProvider>
                                            </motion.div>)
                                        </AnimatePresence>

                                        <Form.Item
                                            label={null}
                                            className="flex justify-center"
                                            style={{ marginTop: "50px" }}
                                        >
                                            <Button
                                                className={`transition-all duration-300 ease-in-out 
                                                    ${verifyingEmail === "success" ? "w-40" : "w-30"}`}
                                                style={{ backgroundColor: "#FF5A5A", color: "white" }} // primary color
                                                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#FF3A3A"} // hover
                                                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "#FF5A5A"}
                                                htmlType="submit"
                                                loading={verifyingEmail === "isVerifying"}
                                            >
                                                {verifyingEmail === "success" ? (
                                                    <motion.div
                                                        initial={{ opacity: 0 }}
                                                        animate={{ opacity: 1 }}
                                                        transition={{ duration: 0.3, ease: "easeInOut" }}
                                                        className="flex items-center gap-1"
                                                    >
                                                        <CheckOutlined /> Sent OTP
                                                    </motion.div>
                                                ) : (
                                                    "Next"
                                                )}
                                            </Button>

                                        </Form.Item>
                                    </Form>
                                </motion.div >
                            )
                        )}
            </AnimatePresence>
        </div >
    );
}

export default ForgetPassForm;
