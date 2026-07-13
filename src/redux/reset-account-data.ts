import { resetCategories, resetTransactions, resetWallets } from "./slices";
import type { AppDispatch } from "./store";

// Called on every logout path (explicit logout, auto-logout on session
// expiry, or the Settings danger-zone reset) so a different account logging
// in on the same browser never sees the previous account's cached
// wallet/category/transaction data.
export function resetAccountData(dispatch: AppDispatch) {
  dispatch(resetWallets());
  dispatch(resetCategories());
  dispatch(resetTransactions());
}
