import { GoogleLogin } from '@react-oauth/google'
import api from '../../configs/axios.js';
import { useDispatch } from 'react-redux';
import { login } from '../../redux/features/userSlice.js';
import { parseClaims } from '../../utils/jwtUtil.js';
import { useNavigate } from "react-router";
import { toast } from 'react-toastify';


function GoogleButton({ setIsGoogleLogin }) {
    const dispatch = useDispatch()
    const nav = useNavigate()
    const onSuccess = async (creadentailResponse) => {
        try {
            setIsGoogleLogin(true)
            const response = await api.post("/api/auth/login-google", {
                googleCredential: creadentailResponse.credential
            })

            const data = response.data.data
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
                }
            }))
            toast.success("Login successfully!")
            localStorage.removeItem("banUntil")
            if (payload.role === "ROLE_ADMIN" || payload.role === "ROLE_LAB_MANAGER") {
                nav("/roles", { replace: true });
            } else {
                nav("/home", { replace: true });
            }
        } catch (error) {
            const errMess = error.response?.data?.message
            if (errMess) {
                toast.error(errMess, {
                    className: "!text-[#FF0000] font-bold text-[14px]"
                })
            }
            else {
                console.error("Error google login ", error)
                toast.error("Login fail!", {
                    className: "!text-[#FF0000] font-bold text-[14px]"
                })
            }
        } finally {
            setIsGoogleLogin(false)
        }
    }

    const onError = (error) => {
        console.log("Error google login ", error)
    }
    return (
        <GoogleLogin
            onSuccess={onSuccess}
            onError={onError}
            cookiePolicy={'single_host_origin'}
            size='large'
            width={200}
            text='signin_with'
        />
    )
}

export default GoogleButton
