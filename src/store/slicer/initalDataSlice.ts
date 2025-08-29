import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage";

export interface Lottery {
  id: number;
  name: string;
  abbreviation: string;
  closing_time: string;
  renew_time: string;
  [key: string]: string | number;
}

interface CartState {
  initData: Lottery[];
  selectedLotteryData: Lottery[];
}

const initialState: CartState = {
  initData: [],
  selectedLotteryData: [],
};

const initialDataSlice = createSlice({
  name: "initialData",
  initialState,
  reducers: {
    setInitialSelectedLottery(state, action: PayloadAction<Lottery[]>) {
      state.selectedLotteryData = action.payload;
    },
    setInitialData(state, action: PayloadAction<Lottery[]>) {
      state.initData = action.payload;
    },
    clearInitialData(state) {
      state.initData = [];
    },
    removeSelectedLotteryData(state) {
      state.selectedLotteryData = [];
    },
  },
});

export const {
  setInitialData,
  clearInitialData,
  setInitialSelectedLottery,
  removeSelectedLotteryData,
} = initialDataSlice.actions;

const persistConfig = {
  key: "initialData",
  storage,
  whitelist: ["initData", "selectedLotteryData"],
};

const persistedInitialDataReducer = persistReducer(
  persistConfig,
  initialDataSlice.reducer
);

export default persistedInitialDataReducer;
