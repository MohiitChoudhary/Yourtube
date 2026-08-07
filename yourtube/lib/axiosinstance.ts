import axios from "axios";

const axiosInstance = axios.create({
  baseURL:
    process.env.NEXT_PUBLIC_BACKEND_URL ||
    "http://localhost:5000" ||"https://yourtube-j2cd.onrender.com",

  headers: {
    "Content-Type": "application/json",
  },

  withCredentials: true,
});

export default axiosInstance;