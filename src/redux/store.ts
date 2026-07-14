import { type Action, combineReducers, configureStore, type ThunkAction } from "@reduxjs/toolkit";
import {
  createTransform,
  persistReducer,
  persistStore,
  type PersistConfig,
  type Storage,
} from "redux-persist";
import {
  authenticationSlice,
  categorySlice,
  settingsSlice,
  transactionSlice,
  userApprovalSlice,
  walletSlice,
  type ICategoryReduxState,
  type ITransactionReduxState,
  type IWalletReduxState,
} from "./slices";

const storage: Storage = {
  getItem: (key) => Promise.resolve(window.localStorage.getItem(key)),
  setItem: (key, value) => Promise.resolve(window.localStorage.setItem(key, value)),
  removeItem: (key) => Promise.resolve(window.localStorage.removeItem(key)),
};

const reducer = combineReducers({
  authentication: authenticationSlice,
  wallet: walletSlice,
  category: categorySlice,
  transaction: transactionSlice,
  settings: settingsSlice,
  // Not persisted — always refetched from the server, since it's an
  // admin-only view of other users' pending requests.
  userApproval: userApprovalSlice,
});

// Persisted `status: "loaded"` would otherwise make every consumer's
// `if (status === "idle") load…()` guard skip refetching after a reload —
// showing indefinitely-stale data (a previous account's wallets/categories,
// or changes made directly via the API). Forcing it back to "idle" on
// rehydrate makes every such guard refetch fresh data on the next mount.
// One transform per slice backed by a real API.
function createResetStatusOnRehydrateTransform<T extends { status: string }>(
  sliceKey: "wallet" | "category" | "transaction",
) {
  return createTransform<T, T>(
    (inboundState) => inboundState,
    (outboundState) => ({ ...outboundState, status: "idle" }),
    { whitelist: [sliceKey] },
  );
}

const persistConfig: PersistConfig<ReturnType<typeof reducer>> = {
  key: "tosmfi-root-1",
  version: 1,
  storage,
  whitelist: ["authentication", "wallet", "category", "transaction", "settings"],
  transforms: [
    createResetStatusOnRehydrateTransform<IWalletReduxState>("wallet"),
    createResetStatusOnRehydrateTransform<ICategoryReduxState>("category"),
    createResetStatusOnRehydrateTransform<ITransactionReduxState>("transaction"),
  ],
};

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
