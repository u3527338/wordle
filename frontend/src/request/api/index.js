import axios from "axios";

const API = process.env.REACT_APP_API_URL;
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

export const createRoom = async (data) => {
    try {
        const response = await axios.post(`${API}/createRoom`, data);
        return response.data;
    } catch (error) {
        return error.response.data;
    }
};

export const joinRoom = async (data) => {
    try {
        const response = await axios.post(`${API}/joinRoom`, data);
        return response.data;
    } catch (error) {
        return error.response.data;
    }
};
