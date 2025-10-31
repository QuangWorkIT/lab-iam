import { Button, Form, Input, ConfigProvider, Checkbox } from 'antd';
import { Spin } from 'antd';
import { LockOutlined, UserOutlined } from '@ant-design/icons';
import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from "react-router";
import { login } from '../../redux/features/userSlice.js';
import { toast } from 'react-toastify';
import api from '../../configs/axios.js';
import { parseClaims } from '../../utils/jwtUtil.js';
import GoogleButton from './GoogleButton.jsx';
import { formatBannedDate } from '../../utils/formatter.js';


// custom input theme 
export const theme = {
    components: {
        Input: {
            colorPrimary: '#FE535B',
            colorPrimaryHover: '#FE535B',
            colorPrimaryActive: '#FE535B',
        },
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


function LoginForm({setIsResetPassWord}) {
    const [form] = Form.useForm();
    const [isEmailExpanded, setIsEmailExpanded] = useState(false);
    const [isPasswordExpanded, setIsPasswordExpanded] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isGoogleLogin, setIsGoogleLogin] = useState(false)
    const [banUntil, setbanUntil] = useState(null)
    const dispatch = useDispatch()
    const nav = useNavigate()

    // Load banUntil from localStorage once at mount
    useEffect(() => {
        const stored = localStorage.getItem("banUntil");
        if (stored && stored !== "null") {
            setbanUntil(stored);
        }
    }, []);

    // Save banUntil to localStorage when it changes
    useEffect(() => {
        if (banUntil) {
            localStorage.setItem("banUntil", banUntil);
        } else {
            localStorage.removeItem("banUntil");
        }
    }, [banUntil]);

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
                    identifyNumber: payload.identifyNumber,
                    phoneNumber: payload.phone,
                    gender: payload.gender,
                    dateOfBirth: payload.dob,
                    age: payload.age,
                    address: payload.address,
                    isActive: payload.isActive === "true",
                }
            }))
            setbanUntil(null)
            toast.success("Login successfully!")
            if (payload.role === "ROLE_ADMIN" || payload.role === "ROLE_LAB_MANAGER") {
                nav("/roles", { replace: true });
            } else {
                nav("/home", { replace: true });
            }
        } catch (error) {
            const errMess = error.response?.data?.message
            if (errMess) {
                if (error.response.status === 429 &&
                    errMess.split(".")[0] === "Too many attempts"
                ) {
                    toast.error("Too many attempts!")
                    setbanUntil(formatBannedDate(error.response.data.status))
                } else toast.error("Invalid credentials!")
            }
            else toast.error("Login failed!")
        } finally {
            form.resetFields()
            setIsSubmitting(false)
            setIsEmailExpanded(false)
            setIsPasswordExpanded(false)
        }
    }

    return (
        <div className='flex flex-col items-center justify-center h-full mt-3'>
            <p
                className='text-xl md:text-3xl text-center font-bold'
                style={{ marginBottom: "35px" }}
            >
                Lab Management
            </p>

            <Form
                form={form}
                name='login'
                onFinish={onFinish}
                className='w-[200px] md:w-[360px]'
            >
                <ConfigProvider theme={theme}>
                    <Form.Item
                        name="email"
                        rules={emailRules}
                        hasFeedback
                    >
                        <div className={`m-auto transition-all duration-500 ease-in-out 
                        ${isEmailExpanded ? "w-full" : "md:w-80"}`}>
                            <Input
                                prefix={<UserOutlined style={{ color: "#FE535B" }} />}
                                placeholder="Email"
                                variant='underlined'
                                onFocus={() => setIsEmailExpanded(true)}
                                onBlur={() => {
                                    if (!form.getFieldValue("email")) setIsEmailExpanded(false);
                                }}
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
                        <div className={`m-auto transition-all duration-500 ease-in-out 
                        ${isPasswordExpanded ? "w-full" : "md:w-80"}`}>
                            <Input.Password
                                className="bg-transparent"
                                prefix={<LockOutlined style={{ color: "#FE535B" }} />}
                                placeholder="Password"
                                variant='underlined'
                                onFocus={() => setIsPasswordExpanded(true)}
                                onBlur={() => {
                                    if (!form.getFieldValue("password")) setIsPasswordExpanded(false);
                                }}
                            />
                        </div>
                    </Form.Item>
                </ConfigProvider>

                <div className="flex justify-between px-5 mb-10">
                    <div className="text-[14px]">
                        <Checkbox className="font-semibold">Remember me</Checkbox>
                    </div>
                    <p 
                    onClick={() => setIsResetPassWord(true)}
                    className="italic text-[#5170ff] font-semibold hover:cursor-pointer 
                    hover:text-[#a3b4ff] transition-all duration-300">
                        Forget password?
                    </p>
                </div>

                <div className="mt-13">
                    {banUntil !== null && (<h2 className="text-center italic text-red-500">
                        Your account is locked! <br />
                        Please try later at <span className='font-bold'>{banUntil}</span>
                    </h2>)}
                    <Form.Item className='flex justify-center' style={{ margin: "0" }}>
                        <Button
                            className='md:w-[200px] w-20 hover:bg-[#fca9ad]'
                            color='danger'
                            variant='solid'
                            htmlType='submit'
                            loading={isSubmitting}
                            disabled={banUntil !== null}
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
                            ${banUntil !== null
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
