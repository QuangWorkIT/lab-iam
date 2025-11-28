import { Button, Form, Input, ConfigProvider, Checkbox } from 'antd';
import { Spin } from 'antd';
import { LockOutlined, UserOutlined } from '@ant-design/icons';
import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from "react-router";
import { login, addBannedElement } from '../../redux/features/userSlice.js';
import { toast } from 'react-toastify';
import api from '../../configs/axios.js';
import { parseClaims } from '../../utils/jwtUtil.js';
import GoogleButton from './GoogleButton.jsx';
import { formatBannedDate } from '../../utils/formatter.js';
import CountDownTimer from "../common/CountDownTimer.jsx"

// custom input theme 
export const theme = {
    components: {
        Input: {
            colorPrimary: '#FF5A5A',
            colorPrimaryHover: '#FF3A3A',
            colorPrimaryActive: '#FF5A5A',
            colorError: '#FF0000',
        },
        Form: {
            colorError: '#FF0000',
        }
    },
};

// email validation
const emailRules = [
    { required: true, message: "Please enter your email" },
    {
        pattern:
            /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
        message: "Please enter a valid email address",
    },
    { max: 200, message: "Please enter a valid email address" },
]

// password validation
const passwordRules = [
    { required: true, message: "Please enter password" },
];


function LoginForm({ setIsResetPassWord }) {
    const [form] = Form.useForm();
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isGoogleLogin, setIsGoogleLogin] = useState(false)
    const dispatch = useDispatch()
    const nav = useNavigate()
    const { bannedElements } = useSelector(state => state.user)

    const onFinish = async (values) => {
        try {
            setIsSubmitting(true)

            const response = await api.post("/api/auth/login", {
                email: values.email,
                password: values.password
            })
            const data = response.data?.data

            const payload = parseClaims(data.accessToken)
            dispatch(login({
                token: data.accessToken,
                userInfo: {
                    id: payload.sub,
                    userName: payload.userName,
                    email: payload.email,
                    role: payload.role,
                    privileges: payload.privileges,
                    identityNumber: payload.identityNumber,
                    phoneNumber: payload.phone,
                    gender: payload.gender,
                    dateOfBirth: payload.dob,
                    age: payload.age,
                    address: payload.address,
                    isActive: payload.isActive === "true",
                    deletedAt: payload.deletedAt,
                    isDeleted: payload.isDeleted === "true"
                }
            }))
            toast.success("Login successfully!")
            if (payload.role === "ROLE_ADMIN" || payload.role === "ROLE_LAB_MANAGER") {
                nav("/roles", { replace: true });
            } else {
                nav("/home", { replace: true });
            }
            form.resetFields()
        } catch (error) {
            const errMess = error.response?.data?.message
            if (errMess) {
                if (error.response?.status === 429 &&
                    errMess.split(".")[0] === "Too many attempts"
                ) {
                    toast.error("Too many attempts!", {
                       className: "!text-[#FF0000] font-bold text-[14px]"
                    })
                    dispatch(addBannedElement(
                        {
                            type: "loginBanned",
                            banUntil: formatBannedDate(error.response.data.data)
                        })
                    )
                }
                else if (errMess === "Email not found" || errMess === "Password is invalid") {
                    toast.error("Invalid creadetail!", {
                        className: "!text-[#FF0000] font-bold text-[14px]"
                    })
                }
                else toast.error(errMess, {
                   className: "!text-[#FF0000] font-bold text-[14px]"
                })
            }
            else toast.error("Login failed!", {
               className: "!text-[#FF0000] font-bold text-[14px]"
            })
            console.log(error)
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className='flex flex-col items-center justify-center h-full w-full mt-5'>
            <p
                className='text-xl md:text-3xl text-center font-bold ml-2'
                style={{ marginBottom: "30px" }}
            >
                Lab Management
            </p>

            <Form
                form={form}
                name='login'
                onFinish={onFinish}
            >
                <ConfigProvider theme={theme}>
                    <Form.Item
                        name="email"
                        rules={emailRules}
                        hasFeedback
                    >
                        <div className={`m-auto transition-all duration-500 ease-in-out w-70 md:w-100`}>
                            <Input
                                prefix={<UserOutlined style={{ color: "#FF5A5A" }} />}
                                placeholder="Email"
                                variant='underlined'
                            />
                        </div>
                    </Form.Item>
                </ConfigProvider>
                <ConfigProvider theme={theme}>
                    <Form.Item
                        name="password"
                        rules={passwordRules}
                        hasFeedback
                    >
                        <div className={`m-auto transition-all duration-500 ease-in-out w-70 md:w-100`}>
                            <Input.Password
                                className="bg-transparent"
                                prefix={<LockOutlined style={{ color: "#FF5A5A" }} />}
                                placeholder="Password"
                                variant='underlined'
                            />
                        </div>
                    </Form.Item>
                </ConfigProvider>

                <div className="flex justify-between w-full mb-10">
                    <div>
                        <Checkbox className="font-semibold !text-[12px] md:!text-[14px]">Remember me</Checkbox>
                    </div>
                    <p
                        onClick={() => setIsResetPassWord(true)}
                        className="italic text-[#5170ff] font-semibold hover:cursor-pointer 
                        hover:text-[#a3b4ff] transition-all duration-300 text-[12px] md:text-[14px]">
                        Forget password?
                    </p>
                </div>

                <div className="mt-15">
                    {bannedElements.some(e => e.type === "loginBanned") &&
                        (<h2 className="text-center text-[12px] italic text-[#FF0000]">
                            Your account is locked! Please try again after
                            <span className='font-bold'>
                                <CountDownTimer
                                    endTime={new Date((bannedElements.find(e => e.type === "loginBanned")).banUntil).getTime()}
                                    clearItem={"loginBanned"} />
                            </span>
                        </h2>)
                    }
                    <Form.Item className='flex justify-center' style={{ margin: "0" }}>
                        <Button
                            className='md:w-[200px] w-50'
                            style={{ backgroundColor: "#FF5A5A", color: "white" }} // primary color
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#FF3A3A"}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "#FF5A5A"}
                            htmlType='submit'
                            loading={isSubmitting}
                            disabled={bannedElements.some(e => e.type === "loginBanned")}
                        >
                            Login
                        </Button>
                    </Form.Item>

                    <div className="flex justify-center items-center my-2 gap-2">
                        <hr className="w-18 border-gray-400" />
                        <span className="font-semibold text-gray-500 italic">Or continue with</span>
                        <hr className="w-18 border-gray-400" />
                    </div>

                    <Form.Item className='flex justify-center'>
                        {isGoogleLogin ? (
                            <Spin size='large' />
                        ) : (
                            <div className={`hover:opacity-70 transition 
                            ${bannedElements.some(e => e.type === "loginBanned")
                                    ? "pointer-events-none opacity-50"
                                    : "opacity-100 cursor-pointer"}`}>
                                <GoogleButton setIsGoogleLogin={setIsGoogleLogin} />
                            </div>
                        )}
                    </Form.Item>
                </div>
            </Form>
        </div>
    )
}

export default LoginForm
