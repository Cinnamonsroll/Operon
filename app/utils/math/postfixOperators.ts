import { PostfixOperator } from './types';


export const POSTFIX_OPERATORS: Record<string, PostfixOperator> = {
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
};

export function isPostfixOperator(symbol: string): boolean {
  return symbol in POSTFIX_OPERATORS;
}

export function getPostfixOperator(symbol: string): PostfixOperator {
  const operator = POSTFIX_OPERATORS[symbol];
  if (!operator) {
    throw new Error(`Unknown postfix operator: ${symbol}`);
  }
  return operator;
}

export function addPostfixOperator(operator: PostfixOperator): void {
  POSTFIX_OPERATORS[operator.symbol] = operator;
}

export function removePostfixOperator(symbol: string): boolean {
  if (symbol in POSTFIX_OPERATORS) {
    delete POSTFIX_OPERATORS[symbol];
    return true;
  }
  return false;
}

export function listPostfixOperators(): PostfixOperator[] {
  return Object.values(POSTFIX_OPERATORS);
}