import { CustomBinaryOperator } from './types';


export const CUSTOM_BINARY_OPERATORS: Record<string, CustomBinaryOperator> = {
  
  
  
  
  
  
  
  
  
  
  
  
  
  
};

export function isCustomBinaryOperator(symbol: string): boolean {
  return symbol in CUSTOM_BINARY_OPERATORS;
}

export function getCustomBinaryOperator(symbol: string): CustomBinaryOperator {
  const operator = CUSTOM_BINARY_OPERATORS[symbol];
  if (!operator) {
    throw new Error(`Unknown custom binary operator: ${symbol}`);
  }
  return operator;
}

export function addCustomBinaryOperator(operator: CustomBinaryOperator): void {
  CUSTOM_BINARY_OPERATORS[operator.symbol] = operator;
}

export function removeCustomBinaryOperator(symbol: string): boolean {
  if (symbol in CUSTOM_BINARY_OPERATORS) {
    delete CUSTOM_BINARY_OPERATORS[symbol];
    return true;
  }
  return false;
}

export function listCustomBinaryOperators(): CustomBinaryOperator[] {
  return Object.values(CUSTOM_BINARY_OPERATORS);
}