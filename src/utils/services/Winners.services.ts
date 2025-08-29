import { type AxiosResponse } from "axios";
import { get } from "../api.util";

const getCurrentUTCTime = async (): Promise<AxiosResponse | void> => {
  try {
    const response = await get('current-utc-time');
    return response;
  } catch (error: any) {
    console.error("Get UTC time error: ", error);
    throw error;
  }
};

const getWinningNumber = async (lotteryID: string | number): Promise<AxiosResponse | void> => {
  try {
    const response = await get(`winners-list?lottery_id=${lotteryID}`);
    return response;
  } catch (error: any) {
//     console.error("winner data error: ", error);
//     throw error;
  }
};

const getTodayWinningNumber = async (lotteryID: string | number): Promise<AxiosResponse | void> => {
  try {
    const response = await get(`todays-winner?lottery_id=${lotteryID}`);
    return response;
  } catch (error: any) {
//     console.error("get today winner data error: ", error);
//     throw error;
  }
};

const getYesterDayWinningNumber = async (lotteryID: string | number): Promise<AxiosResponse | void> => {
  try {
    const response = await get(`winners-list?lottery_id=${lotteryID}`);
    return response;
  } catch (error: any) {
//     console.error("get yesterday winner data error: ", error);
//     throw error;
  }
};

const getWinnerHistory
= async (lotteryID: string | number,digitType: string | number): Promise<AxiosResponse | void> => {
  try {
    const response = await get(`lottery-winners?digit=${digitType}&lottery_id=${lotteryID}`);
    return response;
  } catch (error: any) {
//     console.error("winner history data error: ", error);
//     throw error;
  }
};



export{
    getWinningNumber,
    getWinnerHistory,
    getTodayWinningNumber,
    getYesterDayWinningNumber,
    getCurrentUTCTime
}