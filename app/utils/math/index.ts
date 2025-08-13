
export { MathEvaluator } from './mathEvaluator';
export { MathError } from './types';
export type { MathFunction, MathConstant, PrefixOperator, PostfixOperator, CustomBinaryOperator } from './types';


import { MathEvaluator } from './mathEvaluator';
export const mathEvaluator = new MathEvaluator();


export function evaluate(expression: string): number {
  return mathEvaluator.evaluate(expression);
}


export { addFunction, removeFunction, listFunctions } from './functions';
export { addConstant, removeConstant, listConstants } from './constants';
export { addPrefixOperator, removePrefixOperator, listPrefixOperators } from './prefixOperators';
export { addPostfixOperator, removePostfixOperator, listPostfixOperators } from './postfixOperators';
export { addCustomBinaryOperator, removeCustomBinaryOperator, listCustomBinaryOperators } from './customOperators';


import { MathTranspiler } from './transpiler';
import type { TranspilerResult } from './transpiler';

export { MathTranspiler } from './transpiler';
export type { TranspilerResult } from './transpiler';
export const transpile = (code: string, displayName?: string): TranspilerResult => MathTranspiler.transpile(code, displayName);
export const transpileAndRegister = (code: string, displayName?: string): TranspilerResult => MathTranspiler.transpileAndRegister(code, displayName);










