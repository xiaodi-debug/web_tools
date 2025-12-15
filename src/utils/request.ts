import axios, { type AxiosInstance, type AxiosRequestConfig } from "axios";

export type ApiResponse<T> = {
  code: number;
  message: string;
  data: T;
};

const instance: AxiosInstance = axios.create({
  baseURL: "/api",
  timeout: 15000,
});

instance.interceptors.request.use((config) => {
  return config;
});

instance.interceptors.response.use(
  (response) => response.data,
  (error) => {
    return Promise.reject(error);
  }
);

export const request = <T = unknown>(config: AxiosRequestConfig) => {
  return instance.request<any, ApiResponse<T>>(config);
};

export default instance;
