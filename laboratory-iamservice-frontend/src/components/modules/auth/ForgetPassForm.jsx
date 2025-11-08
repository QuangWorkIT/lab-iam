import { Button, Form, Input, ConfigProvider, Spin } from "antd";
import { Segmented } from "antd";
import { useState } from "react";
import { MailOutlined, PhoneOutlined, CheckOutlined, CheckCircleOutlined } from "@ant-design/icons";
import { motion, AnimatePresence } from "motion/react";
import { theme } from "../../common/LoginForm.jsx";
import publicApi from "../../../configs/publicAxios.js";
import { toast } from "react-toastify";
import VerifyOpt from "./VerifyOtpForm.jsx";
import ResetPassWord from "./ResetPassWordForm.jsx";


function ForgetPassForm({ setIsResetPassWord }) {
    const [form] = Form.useForm();
    const [option, setOption] = useState("email");
    const [isOptOpen, setIsOptOpen] = useState(false)
    const [isResetPassWordOpen, setIsResetPassWordOpen] = useState(false)
    const [verifyingEmailOrPhone, setVerifyingEmailOrPhone] = useState(null)
    const [currentUser, setCurrentUser] = useState(null)

    const verifyEmailOrPhone = async (values) => {
        try {
            setVerifyingEmailOrPhone("isVerifying")
            const response = await publicApi.post("/api/auth/user-lookup", {
                option: option,
                data: values[option]
            })
            setCurrentUser(response.data.data)

            await publicApi.post("/api/auth/otp-send", { email: response.data.data.email })
            setVerifyingEmailOrPhone("success")
            setTimeout(() => {
                setIsOptOpen(true)
            }, 700);
            form.resetFields([option])
        } catch (error) {
            console.error("Error verify email or phone", error)
            setVerifyingEmailOrPhone(null)
            form.resetFields([option])
            const errMess = error.response?.data?.message
            if (errMess && errMess === "User not found") toast.error(option === "email" ? "Email not found!" : "Phone not found!")
            else toast.error("Error verify email or phone")
        }
    };

    return (
        <div className="h-full overflow-hidden">
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
                        <ResetPassWord setIsResetPassWord={setIsResetPassWord} userId={currentUser?.userId || "]"} />
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
                            <VerifyOpt data={currentUser.email} setIsResetPassWordOpen={setIsResetPassWordOpen} />
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
                                        <p className="text-[30px]" style={{ marginBottom: "15px" }}>Forget your password?</p>
                                        <p>Please enter your email or phone</p>
                                    </div >

                                    <div className="mb-3">
                                        <Segmented
                                            value={option}
                                            onChange={(value) => setOption(value)}
                                            options={[
                                                { label: "Phone", value: "phone" },
                                                { label: "Email", value: "email" },
                                            ]}
                                            className="
                                        border-none shadow-none !bg-transparent
                                        [&_.ant-segmented-item]:!rounded-full
                                        [&_.ant-segmented-item]:!transition-all
                                        [&_.ant-segmented-item]:!duration-200
                                        [&_.ant-segmented-item]:!bg-white
                                        [&_.ant-segmented-item]:!text-black
                                        [&_.ant-segmented-item]:!font-medium
                                        [&_.ant-segmented-item]:!px-5
                                        [&_.ant-segmented-item]:!py-1.5
                                        [&_.ant-segmented-item-selected]:!bg-[#ff5c5c]
                                        [&_.ant-segmented-item-selected]:!text-white
                                        [&_.ant-segmented-item-selected]:!font-semibold
                                        [&_.ant-segmented-item-selected]:!shadow-md
                                        "
                                        />
                                    </div>

                                    <Form
                                        form={form}
                                        name="verifyEmailOrPhone"
                                        initialValues={{ remember: true }}
                                        onFinish={verifyEmailOrPhone}
                                        autoComplete="off"
                                    >
                                        <AnimatePresence mode="wait">
                                            {option === "email" ? (
                                                <motion.div
                                                    key="email"
                                                    initial={{ opacity: 0, y: 20 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    exit={{ opacity: 0, y: -20 }}
                                                    transition={{ duration: 0.25, ease: "easeOut" }}
                                                >
                                                    <ConfigProvider theme={theme}>
                                                        <Form.Item
                                                            className="w-[300px]"
                                                            name="email"
                                                            rules={[
                                                                { required: true, message: "Please input an email!" },
                                                                { max: 300, message: "Please enter a valid email!" }
                                                            ]}
                                                        >
                                                            <Input
                                                                prefix={<MailOutlined />}
                                                                type="email"
                                                                placeholder="Enter your email"
                                                                style={{ width: "320px" }}
                                                            />
                                                        </Form.Item>
                                                    </ConfigProvider>
                                                </motion.div>
                                            ) : (
                                                <motion.div
                                                    key="phone"
                                                    initial={{ opacity: 0, y: 20 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    exit={{ opacity: 0, y: -20 }}
                                                    transition={{ duration: 0.25, ease: "easeOut" }}
                                                >
                                                    <ConfigProvider theme={theme}>
                                                        <Form.Item
                                                            className="w-[300px]"
                                                            name="phone"
                                                            rules={[
                                                                { required: true, message: "Please input phone number!" },
                                                                { pattern: /^(?:\+84|0)(3|5|7|8|9)[0-9]{8}$/, message: "Invalid phone number!" }
                                                            ]}
                                                        >
                                                            <Input
                                                                prefix={<PhoneOutlined />}
                                                                placeholder="Enter phone number"
                                                                style={{ width: "320px" }}
                                                            />
                                                        </Form.Item>
                                                    </ConfigProvider>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>

                                        <Form.Item
                                            label={null}
                                            className="flex justify-center"
                                            style={{ marginTop: "40px" }}
                                        >
                                            <Button
                                                className={`hover:bg-[#fca9ad] transition-all duration-300 ease-in-out ${verifyingEmailOrPhone === "success" ? "w-40" : "w-30"}`}
                                                color="danger"
                                                variant="solid"
                                                htmlType="submit"
                                                loading={verifyingEmailOrPhone === "isVerifying"}
                                            >
                                                {verifyingEmailOrPhone === "success" ? (
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
