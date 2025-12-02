import api from "../configs/axios";

export const fetchUserPrivileges = async (code) => {
    try {
        console.log("role code: ", code)
        const response = await api.get(`/api/roles/users/${code}`);
        return response.data?.data || [];
    } catch (error) {
        console.error("Error fetching user privileges:", error);
        return [];
    }
}