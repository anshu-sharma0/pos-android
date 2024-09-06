import axiosInterceptorInstance from "./instance";

const createTable = (payload: { email: string; password: string }) => {
  return axiosInterceptorInstance.post("/tables", payload);
};

const createMultiTables = (payload: {
  toCreate: object;
  toHide: object;
  toUnhide: object;
}) => {
  return axiosInterceptorInstance.post("/tables/multi", payload);
};

const fetchTables = () => {
  return axiosInterceptorInstance.get("/tables");
};

export { createTable, fetchTables, createMultiTables };
