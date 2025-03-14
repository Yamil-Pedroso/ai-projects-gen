import axiosInstance from "../api/axiosConfig";

export interface IMessage {
    message: string;
}

export const getMessages = async () => {
    try {
        const response = await axiosInstance.get("/messages");
        console.log(response.data);
        return response.data
    } catch (error) {
        console.error(error);
        return { message: "" };
    }
}

export const translate = async (text: string, targetLang: string) => {
    try {
        const response = await axiosInstance.post("/translate", { text, targetLang });
        console.log(response.data);
        return response.data;
    } catch (error) {
        console.error(error);
        return { message: "" };
    }
}
