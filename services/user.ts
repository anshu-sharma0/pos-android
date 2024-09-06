import { User } from "@/types";
import axiosInterceptorInstance from "./instance";

const userLogin = (payload: { email: string; password: string }) => {
  return axiosInterceptorInstance.post("/auth/login", payload);
};

const fetchUsers = (): Promise<User[]> => {
  return axiosInterceptorInstance.get("/users").then((res) => res.data);
};
const getSteward = () => {
  return axiosInterceptorInstance.get("/users/steward")
    .then((res) => {
      return res.data; 
    })
    .catch((error) => {
      throw error; 
    });
}

const createUser = (payload: User) => {
  return axiosInterceptorInstance.post("/users/user", payload).then((res) => res.data);
};

const updateUser = (payload: User) => {
  const { id, ...data } = payload;
  return axiosInterceptorInstance.patch(`/users/${id}`, data).then((res) => res.data);
};

const deleteProduct = (id: string) => {
  return axiosInterceptorInstance.patch(`/users/delete/${id}`);
};

const deleteUser=  (id:string)=>{
  return axiosInterceptorInstance.delete(`/users/remove/${id}`)
}

const createBulkUsers = (payload: User[]) => {
  return axiosInterceptorInstance.post("/users/bulk-upload", payload);
};

export {
  createUser,
  getSteward,
  deleteProduct,
  fetchUsers,
  userLogin,
  updateUser,
  createBulkUsers,
  deleteUser
};
