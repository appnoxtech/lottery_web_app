import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage";

export interface Location {
  id: number;
  name: string;
  image: string;
  status: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  [key: string]: string | number | null;
}

interface LocationState {
  locationData: Location[];
}

const initialState: LocationState = {
  locationData: [],
};

const locationSlice = createSlice({
  name: "location",
  initialState,
  reducers: {
    addLocation(state, action: PayloadAction<Location[]>) {
      state.locationData = action.payload;
    },
    clearLocation(state) {
      state.locationData = [];
    },
  },
});

export const { addLocation, clearLocation } = locationSlice.actions;

const persistConfig = {
  key: "location",
  storage,
  whitelist: ["locationData"],
};

const persistedLocationReducer = persistReducer(
  persistConfig,
  locationSlice.reducer
);

export default persistedLocationReducer;
