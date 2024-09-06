import axiosInterceptorInstance from "./instance";

const createCategory = (payload: { email: string; password: string }) => {
  return axiosInterceptorInstance.post("/category", payload);
};

const fetchCategory = () => {
  return axiosInterceptorInstance.get("/category").then((res) => res.data);
};

export { createCategory, fetchCategory };
