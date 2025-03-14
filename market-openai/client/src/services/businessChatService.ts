import axiosInstance from "../api/axiosInstace";

export const businessChatService = async (message: string) => {
  try {
    const response = await axiosInstance.post("/chatbot", { message });
    console.log(response.data);
    return response.data;
  } catch (error) {
    console.error(error);
  }
};
