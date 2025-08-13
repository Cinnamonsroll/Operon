import { Token, TokenType, MathError } from './types';
import { isPrefixOperator } from './prefixOperators';
import { isPostfixOperator } from './postfixOperators';
import { isCustomBinaryOperator } from './customOperators';

export class Tokenizer {
  private input: string;
  private position: number;
  private current: string | null;

  constructor(input: string) {
    this.input = input.replace(/\s+/g, '');
    this.position = 0;
    this.current = this.input.length > 0 ? this.input[0] : null;
  }

  private advance(): void {
    this.position++;
    this.current = this.position < this.input.length ? this.input[this.position] : null;
  }

  private peek(offset: number = 1): string | null {
    const peekPos = this.position + offset;
    return peekPos < this.input.length ? this.input[peekPos] : null;
  }

  private readNumber(): string {
    let result = '';
    let hasDot = false;

    while (this.current !== null && (this.isDigit(this.current) || this.current === '.')) {
      if (this.current === '.') {
        if (hasDot) {
          throw new MathError(`Invalid number format: multiple decimal points`, this.position);
        }
        hasDot = true;
      }
      result += this.current;
      this.advance();
    }

    return result;
  }

  private readIdentifier(): string {
    let result = '';

    while (this.current !== null && (this.isAlpha(this.current) || this.isDigit(this.current) || this.current === '_')) {
      result += this.current;
      this.advance();
    }

    return result;
  }

  private isDigit(char: string): boolean {
    return char >= '0' && char <= '9';
  }

  private isAlpha(char: string): boolean {
    return (char >= 'a' && char <= 'z') || (char >= 'A' && char <= 'Z');
  }

  private isOperator(char: string): boolean {
    return ['+', '-', '*', '/', '^', '%'].includes(char);
  }

  private checkForCustomOperator(): string | null {

    let longestMatch = '';
    for (let i = 1; i <= Math.min(5, this.input.length - this.position); i++) {
      const substr = this.input.substr(this.position, i);
      if (isCustomBinaryOperator(substr)) {
        longestMatch = substr;
      }
    }
    return longestMatch || null;
  }

  public tokenize(): Token[] {
    const tokens: Token[] = [];

    while (this.current !== null) {
      const startPos = this.position;

      if (this.isDigit(this.current)) {
        const number = this.readNumber();
        tokens.push({
          type: TokenType.NUMBER,
          value: number,
          position: startPos
        });
      }
      else if (this.isAlpha(this.current)) {



        if (this.isDigit(this.peek() || '') && this.current.length === 1) {



          tokens.push({
            type: TokenType.PREFIX_OP,
            value: this.current,
            position: startPos
          });
          this.advance();
        } else if (isPrefixOperator(this.current)) {
          tokens.push({
            type: TokenType.PREFIX_OP,
            value: this.current,
            position: startPos
          });
          this.advance();
        } else {
          const identifier = this.readIdentifier();

          if (isPrefixOperator(identifier)) {
            tokens.push({
              type: TokenType.PREFIX_OP,
              value: identifier,
              position: startPos
            });
          } else {
            tokens.push({
              type: TokenType.IDENTIFIER,
              value: identifier,
              position: startPos
            });
          }
        }
      }
      else if (this.isOperator(this.current)) {

        if (tokens.length > 0 &&
          (tokens[tokens.length - 1].type === TokenType.NUMBER ||
            tokens[tokens.length - 1].type === TokenType.RIGHT_PAREN) &&
          isPostfixOperator(this.current)) {
          tokens.push({
            type: TokenType.POSTFIX_OP,
            value: this.current,
            position: startPos
          });
        } else {
          tokens.push({
            type: TokenType.OPERATOR,
            value: this.current,
            position: startPos
          });
        }
        this.advance();
      }
      else if (this.current === '(') {
        tokens.push({
          type: TokenType.LEFT_PAREN,
          value: this.current,
          position: startPos
        });
        this.advance();
      }
      else if (this.current === ')') {
        tokens.push({
          type: TokenType.RIGHT_PAREN,
          value: this.current,
          position: startPos
        });
        this.advance();
      }
      else if (this.current === ',') {
        tokens.push({
          type: TokenType.COMMA,
          value: this.current,
          position: startPos
        });
        this.advance();
      }
      else {

        if (tokens.length > 0 &&
          (tokens[tokens.length - 1].type === TokenType.NUMBER ||
            tokens[tokens.length - 1].type === TokenType.RIGHT_PAREN) &&
          isPostfixOperator(this.current)) {
          tokens.push({
            type: TokenType.POSTFIX_OP,
            value: this.current,
            position: startPos
          });
          this.advance();
        }

        else if (isPrefixOperator(this.current)) {
          tokens.push({
            type: TokenType.PREFIX_OP,
            value: this.current,
            position: startPos
          });
          this.advance();
        }

        else {
          const customOp = this.checkForCustomOperator();
          if (customOp) {
            tokens.push({
              type: TokenType.CUSTOM_OPERATOR,
              value: customOp,
              position: startPos
            });

            for (let i = 0; i < customOp.length; i++) {
              this.advance();
            }
          } else {
            throw new MathError(`Unexpected character: ${this.current}`, this.position);
          }
        }
      }
    }

    tokens.push({
      type: TokenType.EOF,
      value: '',
      position: this.position
    });

    return tokens;
  }
}