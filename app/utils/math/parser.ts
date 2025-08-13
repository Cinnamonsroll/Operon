import { Token, TokenType, ASTNode, NodeType, NumberNode, BinaryOpNode, UnaryOpNode, FunctionCallNode, ConstantNode, PrefixOpNode, PostfixOpNode, MathError } from './types';
import { isBinaryOperator, isUnaryOperator, getBinaryOperator, getUnaryOperator } from './operators';
import { isFunction, getFunction } from './functions';
import { isConstant } from './constants';
import { isPrefixOperator, getPrefixOperator } from './prefixOperators';
import { getPostfixOperator } from './postfixOperators';
import { isCustomBinaryOperator, getCustomBinaryOperator } from './customOperators';

export class Parser {
  private tokens: Token[];
  private position: number;
  private current: Token;

  constructor(tokens: Token[]) {
    this.tokens = tokens;
    this.position = 0;
    this.current = this.tokens[0];
  }

  private advance(): void {
    this.position++;
    if (this.position < this.tokens.length) {
      this.current = this.tokens[this.position];
    }
  }

  private peek(offset: number = 1): Token | null {
    const peekPos = this.position + offset;
    return peekPos < this.tokens.length ? this.tokens[peekPos] : null;
  }

  private expect(type: TokenType): Token {
    if (this.current.type !== type) {
      throw new MathError(`Expected ${type}, got ${this.current.type}`, this.current.position);
    }
    const token = this.current;
    this.advance();
    return token;
  }

  public parse(): ASTNode {
    const result = this.parseExpression();
    if (this.current.type !== TokenType.EOF) {
      throw new MathError(`Unexpected token: ${this.current.value}`, this.current.position);
    }
    return result;
  }

  private parseExpression(): ASTNode {
    return this.parseBinaryExpression(0);
  }

  private parseBinaryExpression(minPrecedence: number): ASTNode {
    let left = this.parseUnaryExpression();

    while ((this.current.type === TokenType.OPERATOR && isBinaryOperator(this.current.value)) ||
      (this.current.type === TokenType.CUSTOM_OPERATOR && isCustomBinaryOperator(this.current.value))) {

      let operator;
      if (this.current.type === TokenType.OPERATOR) {
        operator = getBinaryOperator(this.current.value);
      } else {
        operator = getCustomBinaryOperator(this.current.value);
      }

      if (operator.precedence < minPrecedence) {
        break;
      }

      this.advance();

      const nextMinPrecedence = operator.associativity === 'left'
        ? operator.precedence + 1
        : operator.precedence;

      const right = this.parseBinaryExpression(nextMinPrecedence);

      left = {
        type: NodeType.BINARY_OP,
        operator: operator.symbol,
        left,
        right
      } as BinaryOpNode;
    }

    return left;
  }

  private parseUnaryExpression(): ASTNode {

    if (this.current.type === TokenType.OPERATOR && isUnaryOperator(this.current.value)) {
      const operator = getUnaryOperator(this.current.value);
      this.advance();

      const operand = this.parseUnaryExpression();

      return {
        type: NodeType.UNARY_OP,
        operator: operator.symbol,
        operand
      } as UnaryOpNode;
    }


    if (this.current.type === TokenType.PREFIX_OP) {
      if (!isPrefixOperator(this.current.value)) {
        throw new MathError(`Unknown prefix operator: ${this.current.value}. Please define this operator using the prefix operator system.`, this.current.position);
      }

      const operator = getPrefixOperator(this.current.value);
      this.advance();



      const operatorFunction = operator.execute;
      const needsOperand = operatorFunction.length > 0;

      if (!needsOperand) {
        return {
          type: NodeType.PREFIX_OP,
          operator: operator.symbol,
          operand: null
        } as PrefixOpNode;
      }

      const operand = this.parsePostfixExpression();

      return {
        type: NodeType.PREFIX_OP,
        operator: operator.symbol,
        operand
      } as PrefixOpNode;
    }

    return this.parsePostfixExpression();
  }

  private parsePostfixExpression(): ASTNode {
    let node = this.parsePrimaryExpression();


    while (this.current.type === TokenType.POSTFIX_OP) {
      const operator = getPostfixOperator(this.current.value);
      this.advance();

      node = {
        type: NodeType.POSTFIX_OP,
        operator: operator.symbol,
        operand: node
      } as PostfixOpNode;
    }

    return node;
  }

  private parsePrimaryExpression(): ASTNode {
    switch (this.current.type) {
      case TokenType.NUMBER:
        return this.parseNumber();

      case TokenType.IDENTIFIER:
        return this.parseIdentifier();

      case TokenType.LEFT_PAREN:
        return this.parseParenthesizedExpression();

      default:
        throw new MathError(`Unexpected token: ${this.current.value}`, this.current.position);
    }
  }

  private parseNumber(): NumberNode {
    const token = this.expect(TokenType.NUMBER);
    const value = parseFloat(token.value);

    if (isNaN(value)) {
      throw new MathError(`Invalid number: ${token.value}`, token.position);
    }

    return {
      type: NodeType.NUMBER,
      value
    };
  }

  private parseIdentifier(): ASTNode {
    const token = this.expect(TokenType.IDENTIFIER);


    if (this.current.type === TokenType.LEFT_PAREN) {
      if (!isFunction(token.value)) {
        throw new MathError(`Unknown function: ${token.value}`, token.position);
      }

      return this.parseFunctionCall(token.value);
    }


    if (isConstant(token.value)) {
      return {
        type: NodeType.CONSTANT,
        name: token.value
      } as ConstantNode;
    }

    throw new MathError(`Unknown identifier: ${token.value}`, token.position);
  }

  private parseFunctionCall(functionName: string): FunctionCallNode {
    const func = getFunction(functionName);

    this.expect(TokenType.LEFT_PAREN);

    const args: ASTNode[] = [];

    if (this.current.type !== TokenType.RIGHT_PAREN) {
      args.push(this.parseExpression());

      while (this.current.type === TokenType.COMMA) {
        this.advance();
        args.push(this.parseExpression());
      }
    }


    if (this.current && this.current.type === TokenType.RIGHT_PAREN) {
      this.expect(TokenType.RIGHT_PAREN);
    } else if (this.position >= this.tokens.length - 1 ||
      !this.current ||
      this.current.type === TokenType.EOF ||
      (this.current.type === TokenType.OPERATOR && ['+', '-', '*', '/', '^'].includes(this.current.value))) {


    } else if (this.current && this.current.value === ',') {


    } else {
      this.expect(TokenType.RIGHT_PAREN);
    }

    if (args.length !== func.arity) {
      throw new MathError(`Function ${functionName} expects ${func.arity} arguments, got ${args.length}`);
    }

    return {
      type: NodeType.FUNCTION_CALL,
      name: functionName,
      args
    };
  }

  private parseParenthesizedExpression(): ASTNode {
    this.expect(TokenType.LEFT_PAREN);
    const expression = this.parseExpression();
    this.expect(TokenType.RIGHT_PAREN);
    return expression;
  }
}