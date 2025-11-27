import { notifyApi } from "../configs/notifyAxios";


export const fetchTestOrderNotifications = async (email) => {
    try {
        const response = await notifyApi.get(`/api/notification/test-order-notifications/${email}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching notifications:', error);
        return { data: []}
    }
};


export const fetchReagentNotifications = async () => {
    try {
        const response = await notifyApi.get(`/api/notification/reagent/alerts`);
        return response.data;
    } catch (error) {
        console.error('Error fetching reagent notifications:', error);
        return { data: []}
    }
}