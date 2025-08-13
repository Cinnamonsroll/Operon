

export enum TokenType {
  NUMBER = 'NUMBER',
  OPERATOR = 'OPERATOR',
  FUNCTION = 'FUNCTION',
  CONSTANT = 'CONSTANT',
  IDENTIFIER = 'IDENTIFIER',
  LEFT_PAREN = 'LEFT_PAREN',
  RIGHT_PAREN = 'RIGHT_PAREN',
  COMMA = 'COMMA',
  PREFIX_OP = 'PREFIX_OP',
  POSTFIX_OP = 'POSTFIX_OP',
  CUSTOM_OPERATOR = 'CUSTOM_OPERATOR',
  EOF = 'EOF'
}

export interface Token {
  type: TokenType;
  value: string;
  position: number;
}

export enum NodeType {
  NUMBER = 'NUMBER',
  BINARY_OP = 'BINARY_OP',
  UNARY_OP = 'UNARY_OP',
  FUNCTION_CALL = 'FUNCTION_CALL',
  CONSTANT = 'CONSTANT',
  PREFIX_OP = 'PREFIX_OP',
  POSTFIX_OP = 'POSTFIX_OP'
}

export interface ASTNode {
  type: NodeType;
}

export interface NumberNode extends ASTNode {
  type: NodeType.NUMBER;
  value: number;
}

export interface BinaryOpNode extends ASTNode {
  type: NodeType.BINARY_OP;
  operator: string;
  left: ASTNode;
  right: ASTNode;
}

export interface UnaryOpNode extends ASTNode {
  type: NodeType.UNARY_OP;
  operator: string;
  operand: ASTNode;
}

export interface FunctionCallNode extends ASTNode {
  type: NodeType.FUNCTION_CALL;
  name: string;
  args: ASTNode[];
}

export interface ConstantNode extends ASTNode {
  type: NodeType.CONSTANT;
  name: string;
}

export interface PrefixOpNode extends ASTNode {
  type: NodeType.PREFIX_OP;
  operator: string;
  operand: ASTNode | null;
}

export interface PostfixOpNode extends ASTNode {
  type: NodeType.POSTFIX_OP;
  operator: string;
  operand: ASTNode;
}

export interface MathFunction {
  name: string;
  arity: number; 
  execute: (...args: number[]) => number;
  sourceCode?: string;
  call?: string;
  displayName?: string;
}

export interface MathConstant {
  name: string;
  value: number;
  sourceCode?: string;
}

export interface PrefixOperator {
  symbol: string;
  precedence: number;
  execute: (operand?: number) => number;
  sourceCode?: string;
  displayName?: string;
}

export interface PostfixOperator {
  symbol: string;
  precedence: number;
  execute: (operand: number) => number;
  sourceCode?: string;
  displayName?: string;
}

export interface CustomBinaryOperator {
  symbol: string;
  precedence: number;
  associativity: 'left' | 'right';
  execute: (left: number, right: number) => number;
  sourceCode?: string;
  displayName?: string;
}

export class MathError extends Error {
  constructor(message: string, public position?: number) {
    super(message);
    this.name = 'MathError';
  }
}