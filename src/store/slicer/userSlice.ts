import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import storage from "redux-persist/lib/storage";
import { persistReducer } from "redux-persist";

interface UserState {
  userData: Record<string, string> | null;
  authStatus: boolean;
  tokenID: string | null;
}

const initialState: UserState = {
  userData: null,
  authStatus: false,
  tokenID: null,
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUser: (
      state,
      action: PayloadAction<{
        userData: Record<string, string>;
        token: string;
        ref_code?: string;
      }>
    ) => {
      state.userData = { ...action.payload.userData };
      state.authStatus = !!action.payload.token;
      state.tokenID = action.payload.token;
      storage.setItem("userData", JSON.stringify(action.payload.userData));
      storage.setItem("authToken", action.payload.token);
    },
    clearUser: (state) => {
      state.userData = null;
      state.authStatus = false;
      state.tokenID = null;
      // persistor.purge();
    },
    updateUser: (
      state,
      action: PayloadAction<{ userData: Record<string, string> }>
    ) => {
      state.userData = { ...action.payload.userData };
    },
    updateToken: (state, action: PayloadAction<string>) => {
      state.tokenID = action.payload;
      state.authStatus = !!action.payload;
      storage.setItem("authToken", action.payload);
    },
    rehydrateUser: (
      state,
      action: PayloadAction<{
        userData: Record<string, string>;
        token: string | null;
      }>
    ) => {
      state.userData = action.payload.userData;
      state.tokenID = action.payload.token;
      state.authStatus = !!action.payload.token;
    },
  },
});

const persistConfig = {
  key: "user",
  storage,
  whitelist: ["userData", "authStatus", "tokenID"],
};

const persistedUserReducer = persistReducer(persistConfig, userSlice.reducer);

export const { setUser, clearUser, updateUser, updateToken, rehydrateUser } =
  userSlice.actions;
export default persistedUserReducer;
