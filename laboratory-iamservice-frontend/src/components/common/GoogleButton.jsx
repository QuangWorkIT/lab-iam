import { GoogleLogin } from '@react-oauth/google'


function GoogleButton() {
    const onSuccess = (creadentailResponse) => {
        console.log(creadentailResponse)
    }

    const onError = (error) => {
        console.log("Error google login ",error)
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
