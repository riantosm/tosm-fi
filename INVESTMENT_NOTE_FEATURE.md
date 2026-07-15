# Investment Transaction Note Feature

## Feature Overview
Add optional note field to investment transactions (specifically money out/withdrawal). Notes can be added during creation and edited later.

## Frontend Changes (Completed ✅)

### 1. Types (`src/types/investment-transaction.types.ts`)
- ✅ Added `note?: string` to `InvestmentTransaction` interface
- ✅ Added `note?: string` to `UpdateInvestmentTransactionInput` interface  
- ✅ Added `note?: string` to `MoneyOutInput` interface

### 2. Withdrawal Form Modal (`src/layouts/investment/WithdrawalFormModal/index.tsx`)
- ✅ Added `note` state with `useState("")`
- ✅ Added note input field before wallet selector
- ✅ Pass `note` (or `undefined` if empty) to `createMoneyOut()` call

### 3. Edit Transaction Modal (`src/layouts/investment/EditInvestmentTransactionModal/index.tsx`)
- ✅ Added `note` state initialized from `transaction.note ?? ""`
- ✅ Added conditional note input field (only shows for "out" type transactions)
- ✅ Include note in the PATCH request (only for out transactions)

### 4. Transaction List Display (`src/layouts/investment/InvestmentTransactionRow/index.tsx`)
- ✅ Display note in subtitle (after date) if it exists
- ✅ Format: `"type · date · note_text"`

### 5. Translations
- ✅ Added `investment.noteLabel` = "Note" (EN) / "Catatan" (ID) / "メモ" (JP)
- ✅ Added `investment.notePlaceholder` = "Add a note (optional)" (EN) / "Tambahkan catatan (opsional)" (ID) / "メモを追加（任意）" (JP)

### 6. API Documentation (`src/constants/api-docs.ts`)
- ✅ Updated "Create Money Out" payload to include `note` (optional, string)
- ✅ Updated "Update Investment Transaction" payload to include `note` (optional, string)
- ✅ Updated example responses to show note field

## Backend Implementation (TODO)

### 1. InvestmentTransaction Schema
Add optional note field to MongoDB schema:
```typescript
note?: string;  // optional, max 500 chars recommended
```

### 2. API Endpoints to Update

#### POST `/investment-transactions/out`
- Accept optional `note` field in request body
- Store note in the created transaction document
- Include note in response

#### PATCH `/investment-transactions/:idInvestmentTransaction`
- Accept optional `note` field in request body
- Only update note if provided and transaction type is "out"
- Include note in response

#### GET `/investment-transactions`
- Include note field in response (if present)

### 3. Service Layer
- Update `createMoneyOut()` to handle note parameter
- Update `updateInvestmentTransaction()` to handle note parameter
- Validate note length (optional, recommend max 500 chars)

### 4. Validation
- Note is optional (null/undefined allowed)
- If provided, validate as string
- Recommend max length: 500 characters

## Testing Checklist

### Frontend
- [ ] Create withdrawal with note → verify note displays in list
- [ ] Create withdrawal without note → verify list shows no note
- [ ] Edit withdrawal note → verify change persists
- [ ] Edit other transaction types → note field should NOT appear
- [ ] Check translations in all 3 languages

### Backend
- [ ] POST `/investment-transactions/out` with note → saves correctly
- [ ] POST `/investment-transactions/out` without note → works (note: null/undefined)
- [ ] PATCH endpoint → can update note
- [ ] GET returns note in response
- [ ] Validate max length if implemented

## Notes
- Note field is **optional** for better UX (users shouldn't be forced to add notes)
- Note is displayed **only for "out" type** transactions (where it makes most sense - withdrawal reasons)
- Note display truncation not implemented yet - might want to add later if notes get long
