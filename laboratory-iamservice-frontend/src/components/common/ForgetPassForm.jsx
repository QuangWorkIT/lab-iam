import { Button, Form, Input, ConfigProvider, Spin } from "antd";
import { Segmented } from "antd";
import { useState } from "react";
import { MailOutlined, PhoneOutlined, CheckOutlined, CheckCircleOutlined } from "@ant-design/icons";
import { motion, AnimatePresence } from "motion/react";
import { theme } from "./LoginForm.jsx";
import publicApi from "../../configs/publicAxios.js";
import { toast } from "react-toastify";

const ResetPassWord = ({ setIsResetPassWord, userId }) => {
    const [resetPassWordState, setResetPassWordState] = useState(null)

    const resetPassWord = async (values) => {
        try {
            setResetPassWordState("reseting")
            await publicApi.put("/api/auth/password-reset", {
                userid: userId,
                password: values.password
            })
            setResetPassWordState("success")
            setTimeout(() => {
                setIsResetPassWord(false)
                toast.success("Reset password successfully!")
            }, 1000);

        } catch (error) {
            console.log("Error reset password", error)
            toast.error("Error reset password")
            setResetPassWordState(null)
        }
    }

    return (
        <div className="flex flex-col h-full items-center justify-center">
            <Form
                name="resetPassword"
                initialValues={{ remember: true }}
                onFinish={resetPassWord}
                autoComplete="off"
                className="w-[300px]"
            >
                <Form.Item
                    name="password"
                    rules={[{ required: true, message: "Please enter new password" }]}
                >
                    <Input.Password visibilityToggle={false} placeholder="Enter new password" />
                </Form.Item>

                <Form.Item
                    name="confirm"
                    dependencies={["password"]}
                    validateTrigger="onBlur"
                    rules={[{ required: true, message: "Please confirm your password" },
                    ({ getFieldValue }) => ({
                        validator(_, value) {
                            if (getFieldValue("password") !== value) {
                                return Promise.reject(new Error("Password does not match"))
                            }
                            return Promise.resolve()
                        }
                    })
                    ]}
                >
                    <Input.Password visibilityToggle={false} placeholder="Confirm new password" />
                </Form.Item>

                <Form.Item
                    label={null}
                    className="flex justify-center"
                    style={{ marginTop: "40px" }}
                >
                    <Button
                        className={`hover:bg-[#fca9ad] transition-all duration-300 ease-in-out 
                        ${resetPassWordState === "success" ? "w-50" : "w-30"}`}
                        color="danger"
                        variant="solid"
                        htmlType="submit"
                        loading={resetPassWordState === "reseting"}
                    >
                        <AnimatePresence mode="wait">
                            {resetPassWordState === "success" ? (
                                <motion.div
                                    key="success"
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: 0.2, ease: "easeInOut" }}
                                    className="flex items-center justify-center gap-1"
                                >
                                    <CheckOutlined /> Password changed
                                </motion.div>
                            ) : (
                                <motion.span
                                    key="reset"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    Reset
                                </motion.span>
                            )}
                        </AnimatePresence>
                    </Button>
                </Form.Item>
            </Form>
        </div>
    )
}

const VerifyOpt = ({ data, setIsResetPassWordOpen }) => {
    const [otpVerifyState, setOtpVerifyState] = useState("")
    const handleVerifyOtp = async (value) => {
        try {
            setOtpVerifyState("verifying")
            await publicApi.post("/api/auth/otp-verification", {
                otp: value.otp,
                email: data
            })

            setOtpVerifyState("success")
            setTimeout(() => {
                setIsResetPassWordOpen(true)
            }, 1000);
        } catch (error) {
            console.error("Error verify OTP", error)
            if (error.response.data?.message) toast.error(error.response.data.message)
            else toast.error("Error verify OTP")
            setOtpVerifyState(null)
        }
    }

    return (
        <div className="flex flex-col h-full items-center justify-center">
            <p style={{ marginBottom: "20px" }}>
                Enter the OTP code we sent to <span className="font-bold">{data}</span>
            </p>

            <Form
                name="verfiyOtp"
                initialValues={{ remember: true }}
                onFinish={handleVerifyOtp}
                autoComplete="off">
                <Form.Item
                    name="otp"
                    rules={[{ required: true, message: "Please enter the OTP code" }]}
                >
                    <Input.OTP />
                </Form.Item>

                <Form.Item
                    label={null}
                    className="flex justify-center"
                    style={{ marginTop: "40px" }}
                >
                    <AnimatePresence mode="wait">
                        {otpVerifyState === "verifying" && (
                            <motion.div
                                key="verifying"
                            >
                                <Spin size="large" />
                            </motion.div>
                        )}

                        {otpVerifyState === "success" && (
                            <motion.div
                                key="success"
                                initial={{ opacity: 0, scale: 0.5 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.5 }}
                                transition={{ duration: 0.3, ease: "easeOut" }}
                                className="flex flex-col items-center"
                            >
                                <CheckCircleOutlined style={{ fontSize: "48px", color: "#00bf63" }} />
                                <p className="mt-2 text-green-600 font-semibold">Verified!</p>
                            </motion.div>
                        )}

                        {!otpVerifyState && (
                            <motion.div
                                key="button"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.3 }}
                            >
                                <Button
                                    className="w-25 hover:bg-[#fca9ad]"
                                    color="danger"
                                    variant="solid"
                                    htmlType="submit"
                                >
                                    Verify
                                </Button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </Form.Item>
            </Form>
        </div>
    )
}

function ForgetPassForm({ setIsResetPassWord }) {
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
        } catch (error) {
            toast.error("Error verify email or phone")
            console.error("Error verify email or phone", error)
            setVerifyingEmailOrPhone(null)
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
                        <ResetPassWord setIsResetPassWord={setIsResetPassWord} userId={currentUser.userId} />
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
                                    className="flex flex-col gap-7 items-center justify-center h-full min-w-[300px]">
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
