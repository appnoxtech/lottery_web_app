import { type AxiosResponse } from "axios";
import { get, post } from "../api.util";

const lotteriesData = async (): Promise<AxiosResponse | void> => {
  try {
    const response = await get(`lotteries`);
    return response;
  } catch (error: any) {
    console.error("Lotteries Data error: ", error);
    throw error;
  }
};

const searchlotteryTickets = async (data: any): Promise<AxiosResponse | void> => {
  try {
    const response = await post(`generate-numbers`, data);
    return response;
  } catch (error: any) {
    console.error("Search Lottery Tickets error: ", error);
    throw error;
  }
};

const getLotteryAvailability = async (data: any): Promise<AxiosResponse | void> => {
  try {
    const response = await post(`lottery/check-availability`, data);
    console.log("line 28 lottery availability",response);
    
    return response;
  } catch (error: any) {
    console.error("Ticket availability error: ", error);
    throw error;
  }
};

const checkLottery = async (data: any): Promise<AxiosResponse | void> => {
  try {
    const response = await post(`lottery/check`, data);
    return response;
  } catch (error: any) {
    console.error("Lottery check error: ", error);
    throw error;
  }
};

export{
  lotteriesData,
  searchlotteryTickets,
  getLotteryAvailability,
  checkLottery,
}