import { MathEvaluator } from './math/mathEvaluator';

const mathEvaluator = new MathEvaluator();

export interface CustomItem {
  name: string;
  display: string;
  call?: string;
  type: 'function' | 'constant' | 'operand' | 'postfix' | 'prefix';
}

export function getAllCustomItems(): {
  functions: CustomItem[];
  constants: CustomItem[];
  prefixOperators: CustomItem[];
  postfixOperators: CustomItem[];
  operandOperators: CustomItem[];
} {
  const functions = mathEvaluator.listFunctions().map(func => ({
    name: func.name,
    display: func.displayName || func.name,
    call: func.name,
    type: 'function' as const
  }));

  const constants = mathEvaluator.listConstants().map(constant => ({
    name: constant.name,
    display: constant.name,
    type: 'constant' as const
  }));

  const prefixOperators = mathEvaluator.listPrefixOperators().map(op => ({
    name: op.symbol,
    display: op.displayName || op.symbol,
    type: 'prefix' as const
  }));

  const postfixOperators = mathEvaluator.listPostfixOperators().map(op => ({
    name: op.symbol,
    display: op.displayName || op.symbol,
    type: 'postfix' as const
  }));

  const operandOperators = mathEvaluator.listCustomBinaryOperators().map(op => ({
    name: op.symbol,
    display: op.displayName || op.symbol,
    type: 'operand' as const
  }));

  return {
    functions,
    constants,
    prefixOperators,
    postfixOperators,
    operandOperators
  };
}

export function getAllCustomItemsFlat(): CustomItem[] {
  const { functions, constants, prefixOperators, postfixOperators, operandOperators } = getAllCustomItems();
  
  return [...functions, ...constants, ...prefixOperators, ...postfixOperators, ...operandOperators];
}