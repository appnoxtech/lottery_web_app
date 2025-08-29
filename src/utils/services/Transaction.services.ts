import { type AxiosResponse } from "axios";
import { get} from "../api.util";

const getTransactions = async (userID: string | number): Promise<AxiosResponse | void> => {
  try {
    const response = await get(`user/${userID}/transactions`);
    return response;
  } catch (error: any) {
    console.error("Transactions Data error: ", error);
    throw error;
  }
};
export { getTransactions };
