import { useCallback } from "react";
import { useDispatch } from "react-redux";
import { lotteriesData } from "../utils/services/Lotteries.services";
import { showToast } from "../utils/toast.util";
import {
  setInitialData,
  setInitialSelectedLottery,
} from "../store/slicer/initalDataSlice";
import { refreshSelectedLotteries } from "../store/slicer/cartSlice";
import { handleApiError } from "./handleApiError";

export const useFetchLotteriesData = (selectedLotteryTypes: any[]) => {
  const dispatch = useDispatch();

  const fetchLotteriesData = useCallback(async () => {
    try {
      const response = await lotteriesData();
      if (response?.status === 200) {
        const lotteries = response?.data?.result;
        console.log("line 21",lotteries);
        // If no lottery data, show a toast and return early
        if (!Array.isArray(lotteries) || lotteries.length === 0) {
          showToast("No lottery data available.", "error");
          return;
        }

        // Only update if data is different
        dispatch(setInitialData(lotteries));

        const firstLottery = lotteries[0];
        
        // Only update selected lottery if none exists
        if (selectedLotteryTypes.length === 0 && firstLottery) {
          dispatch(setInitialSelectedLottery(firstLottery));
          dispatch(refreshSelectedLotteries(firstLottery));
        }
      }
    } catch (error) {
      handleApiError(error, "Failed to fetch lotteries.");
    }
  }, [dispatch, selectedLotteryTypes.length]); // Only recreate when these deps change

  return fetchLotteriesData;
};
