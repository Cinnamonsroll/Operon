import { MathFunction } from './types';


export const MATH_FUNCTIONS: Record<string, MathFunction> = {

};

export function isFunction(name: string): boolean {
  return name in MATH_FUNCTIONS;
}

export function getFunction(name: string): MathFunction {
  const func = MATH_FUNCTIONS[name];
  if (!func) {
    throw new Error(`Unknown function: ${name}`);
  }
  return func;
}

export function addFunction(func: MathFunction): void {
  MATH_FUNCTIONS[func.name] = func;
}

export function removeFunction(name: string): boolean {
  if (name in MATH_FUNCTIONS) {
    delete MATH_FUNCTIONS[name];
    return true;
  }
  return false;
}

export function listFunctions(): MathFunction[] {
  return Object.values(MATH_FUNCTIONS);
}