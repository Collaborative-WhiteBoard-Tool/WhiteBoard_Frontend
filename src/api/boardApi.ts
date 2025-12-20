import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
export const getBoards = async() => {
    const res = await axios.get(`${BASE_URL}/boards`)
    return res.data
}