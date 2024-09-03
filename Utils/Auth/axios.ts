import axios from "axios";

export const baseUrl = "https://api.memorilink.com/auth";

const instance = axios.create({
  baseURL: baseUrl,                  
  headers: {
    "Content-Type": "application/json"
  }
});

export default instance; 

