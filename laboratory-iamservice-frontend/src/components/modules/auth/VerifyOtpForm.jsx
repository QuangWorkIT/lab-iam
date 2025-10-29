import { useState } from "react"
import publicApi from "../../../configs/publicAxios"
import { Button, Form, Input, Spin } from "antd";
import { motion, AnimatePresence } from "motion/react";
import { CheckCircleOutlined } from "@ant-design/icons";

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

export default VerifyOpt;