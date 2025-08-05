import axios from "axios";

// const API = "https://sgk-online-api.vercel.app";
const API = "http://localhost:4000";
axios.defaults.withCredentials = true;

export const registerNewUser = async (data) => {
    try {
        const response = await axios.post(`${API}/register`, data);
        return response.data;
    } catch (error) {
        return error.response.data;
    }
};

export const login = async (data) => {
    try {
        const response = await axios.post(`${API}/login`, data);
        return response.data;
    } catch (error) {
        return error.response.data;
    }
};

export const getUser = async (userId) => {
    if (!userId) return null;
    try {
        const response = await axios.get(`${API}/user/${userId}`);
        return response.data;
    } catch (error) {
        return error.response.data;
    }
};
