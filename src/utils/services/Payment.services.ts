import { type AxiosResponse } from "axios";
import { post } from "../api.util";

interface PaymentIntentData {
  amount: number;
  lotteryId?: string;
}

const createPaymentIntent = async (data: PaymentIntentData): Promise<AxiosResponse | void> => {
  try {
    const response = await post("create-payment-intent", data);
    return response;
  } catch (error: any) {
    console.error("Create Payment Intent error: ", error);
    throw error;
  }
};

export { createPaymentIntent };