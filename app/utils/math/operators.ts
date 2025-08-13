export interface Operator {
  symbol: string;
  precedence: number;
  associativity: 'left' | 'right';
  execute: (left: number, right: number) => number;
}

export interface UnaryOperator {
  symbol: string;
  precedence: number;
  execute: (operand: number) => number;
}


export const BINARY_OPERATORS: Record<string, Operator> = {
  '+': {
    symbol: '+',
    precedence: 1,
    associativity: 'left',
    execute: (left: number, right: number) => left + right
  },
  '-': {
    symbol: '-',
    precedence: 1,
    associativity: 'left',
    execute: (left: number, right: number) => left - right
  },
  '*': {
    symbol: '*',
    precedence: 2,
    associativity: 'left',
    execute: (left: number, right: number) => left * right
  },
  '/': {
    symbol: '/',
    precedence: 2,
    associativity: 'left',
    execute: (left: number, right: number) => {
      if (right === 0) {
        throw new Error('Division by zero');
      }
      return left / right;
    }
  },
  '%': {
    symbol: '%',
    precedence: 2,
    associativity: 'left',
    execute: (left: number, right: number) => {
      if (right === 0) {
        throw new Error('Modulo by zero');
      }
      return left % right;
    }
  },
  '^': {
    symbol: '^',
    precedence: 3,
    associativity: 'right',
    execute: (left: number, right: number) => Math.pow(left, right)
  }
};


export const UNARY_OPERATORS: Record<string, UnaryOperator> = {
  '+': {
    symbol: '+',
    precedence: 4,
    execute: (operand: number) => +operand
  },
  '-': {
    symbol: '-',
    precedence: 4,
    execute: (operand: number) => -operand
  }
};

export function isBinaryOperator(symbol: string): boolean {
  return symbol in BINARY_OPERATORS;
}

export function isUnaryOperator(symbol: string): boolean {
  return symbol in UNARY_OPERATORS;
}

export function getBinaryOperator(symbol: string): Operator {
  const operator = BINARY_OPERATORS[symbol];
  if (!operator) {
    throw new Error(`Unknown binary operator: ${symbol}`);
  }
  return operator;
}

export function getUnaryOperator(symbol: string): UnaryOperator {
  const operator = UNARY_OPERATORS[symbol];
  if (!operator) {
    throw new Error(`Unknown unary operator: ${symbol}`);
  }
  return operator;
}