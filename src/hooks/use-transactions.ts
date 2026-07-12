import { useCallback } from "react";
import { transactionService } from "@/services/transaction.service";
import type { Category } from "@/types/category.types";
import type { Transaction, TransactionInput } from "@/types/transaction.types";
import type { WalletAccount } from "@/types/wallet.types";
import {
  addTransaction,
  removeTransaction,
  setTransactions,
  setTransactionsLoading,
  updateCategory,
  updateTransaction,
  updateWallet,
  useAppDispatch,
  useAppSelector,
} from "@/redux";

interface WalletDelta {
  idWallet: string;
  amountDelta: number;
}

type WalletEffectSource = Pick<
  Transaction,
  "type" | "amount" | "idWallet" | "idWalletFrom" | "idWalletTo"
>;

function getWalletDeltas(entry: WalletEffectSource): WalletDelta[] {
  switch (entry.type) {
    case "income":
      return entry.idWallet ? [{ idWallet: entry.idWallet, amountDelta: entry.amount }] : [];
    case "expense":
      return entry.idWallet ? [{ idWallet: entry.idWallet, amountDelta: -entry.amount }] : [];
    case "correction":
      return entry.idWallet ? [{ idWallet: entry.idWallet, amountDelta: entry.amount }] : [];
    case "transfer": {
      const deltas: WalletDelta[] = [];
      if (entry.idWalletFrom) {
        deltas.push({ idWallet: entry.idWalletFrom, amountDelta: -entry.amount });
      }
      if (entry.idWalletTo) {
        deltas.push({ idWallet: entry.idWalletTo, amountDelta: entry.amount });
      }
      return deltas;
    }
  }
}

function accumulateWalletDeltas(
  revert: WalletDelta[],
  apply: WalletDelta[],
): Map<string, { balanceDelta: number; countDelta: number }> {
  const map = new Map<string, { balanceDelta: number; countDelta: number }>();
  for (const { idWallet, amountDelta } of revert) {
    const entry = map.get(idWallet) ?? { balanceDelta: 0, countDelta: 0 };
    entry.balanceDelta -= amountDelta;
    entry.countDelta -= 1;
    map.set(idWallet, entry);
  }
  for (const { idWallet, amountDelta } of apply) {
    const entry = map.get(idWallet) ?? { balanceDelta: 0, countDelta: 0 };
    entry.balanceDelta += amountDelta;
    entry.countDelta += 1;
    map.set(idWallet, entry);
  }
  return map;
}

function buildWalletUpdate(
  wallets: WalletAccount[],
  idWallet: string,
  balanceDelta: number,
  countDelta: number,
): WalletAccount | null {
  if (balanceDelta === 0 && countDelta === 0) return null;
  const wallet = wallets.find((item) => item.idWallet === idWallet);
  if (!wallet) return null;
  return {
    ...wallet,
    balance: wallet.balance + balanceDelta,
    transactionCount: wallet.transactionCount + countDelta,
  };
}

function buildCategoryUpdate(
  categories: Category[],
  idCategory: string,
  categoryDelta: number,
  subCategoryDeltas: Record<string, number>,
): Category | null {
  const category = categories.find((item) => item.idCategory === idCategory);
  if (!category) return null;
  return {
    ...category,
    transactionCount: category.transactionCount + categoryDelta,
    subCategories: category.subCategories.map((sub) => {
      const delta = subCategoryDeltas[sub.idSubCategory];
      return delta ? { ...sub, transactionCount: sub.transactionCount + delta } : sub;
    }),
  };
}

