import { Button, Form, Input, ConfigProvider } from 'antd';
import { LockOutlined, UserOutlined } from '@ant-design/icons';
import { useState } from 'react';

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

// user name validation
const userNameRules = [
    { required: true, message: "Please enter user name" },
    { min: 6, message: "User name must be at least 6 characters" },
    { max: 200, message: "Password cannot exceed 20 characters" },
]

// password validation
const passwordRules = [
    { required: true, message: "Please enter password" },
    { min: 6, message: "Password must be at least 6 characters" },
    { max: 200, message: "Password cannot exceed 20 characters" },
    {
        pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        message: "Must contain uppercase, lowercase and number"
    }
];


function LoginForm() {
    const [isUserExpanded, setIsUserExpanded] = useState(false);
    const [username, setUserName] = useState("");
    const [isPasswordExpanded, setIsPasswordExpanded] = useState(false);
    const [password, setPassword] = useState("");

    const onFinish = (values) => {
        console.log(values)
    }

    return (
        <div className='flex flex-col items-center justify-center'>
            <p
                className='text-xl md:text-3xl text-center font-bold'
                style={{ marginBottom: "40px" }}
            >
                Lab Management
            </p>
            <Form
                name='login'
                onFinish={onFinish}
                className='w-[200px] md:w-[360px]'
            >
                <ConfigProvider theme={theme}>
                    <Form.Item
                        name="username"
                        rules={userNameRules}
                        hasFeedback
                    >
                        <div className={`m-auto transition-all duration-500 ease-in-out 
                        ${isUserExpanded ? "w-full" : "md:w-70"}`}>
                            <Input
                                value={username}
                                prefix={<UserOutlined style={{ color: "#FE535B" }} />}
                                placeholder="Username"
                                variant='underlined'
                                onChange={(e) => {
                                    setUserName(e.target.value)
                                    if (e.target.value !== "") {
                                        setIsUserExpanded(true)
                                    } else {
                                        setIsUserExpanded(false)
                                    }
                                }}
                                onFocus={() => setIsUserExpanded(true)}
                                onBlur={() => {
                                    if (username === "") setIsUserExpanded(false);
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
                        ${isPasswordExpanded ? "w-full" : "md:w-70"}`}>
                            <Input.Password
                                value={password}
                                style={{ marginBottom: "20px" }}
                                className="bg-transparent"
                                prefix={<LockOutlined style={{ color: "#FE535B" }} />}
                                placeholder="Password"
                                variant='underlined'
                                onChange={(e) => {
                                    setPassword(e.target.value)
                                    if (e.target.value !== "") {
                                        setIsPasswordExpanded(true)
                                    } else {
                                        setIsPasswordExpanded(false)
                                    }
                                }}
                                onFocus={() => setIsPasswordExpanded(true)}
                                onBlur={() => {
                                    if (password === "") setIsPasswordExpanded(false);
                                }}
                            />
                        </div>
                    </Form.Item>
                </ConfigProvider>

                <Form.Item className='flex justify-center'>
                    <Button
                        className='md:w-30 w-20 hover:bg-[#fca9ad]'
                        color='danger'
                        variant='solid'
                        htmlType='submit'
                    >
                        Login
                    </Button>
                </Form.Item>
            </Form>
        </div>
    )
}

export default LoginForm
