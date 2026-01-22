import axiosInstance from "../api/axiosInstace";


export const businessChatService = async (message: string) => {
  const userId = Date.now() + Math.floor(777 + Math.random() * 7000)
  try {
    const response = await axiosInstance.post("/chatbot", { userId, message });
    console.log(response.data);
    return response.data;
  } catch (error) {
    console.error(error);
  }
};
