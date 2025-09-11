import { type AxiosResponse } from "axios";
import { get, post } from "../api.util";

const createStripeIntent = async (
  payload: unknown
): Promise<AxiosResponse | void> => {
  try {
    const response = await post(`create-payment-intent`, payload, {
      Accept: "application/json",
    });
    return response;
  } catch (error: unknown) {
    console.error("payment intent api error: ", error);
    throw error;
  }
};

const placeOrder = async (payload: unknown): Promise<AxiosResponse | void> => {
  try {
    const response = await post(`place-order`, payload, {
      Accept: "application/json",
    });
    return response;
  } catch (error: unknown) {
    console.error("Place order api error: ", error);
    throw error;
  }
};

const getOrderHistory = async (params: unknown): Promise<AxiosResponse | void> => {
  try {
    const response = await get(`orders?search=${params}`, {
      Accept: "application/json",
    });
    return response;
  } catch (error: unknown) {
    console.error("get order history api error: ", error);
    throw error;
  }
};

const getOrderDetails = async (
  orderID: string | number
): Promise<AxiosResponse | void> => {
  try {
    const response = await get(`order/${orderID}`);
    console.log("order details: ", response);
    return response;
  } catch (error: unknown) {
    console.error("get order details api error: ", error);
    throw error;
  }
};

const orderComplete = async (order_id: number) => {
  try {
    const response = await post(`complete-order`, { order_id });
    return response;
  } catch (error: unknown) {
    console.error("order complete api error: ", error);
    throw error;
  }
};

const getDailyLotteryTickets = async (
  userID: string | number,
  date: string
): Promise<AxiosResponse | void> => {
  try {
    const response = await get(`sub-order?user_id=${userID}&date=${date}`);
    return response;
  } catch (error: unknown) {
    console.error("Error fetching today's order details: ", error);
    throw error;
  }
};

export {
  createStripeIntent,
  placeOrder,
  getOrderHistory,
  getOrderDetails,
  getDailyLotteryTickets,
  orderComplete,
};
