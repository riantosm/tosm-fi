import { type Action, combineReducers, configureStore, type ThunkAction } from "@reduxjs/toolkit";
import { persistReducer, persistStore, type Storage } from "redux-persist";
import { authenticationSlice, categorySlice, walletSlice } from "./slices";

const storage: Storage = {
  getItem: (key) => Promise.resolve(window.localStorage.getItem(key)),
  setItem: (key, value) => Promise.resolve(window.localStorage.setItem(key, value)),
  removeItem: (key) => Promise.resolve(window.localStorage.removeItem(key)),
};

const persistConfig = {
  key: "tosmfi-root",
  version: 1,
  storage,
  whitelist: ["authentication", "wallet", "category"],
};

const reducer = combineReducers({
  authentication: authenticationSlice,
  wallet: walletSlice,
  category: categorySlice,
});

const persistedReducer = persistReducer(persistConfig, reducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export const persistor = persistStore(store);

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  Action<string>
>;
