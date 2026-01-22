import axios from "axios";

const axiosInstance = axios.create({
  //baseURL: 'https://ai-projects-gen-1.onrender.com/api/v1',
  baseURL: "http://localhost:8080/api/v1",
  headers: {
    "Content-Type": "application/json",
  },
});

export default axiosInstance;
