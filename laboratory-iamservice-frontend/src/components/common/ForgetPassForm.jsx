import { Button, Form, Input, ConfigProvider } from "antd";
import { Segmented } from "antd";
import { useState } from "react";
import { MailOutlined, PhoneOutlined } from "@ant-design/icons";
import { motion, AnimatePresence } from "motion/react";
import { theme } from "./LoginForm.jsx";



const ResetPassWord = ({ setIsResetPassWord }) => {
    const resetPassWord = (values) => {
        console.log("values ", values)
        setIsResetPassWord(false)
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
                    validateTrigger={false}
                    rules={[{ required: true, message: "Please enter new password" }]}
                >
                    <Input.Password placeholder="Enter new password" />
                </Form.Item>

                <Form.Item
                    name="confirm"
                    dependencies={["password"]}
                    validateTrigger={false}
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
                    <Input.Password placeholder="Confirm new password" />
                </Form.Item>

                <Form.Item
                    label={null}
                    className="flex justify-center"
                    style={{ marginTop: "40px" }}
                >
                    <Button
                        className="w-25 hover:bg-[#fca9ad]"
                        color="danger"
                        variant="solid"
                        htmlType="submit"
                    >
                        Reset
                    </Button>
                </Form.Item>
            </Form>
        </div>
    )
}

const VerifyOpt = ({ option, setIsResetPassWordOpen }) => {
    const verifyOpt = (value) => {
        console.log("opt ", value)
        setIsResetPassWordOpen(true)
    }

    return (
        <div className="flex flex-col h-full items-center justify-center">
            <p style={{ marginBottom: "20px" }}>
                Enter the OTP code we sent to  your <span className="font-bold">{option}</span>
            </p>

            <Form
                name="verfiyOtp"
                initialValues={{ remember: true }}
                onFinish={verifyOpt}
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
                    <Button
                        className="w-25 hover:bg-[#fca9ad]"
                        color="danger"
                        variant="solid"
                        htmlType="submit"
                    >
                        Verify
                    </Button>
                </Form.Item>
            </Form>
        </div>
    )
}

function ForgetPassForm({ setIsResetPassWord }) {
    const [option, setOption] = useState("email");
    const [isOptOpen, setIsOptOpen] = useState(false)
    const [isResetPassWordOpen, setIsResetPassWordOpen] = useState(false)
    const onFinish = (values) => {
        console.log("Success:", values);
        setIsOptOpen(true)
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
                        <ResetPassWord setIsResetPassWord={setIsResetPassWord} />
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
                            <VerifyOpt option={option} setIsResetPassWordOpen={setIsResetPassWordOpen} />
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
                                        onFinish={onFinish}
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
                                                className="w-20 hover:bg-[#fca9ad]"
                                                color="danger"
                                                variant="solid"
                                                htmlType="submit"
                                            >
                                                Next
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
