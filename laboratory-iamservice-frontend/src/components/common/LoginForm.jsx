import { Button, Form, Input, ConfigProvider } from 'antd';
import { Spin } from 'antd';
import { LockOutlined, UserOutlined } from '@ant-design/icons';
import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from "react-router";
import { login } from '../../redux/features/userSlice.js';
import { toast } from 'react-toastify';
import api from '../../configs/axios.js';
import { parseClaims } from '../../utils/jwtUtil.js';
import GoogleButton from './GoogleButton.jsx';


// custom input theme 
const theme = {
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
    { min: 8, message: "Password must be at least 8 characters" },
    { max: 200, message: "Password cannot exceed 200 characters" },
    {
        pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        message: "Must contain uppercase, lowercase and number"
    }
];


function LoginForm() {
    const [form] = Form.useForm();
    const [isEmailExpanded, setIsEmailExpanded] = useState(false);
    const [isPasswordExpanded, setIsPasswordExpanded] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isGoogleLogin, setIsGoogleLogin] = useState(false)
    const dispatch = useDispatch()
    const nav = useNavigate()

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
                }
            }))
            toast.success("Login successfully!")
            if (payload.role === "ROLE_ADMIN" || payload.role === "ROLE_LAB_MANAGER") {
                nav("/roles", { replace: true });
            } else {
                nav("/test", { replace: true });
            }
        } catch (error) {
            const errMess = error.response?.data?.message
            if (errMess) toast.error(errMess)
            else toast.error("Login failed!")
        } finally {
            form.resetFields()
            setIsSubmitting(false)
            setIsEmailExpanded(false)
            setIsPasswordExpanded(false)
        }
    }

    return (
        <div className='flex flex-col items-center justify-center mt-7'>
            <p
                className='text-xl md:text-3xl text-center font-bold'
                style={{ marginBottom: "40px" }}
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
                                // style={{ marginBottom: "20px" }}
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

                <div className="mt-13">
                    <Form.Item className='flex justify-center' style={{ margin: "0" }}>
                        <Button
                            className='md:w-[200px] w-20 hover:bg-[#fca9ad]'
                            color='danger'
                            variant='solid'
                            htmlType='submit'
                            loading={isSubmitting}
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
                            <div className="opacity-100 hover:opacity-70 transition">
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