export function useTransactions() {
  const dispatch = useAppDispatch();
  const transactions = useAppSelector((state) => state.transaction.transactions);
  const status = useAppSelector((state) => state.transaction.status);
  const wallets = useAppSelector((state) => state.wallet.wallets);
  const categories = useAppSelector((state) => state.category.categories);

  const loadTransactions = useCallback(async () => {
    dispatch(setTransactionsLoading());
    const data = await transactionService.fetchTransactions();
    dispatch(setTransactions(data));
  }, [dispatch]);

  const applyWalletDeltas = useCallback(
    (revert: WalletDelta[], apply: WalletDelta[]) => {
      const deltas = accumulateWalletDeltas(revert, apply);
      for (const [idWallet, { balanceDelta, countDelta }] of deltas) {
        const walletUpdate = buildWalletUpdate(wallets, idWallet, balanceDelta, countDelta);
        if (walletUpdate) dispatch(updateWallet(walletUpdate));
      }
    },
    [dispatch, wallets],
  );

  const applyCategoryDeltas = useCallback(
    (revert: Pick<Transaction, "idCategory" | "idSubCategory">, apply: Pick<Transaction, "idCategory" | "idSubCategory">) => {
      if (revert.idCategory === apply.idCategory) {
        if (!apply.idCategory) return;
        const subCategoryDeltas: Record<string, number> = {};
        if (revert.idCategory && revert.idSubCategory) {
          subCategoryDeltas[revert.idSubCategory] = (subCategoryDeltas[revert.idSubCategory] ?? 0) - 1;
        }
        if (apply.idSubCategory) {
          subCategoryDeltas[apply.idSubCategory] = (subCategoryDeltas[apply.idSubCategory] ?? 0) + 1;
        }
        const categoryUpdate = buildCategoryUpdate(categories, apply.idCategory, 0, subCategoryDeltas);
        if (categoryUpdate) dispatch(updateCategory(categoryUpdate));
        return;
      }

      if (revert.idCategory) {
        const oldCategoryUpdate = buildCategoryUpdate(
          categories,
          revert.idCategory,
          -1,
          revert.idSubCategory ? { [revert.idSubCategory]: -1 } : {},
        );
        if (oldCategoryUpdate) dispatch(updateCategory(oldCategoryUpdate));
      }
      if (apply.idCategory) {
        const newCategoryUpdate = buildCategoryUpdate(
          categories,
          apply.idCategory,
          1,
          apply.idSubCategory ? { [apply.idSubCategory]: 1 } : {},
        );
        if (newCategoryUpdate) dispatch(updateCategory(newCategoryUpdate));
      }
    },
    [dispatch, categories],
  );

  const createTransaction = useCallback(
    async (input: TransactionInput) => {
      const created = await transactionService.createTransaction(input);
      dispatch(addTransaction(created));

      applyWalletDeltas([], getWalletDeltas(input));
      applyCategoryDeltas({ idCategory: null, idSubCategory: null }, input);

      return created;
    },
    [dispatch, applyWalletDeltas, applyCategoryDeltas],
  );

  const editTransaction = useCallback(
    async (idTransaction: string, input: TransactionInput) => {
      const existing = transactions.find((item) => item.idTransaction === idTransaction);
      if (!existing) return;

      const updated = await transactionService.updateTransaction(idTransaction, input, existing);
      dispatch(updateTransaction(updated));

      applyWalletDeltas(getWalletDeltas(existing), getWalletDeltas(input));
      applyCategoryDeltas(existing, input);

      return updated;
    },
    [dispatch, transactions, applyWalletDeltas, applyCategoryDeltas],
  );

  const deleteTransaction = useCallback(
    async (idTransaction: string) => {
      const existing = transactions.find((item) => item.idTransaction === idTransaction);
      if (!existing) return;

      await transactionService.deleteTransaction(idTransaction);
      dispatch(removeTransaction(idTransaction));

      applyWalletDeltas(getWalletDeltas(existing), []);
      applyCategoryDeltas(existing, { idCategory: null, idSubCategory: null });
    },
    [dispatch, transactions, applyWalletDeltas, applyCategoryDeltas],
  );

  return {
    transactions,
    status,
    loadTransactions,
    createTransaction,
    editTransaction,
    deleteTransaction,
  };
}
