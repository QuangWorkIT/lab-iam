import { useState } from "react"
import publicApi from "../../../configs/publicAxios"
import { Button, Form, Input } from "antd";
import { motion, AnimatePresence } from "motion/react";
import { CheckOutlined } from "@ant-design/icons";
import { toast } from "react-toastify";
import { useDispatch, useSelector } from "react-redux";
import { addBannedElement } from "../../../redux/features/userSlice";
import CountDownTimer from "../../common/CountDownTimer";

const ResetPassWord = ({ setIsResetPassWord, userId, updateOption = "reset" }) => {
    const dispath = useDispatch()
    const { bannedElements } = useSelector(state => state.user)
    const [resetPassWordState, setResetPassWordState] = useState(null)
    const [focusedField, setFocusedField] = useState("");
    const [form] = Form.useForm();

    const resetPassWord = async (values) => {
        try {
            setResetPassWordState("reseting")
            const payload = {
                userid: userId,
                password: values.password,
                option: updateOption,
                currentPassword: updateOption !== "reset" ? values.currentPassword : null
            }

            await publicApi.put("/api/auth/password-reset", payload)
            setResetPassWordState("success")

            setTimeout(() => {
                setIsResetPassWord(false)
                toast.success("Reset password successfully!")
            }, 1000);
            form.resetFields()
        } catch (error) {
            console.error("Error reset password", error)
            setResetPassWordState(null)

            const errMess = error.response.data?.message
            if (errMess) {
                toast.error(errMess, {
                    className: "!text-[#FF0000] font-bold text-[14px]"
                })
                if (error.response.status === 429 &&
                    errMess === "Too many reset password attempts") {
                    dispath(addBannedElement({
                        type: "resetPasswdBanned",
                        banUntil: error.response.data.status
                    }))
                }
            }
            else if (error.response.data?.error) toast.error(error.response.data.error, {
                className: "!text-[#FF0000] font-bold text-[14px]"
            })
            else toast.error(`Error ${updateOption} password`, {
                className: "!text-[#FF0000] font-bold text-[14px]"
            })
        }
    }

    const getInputStyle = (fieldName) => ({
        border: focusedField === fieldName ? "1px solid #FF5A5A" : "1px solid #CCC",
        borderRadius: 6,
        padding: "4px 12px",
        width: "100%",
        outline: "none",
        boxShadow: "none",
    })

    return (
        <div className="flex flex-col h-full items-center justify-center">
            <Form
                form={form}
                name="resetPassword"
                initialValues={{ remember: true }}
                onFinish={resetPassWord}
                autoComplete="off"
                className="w-[250px] md:w-[300px]"
            >
                {
                    updateOption !== "reset" && (
                        <Form.Item
                            name="currentPassword"
                            rules={[{ required: true, message: "Please enter current password" }]}
                        >
                            <Input.Password
                                visibilityToggle={true}
                                placeholder="Enter current password"
                                style={getInputStyle("currentPassword")}
                                onFocus={() => setFocusedField("currentPassword")}
                                onBlur={() => setFocusedField("")}
                            />
                        </Form.Item>
                    )
                }


                <Form.Item
                    name="password"
                    rules={[{ required: true, message: "Please enter new password" },
                    ({ getFieldValue }) => ({
                        validator(_, value) {
                            if (!value) return Promise.resolve()

                            const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

                            if (!regex.test(value)) {
                                return Promise.reject(
                                    "Password must contain at least 8 characters, including uppercase, lowercase, and a number"
                                )
                            }

                            return Promise.resolve()
                        }
                    })]}
                    style={{ marginTop: "30px" }}
                >
                    <Input.Password
                        visibilityToggle={true}
                        placeholder="Enter new password"
                        style={getInputStyle("password")}
                        onFocus={() => setFocusedField("password")}
                        onBlur={() => setFocusedField("")}
                    />
                </Form.Item>

                <Form.Item
                    name="confirm"
                    dependencies={["password"]}
                    validateTrigger="onBlur"
                    style={{ marginTop: "30px" }}
                    rules={[
                        { required: true, message: "Please confirm your password" },
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
                    <Input.Password
                        visibilityToggle={true}
                        placeholder="Confirm new password"
                        style={getInputStyle("confirm")}
                        onFocus={() => setFocusedField("confirm")}
                        onBlur={() => setFocusedField("")}
                    />
                </Form.Item>

                <Form.Item
                    label={null}
                    style={{ marginTop: "40px" }}
                >

                    <div className="flex flex-col items-center">
                        {
                            bannedElements.some(e => e.type === "resetPasswdBanned")
                            && (<span
                                className="font-semibold italic mb-1 text-red-500 text-center">
                                Too many attempts! Please try again after
                                <CountDownTimer
                                    className={"font-bold"}
                                    endTime={(new Date(bannedElements.find(e => e.type === "resetPasswdBanned").banUntil)).getTime()}
                                    clearItem={"resetPasswdBanned"}
                                />
                            </span>)
                        }
                        {!bannedElements.some(e => e.type === "resetPasswdBanned") && (
                            <Button
                                style={{
                                    backgroundColor: "#FF5A5A", // primary color
                                    color: "white",
                                    border: "none",
                                    borderRadius: "6px",
                                    width: resetPassWordState === "success" ? "200px" : "120px", // same as w-50 / w-30
                                    cursor: "pointer",
                                    transition: "all 0.3s ease",
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#FF3A3A"} // hover
                                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "#FF5A5A"}
                                htmlType="submit"
                                disabled={bannedElements.some(e => e.type === "resetPasswdBanned")}
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
                                            initial={{ opacity: 0 }} q
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            transition={{ duration: 0.2 }}
                                        >
                                            {updateOption === "reset" ? "Reset" : "Save"}
                                        </motion.span>
                                    )}
                                </AnimatePresence>
                            </Button>
                        )}
                    </div>
                </Form.Item>
            </Form>
        </div>
    )
}

export default ResetPassWord;