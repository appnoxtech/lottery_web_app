import { configureStore, combineReducers } from "@reduxjs/toolkit";
import { persistReducer, persistStore } from "redux-persist";
import storage from "redux-persist/lib/storage"; // defaults to localStorage for web
import {
  userReducer,
  cartReducer,
  winnerReducer,
  initialDataReducer,
  locationReducer,
} from "./slicer";

// Combine reducers
const rootReducer = combineReducers({
  user: userReducer,
  cart: cartReducer,
  winner: winnerReducer,
  initialData: initialDataReducer,
  location: locationReducer,
});

// Persist config
const persistConfig = {
  key: "root",
  storage,
  whitelist: ["user", "cart", "winner", "initalData", "location"], // reducers you want to persist
};

// Apply persist reducer
const persistedReducer = persistReducer(persistConfig, rootReducer);

// Configure store
export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }),
});

// Persistor
export const persistor = persistStore(store);

// Export store as default for backward compatibility
export default store;

// Types for later use
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
