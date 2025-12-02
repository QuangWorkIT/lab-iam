import api from "../configs/axios";

export const fetchUserPrivileges = async (code) => {
    try {
        const response = await api.get(`/api/roles/users/${code}`);
        return response.data?.data || [];
    } catch (error) {
        console.error("Error fetching user privileges:", error);
        return [];
    }
}