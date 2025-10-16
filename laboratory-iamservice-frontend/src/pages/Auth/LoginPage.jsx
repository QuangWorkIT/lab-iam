import LoginForm from "../../components/common/LoginForm"
import {
    ForwardOutlined
} from '@ant-design/icons';

function LoginPage() {
    return (
        <div className="w-full h-full min-h-screen flex flex-col items-center justify-center bg-[#E1E7EF]">
            <div className="flex w-full h-150 p-20">
                {/* hero component */}
                <div className="hidden lg:flex lg:flex-1 bg-white relative">
                    <div className="flex absolute left-25 -translate-y-20 w-[38rem] h-[38rem] bg-[#FE535B] flex-col justify-center text-white px-10">
                        <div className="absolute p-4 top-1/2 -translate-y-1/2 right-[-10px] h-25 w-25 rounded-full bg-white">
                            <div className="w-full h-full rounded-full bg-[#FE535B] flex justify-center items-center 
                                            hover:cursor-pointer hover:scale-115 hover:bg-[#fca9ad] 
                                            transition-all duration-300 ease-in-out">
                                <ForwardOutlined style={{ fontSize: "38px", marginLeft: "7px" }} />
                            </div>
                        </div>
                        <h1 className="text-5xl font-bold mb-2 ml-10 cursor-default">
                            <span className="inline-block transform transition-transform duration-300 hover:translate-y-[-10px]">Welcome</span>
                            <br />
                            <span className="inline-block transform transition-transform duration-300 hover:translate-y-[-10px]">Back</span>
                        </h1>
                        <div className="w-32 h-[3px] bg-white mb-4 ml-10"></div>
                        <p className="italic text-lg leading-relaxed ml-10">
                            To keep connected with us, please login <br /> with your personal info
                        </p>
                    </div>
                </div>

                {/* login form */}
                <div className="flex-1 bg-white flex justify-center">
                    <LoginForm></LoginForm>
                </div>
            </div>
        </div>
    )
}

export default LoginPage
