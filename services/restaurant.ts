import { Restaurant, TaxTypes, updatePasswordPayloadType } from "@/types";
import axiosInterceptorInstance from "./instance";

const restaurantAuthenticate = (payload: {
  userId: string;
  discountPassword: string;
}) => {
  return axiosInterceptorInstance.post("/users/restaurant/validate", payload);
};

const fetchRestaurant = (userId: string) => {
  return axiosInterceptorInstance
    .get(`/users/${userId}`)
    .then((res: any) => res.data);
};

const updateRestaurant = (payload: Restaurant) => {
  const { userId, ...restaurantSetting } = payload;
  return axiosInterceptorInstance.patch(
    `/users/restaurant/${userId}`,
    restaurantSetting
  );
};

const updateDayClosingRestuarant = (payload: {
  userId: string;
  dayClosingDate: string;
}) => {
  const { userId, ...rest } = payload;
  return axiosInterceptorInstance.patch(`/restaurant/user/${userId}`, rest);
};

const updateDiscountPassword = (payload: updatePasswordPayloadType) => {
  const { userId } = payload;
  return axiosInterceptorInstance.patch(
    `/users/restaurant/updatePassword/${userId}`,
    payload
  );
};
const createTax = (payload: TaxTypes) => {
  return axiosInterceptorInstance.post("/users/restaurant/tax", payload);
};
const getAllTax = (userId: string) => {
  return axiosInterceptorInstance
    .post(`/users/restaurant/tax/${userId}`)
    .then((res) => res.data);
};

const deleteRestaurant = (userId: string) => {
  return axiosInterceptorInstance
    .delete(`/users/restaurant/delete/${userId}`)
    .then((res) => res.data);
};

// const getRestaurantById = (userId: string) => {
//   return axiosInterceptorInstance
//     .get(`/restaurant/${userId}`)
//     .then((res: any) => res.data)
//     .catch((error) => {
//       throw new Error(`Failed to fetch restaurant data: ${error.message}`);
//     });
// };

const getRestaurantById = (userId: string) => {
  return axiosInterceptorInstance
    .get(`/restaurant/${userId}`)
    .then((res) => res.data);
};

export {
  createTax,
  getAllTax,
  restaurantAuthenticate,
  fetchRestaurant,
  updateRestaurant,
  updateDiscountPassword,
  updateDayClosingRestuarant,
  deleteRestaurant,
  getRestaurantById,
};
