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

export const isTokenExpired = (token) => {
    const payload = parseClaims(token);
    if (!payload) return true;

    const now = new Date().getTime() / 1000
    return now > payload.exp
}