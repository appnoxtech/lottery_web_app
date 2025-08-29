import { type AxiosResponse } from "axios";
import { get } from "../api.util";

const getLocations = async (): Promise<AxiosResponse | void> => {
  try {
    const response = await get(`all-cities`);
    return response;
  } catch (error: any) {
    console.error("Location Data error: ", error);
    throw error;
  }
};
export { getLocations };
