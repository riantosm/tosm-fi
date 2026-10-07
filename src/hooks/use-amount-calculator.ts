import { useEffect, useState } from "react";
import { CURRENCIES } from "@/constants/currencies";
import { useCurrency } from "@/hooks/use-currency";

export type CalculatorOperator = "+" | "-" | "×" | "÷";

const OPERATORS: CalculatorOperator[] = ["+", "-", "×", "÷"];

function isOperator(value: string): value is CalculatorOperator {
  return (OPERATORS as string[]).includes(value);
}

function compute(a: number, b: number, operator: CalculatorOperator): number {
  switch (operator) {
    case "+":
      return a + b;
    case "-":
      return a - b;
    case "×":
      return a * b;
    case "÷":
      return b === 0 ? a : a / b;
  }
}

function evaluateTerms(terms: string[]): number {
  if (terms.length === 0) return 0;
  let result = parseFloat(terms[0]) || 0;
  for (let i = 1; i + 1 < terms.length; i += 2) {
    const operator = terms[i] as CalculatorOperator;
    const next = parseFloat(terms[i + 1]) || 0;
    result = compute(result, next, operator);
  }
  return result;
}

function getDecimalSeparator(locale: string): string {
  return (1.1).toLocaleString(locale).slice(1, -1);
}

function formatTermNumber(raw: string, locale: string): string {
  const [intPart, decPart] = raw.split(".");
  const groupedInt = (Number(intPart || "0") || 0).toLocaleString(locale);
  if (decPart === undefined) return groupedInt;
  return `${groupedInt}${getDecimalSeparator(locale)}${decPart}`;
}

interface UseAmountCalculatorOptions {
  onEnter?: (value: number) => void;
}

export function useAmountCalculator(
  initialValue: number,
  options: UseAmountCalculatorOptions = {},
) {
  const { onEnter } = options;
  const { format, currency } = useCurrency();
  const locale = CURRENCIES.find((item) => item.code === currency)?.locale ?? "en-US";

  const [terms, setTerms] = useState<string[]>([initialValue !== 0 ? String(initialValue) : "0"]);
  const [awaitingNewValue, setAwaitingNewValue] = useState(false);

  function handleDigit(digit: string) {
    if (awaitingNewValue) {
      setTerms([...terms, digit]);
      setAwaitingNewValue(false);
      return;
    }
    const last = terms[terms.length - 1];
    setTerms([...terms.slice(0, -1), last === "0" ? digit : last + digit]);
  }

  function handleDecimal() {
    if (awaitingNewValue) {
      setTerms([...terms, "0."]);
      setAwaitingNewValue(false);
      return;
    }
    const last = terms[terms.length - 1];
    if (last.includes(".")) return;
    setTerms([...terms.slice(0, -1), `${last}.`]);
  }

  function handleTripleZero() {
    if (awaitingNewValue) {
      setTerms([...terms, "0"]);
      setAwaitingNewValue(false);
      return;
    }
    const last = terms[terms.length - 1];
    if (last === "0") return;
    setTerms([...terms.slice(0, -1), `${last}000`]);
  }

  function handleBackspace() {
    const last = terms[terms.length - 1];

    if (isOperator(last)) {
      setTerms(terms.slice(0, -1));
      setAwaitingNewValue(false);
      return;
    }
    if (last.length > 1) {
      setTerms([...terms.slice(0, -1), last.slice(0, -1)]);
      return;
    }
    if (terms.length === 1) {
      setTerms(["0"]);
      return;
    }
    setTerms(terms.slice(0, -1));
    setAwaitingNewValue(false);
  }

  function handleOperator(operator: CalculatorOperator) {
    const last = terms[terms.length - 1];
    setTerms(isOperator(last) ? [...terms.slice(0, -1), operator] : [...terms, operator]);
    setAwaitingNewValue(true);
  }

  const value = evaluateTerms(terms);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      // Typing in a text field of the same dialog (notes, title) must not drive the calculator.
      const target = event.target as HTMLElement | null;
      if (target?.closest?.("input, textarea, select, [contenteditable='true']")) return;
      if (event.key >= "0" && event.key <= "9") {
        event.preventDefault();
        handleDigit(event.key);
        return;
      }
      switch (event.key) {
        case ".":
        case ",":
          event.preventDefault();
          handleDecimal();
          break;
        case "+":
          event.preventDefault();
          handleOperator("+");
          break;
        case "-":
          event.preventDefault();
          handleOperator("-");
          break;
        case "*":
          event.preventDefault();
          handleOperator("×");
          break;
        case "/":
          event.preventDefault();
          handleOperator("÷");
          break;
        case "Backspace":
          event.preventDefault();
          handleBackspace();
          break;
        case "Enter":
        case "=":
          event.preventDefault();
          onEnter?.(value);
          break;
        default:
          break;
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  });

  const expressionDisplay = terms
    .map((term, index) => (index % 2 === 1 ? ` ${term} ` : formatTermNumber(term, locale)))
    .join("");

  return {
    value,
    formattedValue: format(value),
    expressionDisplay,
    hasExpression: terms.length > 1,
    /** Locale decimal separator, for the keypad's decimal key label. */
    decimalSeparator: getDecimalSeparator(locale),
    handleDigit,
    handleDecimal,
    handleTripleZero,
    handleBackspace,
    handleOperator,
  };
}
