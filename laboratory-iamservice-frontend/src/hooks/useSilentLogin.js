import { isTokenExpired, parseClaims } from '../utils/jwtUtil'
import publicApi from '../configs/publicAxios'
import { login, setLoading } from '../redux/features/userSlice'
import { useDispatch } from 'react-redux'
import { useEffect } from 'react';
function useSilentLogin() {
    const dispatch = useDispatch()

    useEffect(() => {
        const handleSilentLogin = async () => {
            const accessToken = localStorage.getItem("token")
            if (!accessToken) {
                return
            }

            try {
                dispatch(setLoading(true))
                if (isTokenExpired(accessToken)) {
                    const refreshResponse = await publicApi.post("/api/auth/refresh")
                    const data = refreshResponse.data?.data
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
                    console.log("silent login success")
                }
            } catch (error) {
                console.log("error refresh user ", error)
            }finally{
                dispatch(setLoading(false))
            }
        }

        handleSilentLogin()
    }, [dispatch])
}

export default useSilentLogin
