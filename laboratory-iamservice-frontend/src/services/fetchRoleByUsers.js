import api from "../configs/axios"

const fetchRoles = async () => {
    try {
        const response = await api.get('/api/users/roles');

        if(!response.data?.data) throw new Error('No data found');

        return response.data.data;
    } catch (error) {
        console.error('Error fetching roles:', error);
    }
}

export default fetchRoles;