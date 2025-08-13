import { MathConstant } from './types';


export const MATH_CONSTANTS: Record<string, MathConstant> = {
  
  
  
  
};

export function isConstant(name: string): boolean {
  return name in MATH_CONSTANTS;
}

export function getConstant(name: string): MathConstant {
  const constant = MATH_CONSTANTS[name];
  if (!constant) {
    throw new Error(`Unknown constant: ${name}`);
  }
  return constant;
}

export function addConstant(constant: MathConstant): void {
  MATH_CONSTANTS[constant.name] = constant;
}

export function removeConstant(name: string): boolean {
  if (name in MATH_CONSTANTS) {
    delete MATH_CONSTANTS[name];
    return true;
  }
  return false;
}

export function listConstants(): MathConstant[] {
  return Object.values(MATH_CONSTANTS);
}