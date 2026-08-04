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
  budgetSlice,
  categorySlice,
  clientErrorSlice,
  instrumentSlice,
  investmentTransactionSlice,
  scheduleOccurrenceSlice,
  scheduleSlice,
  settingsSlice,
  transactionSlice,
  userApprovalSlice,
  walletSlice,
  type IBudgetReduxState,
  type ICategoryReduxState,
  type IInstrumentReduxState,
  type IScheduleReduxState,
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
  instrument: instrumentSlice,
  investmentTransaction: investmentTransactionSlice,
  // Not persisted, same reasoning as userApproval — an admin-only view of
  // every user's reported crashes, always refetched fresh.
  clientError: clientErrorSlice,
  // Recurring-schedule rules — relatively stable, persisted like wallet/category.
  schedule: scheduleSlice,
  // Budget definitions (limits are a reminder feature) — backed by a real
  // API now, persisted like wallet/category/instrument/schedule.
  budget: budgetSlice,
  // Not persisted — pending occurrences are always regenerated/refetched
  // fresh from the backend's lazy catch-up generator, same reasoning as transaction.
  scheduleOccurrence: scheduleOccurrenceSlice,
});

// Persisted `status: "loaded"` would otherwise make every consumer's
// `if (status === "idle") load…()` guard skip refetching after a reload —
// showing indefinitely-stale data (a previous account's wallets/categories,
// or changes made directly via the API). Forcing it back to "idle" on
// rehydrate makes every such guard refetch fresh data on the next mount.
// One transform per slice backed by a real API.
function createResetStatusOnRehydrateTransform<T extends { status: string }>(
  sliceKey: "wallet" | "category" | "instrument" | "schedule" | "budget",
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
  // `transaction` is deliberately not persisted: the slice is only a
  // mutation-change signal now (every page fetches its own scoped window via
  // queryTransactions), so persisting its accumulated array would be dead weight.
  // `investmentTransaction` is the same story — a growing ledger, always
  // freshly fetched, never persisted. `instrument` IS persisted now that it's
  // backed by a real API, same treatment as wallet/category.
  whitelist: [
    "authentication",
    "wallet",
    "category",
    "settings",
    "instrument",
    "schedule",
    "budget",
  ],
  transforms: [
    createResetStatusOnRehydrateTransform<IWalletReduxState>("wallet"),
    createResetStatusOnRehydrateTransform<ICategoryReduxState>("category"),
    createResetStatusOnRehydrateTransform<IInstrumentReduxState>("instrument"),
    createResetStatusOnRehydrateTransform<IScheduleReduxState>("schedule"),
    createResetStatusOnRehydrateTransform<IBudgetReduxState>("budget"),
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
