import { Tokenizer } from './tokenizer';
import { Parser } from './parser';
import { Evaluator } from './evaluator';
import { MathError, MathFunction, MathConstant, PrefixOperator, PostfixOperator, CustomBinaryOperator } from './types';
import { addFunction, removeFunction, listFunctions, getFunction } from './functions';
import { addConstant, removeConstant, listConstants, getConstant } from './constants';
import { addPrefixOperator, removePrefixOperator, listPrefixOperators, getPrefixOperator } from './prefixOperators';
import { addPostfixOperator, removePostfixOperator, listPostfixOperators, getPostfixOperator } from './postfixOperators';
import { addCustomBinaryOperator, removeCustomBinaryOperator, listCustomBinaryOperators, getCustomBinaryOperator } from './customOperators';

export class MathEvaluator {
  private evaluator: Evaluator;

  constructor() {
    this.evaluator = new Evaluator();
  }

  public evaluate(expression: string): number {
    try {
      const tokenizer = new Tokenizer(expression);
      const tokens = tokenizer.tokenize();
      const parser = new Parser(tokens);
      const ast = parser.parse();
      return this.evaluator.evaluate(ast);
    } catch (error) {
      
      
      if (error instanceof MathError) {
        throw error;
      }
      throw new MathError(`Evaluation error: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  public addFunction(func: MathFunction): void {
    addFunction(func);
  }

  public removeFunction(name: string): boolean {
    return removeFunction(name);
  }

  public listFunctions(): MathFunction[] {
    return listFunctions();
  }

  public getFunction(name: string): MathFunction {
    return getFunction(name);
  }

  public addConstant(constant: MathConstant): void {
    addConstant(constant);
  }

  public removeConstant(name: string): boolean {
    return removeConstant(name);
  }

  public listConstants(): MathConstant[] {
    return listConstants();
  }

  public getConstant(name: string): MathConstant {
    return getConstant(name);
  }

  public addPrefixOperator(symbol: string, execute: (operand?: number) => number, precedence: number = 10): void {
    addPrefixOperator({ symbol, execute, precedence });
  }

  public removePrefixOperator(symbol: string): void {
    removePrefixOperator(symbol);
  }

  public listPrefixOperators(): PrefixOperator[] {
    return listPrefixOperators();
  }

  public getPrefixOperator(symbol: string) {
    return getPrefixOperator(symbol);
  }

  public addPostfixOperator(symbol: string, execute: (operand: number) => number, precedence: number = 10): void {
    addPostfixOperator({ symbol, execute, precedence });
  }

  public removePostfixOperator(symbol: string): void {
    removePostfixOperator(symbol);
  }

  public listPostfixOperators(): PostfixOperator[] {
    return listPostfixOperators();
  }

  public getPostfixOperator(symbol: string) {
    return getPostfixOperator(symbol);
  }

  public addCustomBinaryOperator(symbol: string, execute: (left: number, right: number) => number, precedence: number, associativity: 'left' | 'right' = 'left'): void {
    addCustomBinaryOperator({ symbol, execute, precedence, associativity });
  }

  public removeCustomBinaryOperator(symbol: string): void {
    removeCustomBinaryOperator(symbol);
  }

  public listCustomBinaryOperators(): CustomBinaryOperator[] {
    return listCustomBinaryOperators();
  }

  public getCustomBinaryOperator(symbol: string) {
    return getCustomBinaryOperator(symbol);
  }

  public isValid(expression: string): boolean {
    try {
      const tokenizer = new Tokenizer(expression);
      const tokens = tokenizer.tokenize();
      const parser = new Parser(tokens);
      parser.parse();
      return true;
    } catch {
      return false;
    }
  }
}