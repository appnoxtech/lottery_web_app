import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

interface Winner {
  id: string;
  lotteryName: string;
  ticketNumber: string;
  winnerName: string;
  winnerPhone: string;
  prizeAmount: number;
  drawDate: string;
  drawTime: string;
  claimStatus: string;
  claimDate: string | null;
  prizeType: string;
  lotteryId: number;
}

interface WinnerState {
  winnersList: Winner[] | null;
}

const initialState: WinnerState = {
  winnersList: [],
};

const winnerSlice = createSlice({
  name: "winner",
  initialState,
  reducers: {
    addToWinnerList: (state, action: PayloadAction<Winner[]>) => {
      state.winnersList = action.payload;
    },
    clearWinnersList: (state) => {
      state.winnersList = [];
    },
  },
});

export const { addToWinnerList, clearWinnersList } = winnerSlice.actions;

export default winnerSlice.reducer;
