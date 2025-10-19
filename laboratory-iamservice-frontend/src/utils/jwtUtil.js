import { jwtDecode } from "jwt-decode";

export const parseClaims = (token) => {
    try {
        const payload = jwtDecode(token)
        return payload;
    } catch (error) {
        console.error("error decode jwt ", error)
        return null;
    }
}