import api from "../configs/axios";

export const fetchUserProfile = async (id) => {
    try {
        const response = await api.get(`api/users/${id}/profile`);
        return response.data;
    } catch (error) {
        console.error("Error fetching user profile:", error);
        return null
    }
}