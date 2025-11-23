import { notifyApi } from "../configs/notifyAxios";


const fetchNotifications = async (email) => {
    try {
        const response = await notifyApi.get(`/api/test-order-notifications/${email}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching notifications:', error);
        throw error;
    }
};

export default fetchNotifications;