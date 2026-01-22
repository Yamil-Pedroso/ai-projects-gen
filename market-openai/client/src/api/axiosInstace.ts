import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "https://ai-projects-gen.onrender.com/api/v1",
  headers: {
    "Content-Type": "application/json",
  },
});

export default axiosInstance;
