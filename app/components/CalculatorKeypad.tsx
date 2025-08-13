"use client";
import React, { memo, useMemo } from "react";
import Button from "./Button";
import { useTheme } from "../contexts/ThemeContext";

interface CalculatorKeypadProps {
  handleNumber: (num: string) => void;
  handleOperator: (op: string) => void;
  handleClear: () => void;
  handleBackspace: () => void;
  handleEquals: () => void;
  handleDecimal: () => void;
  handleParentheses: () => void;
  handlePercent: () => void;
}

const CalculatorKeypad = memo(({
  handleNumber,
  handleOperator,
  handleClear,
  handleBackspace,
  handleEquals,
  handleDecimal,
  handleParentheses,
  handlePercent,
}: CalculatorKeypadProps) => {
  const { currentTheme: theme } = useTheme();

  const numberButtons = useMemo(
    () => [
      [7, 8, 9],
      [4, 5, 6],
      [1, 2, 3],
    ],
    []
  );

  return (
    <div
      className="p-4"
      style={{ paddingBottom: "max(2rem, env(safe-area-inset-bottom))" }}
    >
      <div className="grid grid-cols-4 gap-3">
        <Button variant="ac" theme={theme} onClick={handleClear}>
          AC
        </Button>
        <Button variant="operator" theme={theme} onClick={handleParentheses}>
          ( )
        </Button>
        <Button variant="operator" theme={theme} onClick={handlePercent}>
          %
        </Button>
        <Button
          variant="operator"
          theme={theme}
          onClick={() => handleOperator("÷")}
        >
          ÷
        </Button>

        {numberButtons[0].map((n) => (
          <Button key={n} theme={theme} onClick={() => handleNumber(String(n))}>
            {n}
          </Button>
        ))}
        <Button
          variant="operator"
          theme={theme}
          onClick={() => handleOperator("×")}
        >
          ×
        </Button>

        {numberButtons[1].map((n) => (
          <Button key={n} theme={theme} onClick={() => handleNumber(String(n))}>
            {n}
          </Button>
        ))}
        <Button
          variant="operator"
          theme={theme}
          onClick={() => handleOperator("−")}
        >
          −
        </Button>

        {numberButtons[2].map((n) => (
          <Button key={n} theme={theme} onClick={() => handleNumber(String(n))}>
            {n}
          </Button>
        ))}
        <Button
          variant="operator"
          theme={theme}
          onClick={() => handleOperator("+")}
        >
          +
        </Button>

        <Button theme={theme} onClick={() => handleNumber("0")}>
          0
        </Button>
        <Button theme={theme} onClick={handleDecimal}>
          .
        </Button>
        <Button variant="operator" theme={theme} onClick={handleBackspace}>
          ⌫
        </Button>
        <Button variant="equal" theme={theme} onClick={handleEquals}>
          =
        </Button>
      </div>
    </div>
  );
});

CalculatorKeypad.displayName = 'CalculatorKeypad';

export default CalculatorKeypad;
export type { CalculatorKeypadProps };