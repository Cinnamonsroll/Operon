import { ASTNode, NodeType, NumberNode, BinaryOpNode, UnaryOpNode, FunctionCallNode, ConstantNode, PrefixOpNode, PostfixOpNode, MathError } from './types';
import { getBinaryOperator, getUnaryOperator } from './operators';
import { getFunction } from './functions';
import { getConstant } from './constants';
import { getPrefixOperator } from './prefixOperators';
import { getPostfixOperator } from './postfixOperators';
import { getCustomBinaryOperator } from './customOperators';

export class Evaluator {
  public evaluate(node: ASTNode): number {
    switch (node.type) {
      case NodeType.NUMBER:
        return this.evaluateNumber(node as NumberNode);
      
      case NodeType.BINARY_OP:
        return this.evaluateBinaryOp(node as BinaryOpNode);
      
      case NodeType.UNARY_OP:
        return this.evaluateUnaryOp(node as UnaryOpNode);
      
      case NodeType.FUNCTION_CALL:
        return this.evaluateFunctionCall(node as FunctionCallNode);
      
      case NodeType.CONSTANT:
        return this.evaluateConstant(node as ConstantNode);
      
      case NodeType.PREFIX_OP:
        return this.evaluatePrefixOp(node as PrefixOpNode);
      
      case NodeType.POSTFIX_OP:
        return this.evaluatePostfixOp(node as PostfixOpNode);
      
      default:
        throw new MathError(`Unknown node type: ${(node as ASTNode).type}`);
    }
  }

  private evaluateNumber(node: NumberNode): number {
    return node.value;
  }

  private evaluateBinaryOp(node: BinaryOpNode): number {
    const left = this.evaluate(node.left);
    const right = this.evaluate(node.right);
    
    let operator;
    try {
      
      operator = getBinaryOperator(node.operator);
    } catch {
      
      try {
        operator = getCustomBinaryOperator(node.operator);
      } catch {
        throw new MathError(`Unknown binary operator: ${node.operator}`);
      }
    }
    
    try {
      return operator.execute(left, right);
    } catch (error) {
      throw new MathError(`Error in binary operation ${node.operator}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  private evaluateUnaryOp(node: UnaryOpNode): number {
    const operand = this.evaluate(node.operand);
    const operator = getUnaryOperator(node.operator);
    
    try {
      return operator.execute(operand);
    } catch (error) {
      throw new MathError(`Error in unary operation ${node.operator}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  private evaluateFunctionCall(node: FunctionCallNode): number {
    const func = getFunction(node.name);
    const args = node.args.map(arg => this.evaluate(arg));
    
    try {
      return func.execute(...args);
    } catch (error) {
      throw new MathError(`Error in function ${node.name}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  private evaluateConstant(node: ConstantNode): number {
    const constant = getConstant(node.name);
    return constant.value;
  }

  private evaluatePrefixOp(node: PrefixOpNode): number {
    const operator = getPrefixOperator(node.operator);
    
    
    if (node.operand === null) {
      try {
        return operator.execute();
      } catch (error) {
        throw new MathError(`Error in prefix operation ${node.operator}: ${error instanceof Error ? error.message : String(error)}`);
      }
    }
    
    const operand = this.evaluate(node.operand);
    
    try {
      return operator.execute(operand);
    } catch (error) {
      throw new MathError(`Error in prefix operation ${node.operator}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  private evaluatePostfixOp(node: PostfixOpNode): number {
    const operand = this.evaluate(node.operand);
    const operator = getPostfixOperator(node.operator);
    
    try {
      return operator.execute(operand);
    } catch (error) {
      throw new MathError(`Error in postfix operation ${node.operator}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
}