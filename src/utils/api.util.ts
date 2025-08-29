import axios, { AxiosError } from "axios";
import type { AxiosResponse, InternalAxiosRequestConfig } from "axios";
import store from "../store";
import { clearUser } from "../store/slicer/userSlice";
import { showToast } from "./toast.util";

const BASE_URL = import.meta.env.VITE_API_URL || 'https://hopisuerte.com/api/';
const IMAGE_URL = import.meta.env.VITE_IMAGE_URL || 'https://hopisuerte.com/public/';
const STRIPE_KEY = import.meta.env.VITE_STRIPE_KEY || '';
console.log("BASE_URL:", BASE_URL);
console.log("IMAGE_URL:", IMAGE_URL);

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 60000,
});

axiosInstance.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem("userToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    if (error.response) {
      const { status } = error.response;
      
      console.error(`API Error ${status}:`, error.response.data);
      
      if (status === 401 || status === 403) {
        console.log("Authentication error, redirecting to login");
        showToast("Session expired. Please login again.", "error");
        localStorage.removeItem("userToken");
        store.dispatch(clearUser());
        setTimeout(() => {
          window.location.href = '/login';
        }, 1000);
      }
    } else if (error.request) {
      console.error("No response received:", error.request);
      showToast("Network error. Please check your connection.", "error");
    } else {
      console.error("Request setup error:", error.message);
      showToast("Something went wrong. Please try again.", "error");
    }
    
    return Promise.reject(error);
  }
);


const get = async (
  url: string,
  headers: object = {},
  params?: object
): Promise<any> => {
  try {
    const response = await axiosInstance.get(url, {
      headers: { ...headers },
      params,
    });
    return response;
  } catch (error) {
    console.error("GET request error:", error);
    throw error;
  }
};

const post = async (
  url: string,
  data: any,
  headers: object = {},
  params?: object
): Promise<any> => {
  try {
    const response = await axiosInstance.post(url, data, {
      headers: { ...headers },
      params,
    });
    return response;
  } catch (error) {
    console.error("POST request error:", error);
    throw error;
  }
};

const put = async (
  url: string,
  data: any,
  headers: object = {},
  params?: object
): Promise<any> => {
  try {
    const response = await axiosInstance.put(url, data, {
      headers: { ...headers },
      params,
    });
    return response;
  } catch (error) {
    console.error("PUT request error:", error);
    throw error;
  }
};

const del = async (
  url: string,
  data?: any,
  headers: object = {},
  params?: object
): Promise<any> => {
  try {
    const response = await axiosInstance.delete(url, {
      headers: { ...headers },
      data,
      params,
    });
    return response;
  } catch (error) {
    console.error("DELETE request error:", error);
    throw error;
  }
};

export { get, post, put, del, BASE_URL, IMAGE_URL,STRIPE_KEY};
