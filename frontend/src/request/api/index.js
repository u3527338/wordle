import axios from "axios";
import AWS from "aws-sdk";

const API = "https://sgk-online-api.vercel.app";
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
    try {
        const response = await axios.get(`${API}/user/${userId}`);
        return response.data;
    } catch (error) {
        return error.response.data;
    }
};

export const createNewBook = async (data) => {
    try {
        const response = await axios.post(`${API}/addbook`, data);
        return response.data;
    } catch (error) {
        return error.response.data;
    }
};

export const createNewSkill = async (data) => {
    try {
        const response = await axios.post(`${API}/addskill`, data);
        return response.data;
    } catch (error) {
        return error.response.data;
    }
};

export const createNewCharacter = async (data) => {
    try {
        const response = await axios.post(`${API}/addcharacter`, data);
        return response.data;
    } catch (error) {
        return error.response.data;
    }
};

export const getCharacters = async () => {
    try {
        const response = await axios.get(`${API}/characters`);
        return response.data;
    } catch (error) {
        return error.response.data;
    }
};

export const getSkills = async () => {
    try {
        const response = await axios.get(`${API}/skills`);
        return response.data;
    } catch (error) {
        return error.response.data;
    }
};

export const getBooks = async () => {
    try {
        const response = await axios.get(`${API}/books`);
        return response.data;
    } catch (error) {
        return error.response.data;
    }
};

export const getMyCharacters = async (user_id) => {
    try {
        const response = await axios.get(
            `${API}/my-characters?user_id=${user_id}`
        );
        return response.data;
    } catch (error) {
        return error.response.data;
    }
};

export const getMySkills = async (user_id) => {
    try {
        const response = await axios.get(`${API}/my-skills?user_id=${user_id}`);
        return response.data;
    } catch (error) {
        return error.response.data;
    }
};

export const getMySquads = async (user_id) => {
    try {
        const response = await axios.get(`${API}/my-squads?user_id=${user_id}`);
        return response.data;
    } catch (error) {
        return error.response.data;
    }
};

export const updateMyCharacters = async (data) => {
    try {
        const response = await axios.post(`${API}/my-characters`, data);
        return response.data;
    } catch (error) {
        return error.response.data;
    }
};

export const updateMySkills = async (data) => {
    try {
        const response = await axios.post(`${API}/my-skills`, data);
        return response.data;
    } catch (error) {
        return error.response.data;
    }
};

export const updateMySquad = async (data) => {
    try {
        const response = await axios.post(`${API}/my-squad`, data);
        return response.data;
    } catch (error) {
        return error.response.data;
    }
};

export const addSquad = async (data) => {
    try {
        const response = await axios.post(`${API}/add-squad`, data);
        return response.data;
    } catch (error) {
        return error.response.data;
    }
};

export const deleteSquad = async (id) => {
    try {
        const response = await axios.delete(`${API}/delete-squad/${id}`);
        return response.data;
    } catch (error) {
        return error.response.data;
    }
};

export const uploadImage = (file) => {
    AWS.config.update({
        accessKeyId: process.env.REACT_APP_AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.REACT_APP_AWS_SECRET_ACCESS_KEY,
    });

    const s3 = new AWS.S3({
        params: { Bucket: process.env.REACT_APP_S3_BUCKET },
        region: "us-east-2",
    });

    const params = {
        Bucket: process.env.REACT_APP_S3_BUCKET,
        Key: file.name,
        Body: file,
    };

    return s3
        .putObject(params)
        .promise()
        .then((upload) => {
            const fileUrl = `https://${params.Bucket}.s3.${s3.config.region}.amazonaws.com/${params.Key}`;
            return fileUrl;
        })
        .catch((error) => {
            console.error(error);
            return error;
        });
};
