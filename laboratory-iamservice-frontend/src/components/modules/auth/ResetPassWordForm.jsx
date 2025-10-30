import { useState } from "react"
import publicApi from "../../../configs/publicAxios"
import { Button, Form, Input } from "antd";
import { motion, AnimatePresence } from "motion/react";
import { CheckOutlined } from "@ant-design/icons";
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

export default ResetPassWord;