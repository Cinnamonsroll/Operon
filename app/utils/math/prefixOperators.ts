import { PrefixOperator } from './types';


export const PREFIX_OPERATORS: Record<string, PrefixOperator> = {

};

export function isPrefixOperator(symbol: string): boolean {
  return symbol in PREFIX_OPERATORS;
}

export function getPrefixOperator(symbol: string): PrefixOperator {
  const operator = PREFIX_OPERATORS[symbol];
  if (!operator) {
    throw new Error(`Unknown prefix operator: ${symbol}. You need to define this prefix operator first using the Operations menu.`);
  }
  return operator;
}

export function addPrefixOperator(operator: PrefixOperator): void {
  PREFIX_OPERATORS[operator.symbol] = operator;
}

export function removePrefixOperator(symbol: string): boolean {
  if (symbol in PREFIX_OPERATORS) {
    delete PREFIX_OPERATORS[symbol];
    return true;
  }
  return false;
}

export function listPrefixOperators(): PrefixOperator[] {
  return Object.values(PREFIX_OPERATORS);
}