import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { persistReducer } from "redux-persist";
import { showToast } from "../../utils/toast.util";
import { checkAlreadySelected } from "../../hooks/utilityFn";
import storage from "redux-persist/lib/storage";
import type { Lottery } from "./initalDataSlice";

export interface CartItem {
  ticket_id: string;
  selectedLotetryTypes: Lottery;
  selectedLotteryTickets: string[];
  total_bet_amount: number;
}

export interface SelectedLotteryTickets {
  lottery_number: string;
  [key: string]: string;
}

interface CartState {
  cartItem: CartItem[];
  selectedTickets: SelectedLotteryTickets[];
  // selectedLotteries: Lottery[];
  selectedLotteries: Lottery[]; // This should match your actual data structure
}

const initialState: CartState = {
  cartItem: [],
  selectedTickets: [],
  selectedLotteries: [],
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    addToCart: (state, action: PayloadAction<CartItem>) => {
      if (!Array.isArray(state.cartItem)) {
        state.cartItem = [];
      }
      // const existingItem = state.cartItem.find(
      //   (item) => item.ticket_id === action.payload.id
      // );
      state.cartItem = [...state.cartItem, action.payload];
    },

    removeFromCart: (state, action: PayloadAction<string>) => {
      state.cartItem = state.cartItem.filter(
        (item) => item.ticket_id !== action.payload
      );
    },

    clearCart: (state) => {
      state.cartItem = [];
    },

    addToSelectedTickets: (
      state,
      action: PayloadAction<{
        ticket: string[];
        selectedDigits: number[];
      }>
    ) => {
      if (!Array.isArray(state.selectedTickets)) {
        state.selectedTickets = [];
      }

      const existingItem = action.payload.ticket.some((item: string) =>
        checkAlreadySelected(state.selectedTickets, "lottery_number", item)
      );

      if (existingItem) {
        showToast(
          "This number has already been added to your ticket. Please choose a different number.",
          "error"
        );
        return;
      }

      const generatedNumbers = action.payload.selectedDigits
        .flatMap((digit) => {
          return action.payload.ticket.map((number: string) => {
            // Slice each ticket number to get the desired part
            const slicedNumber = number.slice(number.length - digit);
            // Validate the sliced ticket number's length
            if (slicedNumber.length >= 2 && slicedNumber.length <= 4) {
              return { lottery_number: slicedNumber }; // Wrap slicedNumber in an array
            }
            return null; // Return null for invalid numbers
          });
        })
        .filter((ticket) => ticket !== null)
        .filter(
          (ticket, index, self) =>
            // Filter unique tickets based on 'lottery_number'
            self.findIndex(
              (item) => item?.lottery_number === ticket?.lottery_number
            ) === index
        );

      // Check if any valid numbers were generated
      if (generatedNumbers.length > 0) {
        state.selectedTickets = [...state.selectedTickets, ...generatedNumbers];
        showToast("The number has been added to your ticket.", "success");
      } else {
        showToast("No valid ticket numbers were added.", "warning");
      }
    },

    removeFromSelectedTickets: (state, action: PayloadAction<string>) => {
      state.selectedTickets = state.selectedTickets.filter(
        (item) => item.lottery_number !== action.payload
      );
    },

    clearSelectedTickets: (state) => {
      state.selectedTickets = [];
    },

    refreshSelectedLotteries: (state, action: PayloadAction<Lottery>) => {
      // Always refresh with the latest lottery data
      state.selectedLotteries = [action.payload];
      // Clear any existing selected tickets when lottery type changes
      state.selectedTickets = [];
    },

    addToSelectedLotteries: (state, action: PayloadAction<Lottery>) => {
      if (!Array.isArray(state.selectedLotteries)) {
        state.selectedLotteries = [];
      }

      // Always use the latest lottery data
      const exists = state.selectedLotteries.some(
        (lottery) => lottery.id === action.payload.id
      );

      if (!exists) {
        state.selectedLotteries = [...state.selectedLotteries, action.payload];
      } else {
        // Update existing lottery with latest data
        state.selectedLotteries = state.selectedLotteries.map((lottery) =>
          lottery.id === action.payload.id ? action.payload : lottery
        );
      }
    },

    removeFromSelectedLotteries: (state, action: PayloadAction<number>) => {
      state.selectedLotteries = state.selectedLotteries.filter(
        (item) => item.id !== action.payload
      );
    },

    clearSelectedLotteries: (state) => {
      state.selectedLotteries = [];
    },
  },
});

const persistConfig = {
  key: "cart",
  storage,
  whitelist: ["cartItem"], // Only persist cart items, not selections
  throttle: 1000, // Add throttling to prevent rapid storage updates
};

const persistedCartReducer = persistReducer(persistConfig, cartSlice.reducer);

export const {
  addToCart,
  removeFromCart,
  clearCart,
  addToSelectedTickets,
  removeFromSelectedTickets,
  clearSelectedTickets,
  addToSelectedLotteries,
  removeFromSelectedLotteries,
  clearSelectedLotteries,
  refreshSelectedLotteries,
} = cartSlice.actions;

export default persistedCartReducer;
