import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

interface Prize {
  "1st_prize": string[];
  "2nd_prize": string[];
  "3rd_prize": string[];
}

interface WinnerData {
  [key: string]: Prize;
}

interface WinnerState {
  winnersList: WinnerData[] | null;
}

const initialState: WinnerState = {
  winnersList: [],
};

const winnerSlice = createSlice({
  name: "winner",
  initialState,
  reducers: {
    addToWinnerList: (state, action: PayloadAction<WinnerData[]>) => {
      state.winnersList = action.payload;
    },
    clearWinnersList: (state) => {
      state.winnersList = [];
    },
  },
});

export const { addToWinnerList, clearWinnersList } = winnerSlice.actions;

export default winnerSlice.reducer;
