import {
  MathFunction,
  PrefixOperator,
  PostfixOperator,
  CustomBinaryOperator,
} from './types';
import { addFunction } from './functions';
import { addPrefixOperator } from './prefixOperators';
import { addPostfixOperator } from './postfixOperators';
import { addCustomBinaryOperator } from './customOperators';

export interface TranspilerResult {
  type: 'function' | 'prefix' | 'postfix' | 'operand';
  name: string;
  code: string;
  compiled:
    | MathFunction
    | PrefixOperator
    | PostfixOperator
    | CustomBinaryOperator;
}

export class MathTranspiler {
  private static readonly HEADER_REGEX = /(function|postfix|prefix|operand)\s+(\S+)\s*\(([^)]*)\)/;
  private static readonly BODY_REGEX = /\{([\s\S]*)\}/;

  public static transpile(code: string, displayName?: string): TranspilerResult {
    
    const match = this.HEADER_REGEX.exec(code);
    const bodyMatch = this.BODY_REGEX.exec(code);

    if (match && bodyMatch) {
      
      const [, type, name, rawParams] = match;
      const params = rawParams.split(',').map(p => p.trim()).filter(Boolean);
      let body = bodyMatch[1].trim();

      try {
        body = this.preprocessBody(body);
        
        const recursiveCallRegex = new RegExp(`${this.escapeRegex(name)}\\s*\\(([^)]*)\\)`, 'g');
        body = body.replace(recursiveCallRegex, (_, args) => `arguments.callee(${args.trim()})`);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        const enhancedError = this.enhanceErrorWithLineInfo(errorMessage, bodyMatch[1].trim());
        throw new Error(enhancedError);
      }

      switch (type) {
        case 'postfix':
          if (params.length !== 1) throw new Error('Postfix operator must have 1 parameter');
          try {
            const execute = new Function(params[0], body) as (n: number) => number;
            return {
              type,
              name,
              code: body,
              compiled: {
                symbol: name,
                precedence: 15,
                execute,
                sourceCode: code,
                displayName: displayName,
              },
            };
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            const enhancedError = this.enhanceErrorWithLineInfo(errorMessage, body);
            throw new Error(enhancedError);
          }

        case 'prefix':
          if (params.length !== 1) throw new Error('Prefix operator must have 1 parameter');
          try {
            const execute = new Function(params[0], body) as (n: number) => number;
            return {
              type,
              name,
              code: body,
              compiled: {
                symbol: name,
                precedence: 14,
                execute,
                sourceCode: code,
                displayName: displayName,
              },
            };
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            const enhancedError = this.enhanceErrorWithLineInfo(errorMessage, body);
            throw new Error(enhancedError);
          }

        case 'operand':
          if (params.length !== 2) throw new Error('Operand must have 2 parameters');
          try {
            const execute = new Function(params[0], params[1], body) as (l: number, r: number) => number;
            return {
              type,
              name,
              code: body,
              compiled: {
                symbol: name,
                precedence: 10,
                associativity: 'left',
                execute,
                sourceCode: code,
                displayName: displayName,
              },
            };
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            const enhancedError = this.enhanceErrorWithLineInfo(errorMessage, body);
            throw new Error(enhancedError);
          }

        case 'function':
          try {
            const execute = new Function(...params, body) as (...args: number[]) => number;
            return {
              type,
              name,
              code: body,
              compiled: {
                name,
                arity: params.length,
                execute,
                sourceCode: code,
                call: `${name}(${params.join(', ')})`,
                displayName: displayName,
              },
            };
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            const enhancedError = this.enhanceErrorWithLineInfo(errorMessage, body);
            throw new Error(enhancedError);
          }

        default:
          throw new Error(`Unknown type: ${type}`);
      }
    } else {
      
      return this.parseRawJavaScript(code, displayName);
    }
  }

  public static transpileAndRegister(code: string, displayName?: string): TranspilerResult {
    const result = this.transpile(code, displayName);

    switch (result.type) {
      case 'function':
        addFunction(result.compiled as MathFunction);
        break;
      case 'prefix':
        addPrefixOperator(result.compiled as PrefixOperator);
        break;
      case 'postfix':
        addPostfixOperator(result.compiled as PostfixOperator);
        break;
      case 'operand':
        addCustomBinaryOperator(result.compiled as CustomBinaryOperator);
        break;
    }

    return result;
  }

  private static parseRawJavaScript(code: string, displayName?: string): TranspilerResult {
    
    const functionMatch = /function\s+(\w+)\s*\(([^)]*)\)\s*\{([\s\S]*)\}/.exec(code);
    const arrowFunctionMatch = /(?:const|let|var)\s+(\w+)\s*=\s*\(([^)]*)\)\s*=>\s*\{([\s\S]*)\}/.exec(code);
    const simpleArrowMatch = /(?:const|let|var)\s+(\w+)\s*=\s*\(([^)]*)\)\s*=>\s*([^;\n]+)/.exec(code);
    
    let name: string;
    let params: string[];
    let body: string;
    
    if (functionMatch) {
      [, name, , body] = functionMatch;
      params = functionMatch[2].split(',').map(p => p.trim()).filter(Boolean);
    } else if (arrowFunctionMatch) {
      [, name, , body] = arrowFunctionMatch;
      params = arrowFunctionMatch[2].split(',').map(p => p.trim()).filter(Boolean);
    } else if (simpleArrowMatch) {
      [, name, , body] = simpleArrowMatch;
      params = simpleArrowMatch[2].split(',').map(p => p.trim()).filter(Boolean);
      body = `return ${body};`;
    } else {
      
      name = `custom_${Date.now()}`;
      params = ['x'];
      body = `return ${code};`;
    }
    
    
    body = body.trim();
    
    try {
      
      const testFunc = new Function(...params, body);
      
      return {
        type: 'function',
        name,
        code: body,
        compiled: {
          name,
          arity: params.length,
          execute: testFunc as (...args: number[]) => number,
          sourceCode: code,
          call: `${name}(${params.join(', ')})`,
          displayName: displayName,
        },
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      const enhancedError = this.enhanceErrorWithLineInfo(errorMessage, body);
      throw new Error(enhancedError);
    }
  }

  private static preprocessBody(body: string): string {
    
    let processed = body.trim();
    
    
    processed = processed.replace(/\bif\s+([^\n]+?)\s+return\s+([^\n;]+)/g, 'if ($1) return $2;');
    
    
    const lines = processed.split('\n').map(line => line.trim()).filter(Boolean);
    const processedLines: string[] = [];
    
    for (let i = 0; i < lines.length; i++) {
      let line = lines[i];
      
      
      if (!line) continue;
      
      
      
      if (line.match(/^(return|if|for|while|do|switch|try|catch|finally|throw|var|let|const|function|\}|\{|\/\/)/) || 
          line.endsWith(';') || 
          line.endsWith('{') || 
          line.endsWith('}') ||
          line.endsWith(',') ||
          line.includes('[') && !line.includes(']') ||
          line.includes('{') && !line.includes('}') ||
          line.match(/^\s*[\]\}]/)) {
        processedLines.push(line);
        continue;
      }
      
      
      if (i === lines.length - 1) {
        
        if (!line.startsWith('return ')) {
          line = `return ${line}`;
        }
      }
      
      
      if (!line.endsWith(';') && !line.endsWith('{') && !line.endsWith('}') && !line.endsWith(',')) {
        
        const nextLine = i + 1 < lines.length ? lines[i + 1].trim() : '';
        if (!nextLine.match(/^[\]\},]/)) {
          line += ';';
        }
      }
      
      processedLines.push(line);
    }
    
    
    let result = processedLines.join('\n');
    result = result.replace(/;;+/g, ';');
    
    return result;
  }

  private static escapeRegex(str: string): string {
    return str.replace(/[.*+?^${}()|[\]\\!]/g, '\\$&');
  }

  private static enhanceErrorWithLineInfo(errorMessage: string, code: string): string {
    
    const lineMatches = [
      /line (\d+)/i,
      /:(\d+):/,
      /at line (\d+)/i,
      /\((\d+):/
    ];
    
    let lineNumber: number | null = null;
    for (const regex of lineMatches) {
      const match = errorMessage.match(regex);
      if (match) {
        lineNumber = parseInt(match[1]);
        break;
      }
    }
    
    if (lineNumber) {
      const lines = code.split('\n');
      if (lineNumber > 0 && lineNumber <= lines.length) {
        // const errorLine = lines[lineNumber - 1]; // Available for debugging if needed
        const contextStart = Math.max(0, lineNumber - 3);
        const contextEnd = Math.min(lines.length, lineNumber + 2);
        
        let context = '';
        for (let i = contextStart; i < contextEnd; i++) {
          const lineNum = i + 1;
          const line = lines[i];
          const marker = lineNum === lineNumber ? '>>> ' : '    ';
          context += `${marker}${lineNum}: ${line}\n`;
        }
        
        return `${errorMessage}\n\nCode context:\n${context}`;
      }
    }
    
    
    if (errorMessage.includes('Unexpected token')) {
      const tokenMatch = errorMessage.match(/Unexpected token[\s'"]*([^'"\s]+)/i);
      if (tokenMatch) {
        const token = tokenMatch[1];
        const lines = code.split('\n');
        
        
        for (let i = 0; i < lines.length; i++) {
          if (lines[i].includes(token)) {
            const lineNum = i + 1;
            const contextStart = Math.max(0, i - 2);
            const contextEnd = Math.min(lines.length, i + 3);
            
            let context = '';
            for (let j = contextStart; j < contextEnd; j++) {
              const contextLineNum = j + 1;
              const line = lines[j];
              const marker = j === i ? '>>> ' : '    ';
              context += `${marker}${contextLineNum}: ${line}\n`;
            }
            
            return `${errorMessage}\n\nProblem found at line ${lineNum}:\n${context}`;
          }
        }
      }
    }
    
    return errorMessage;
  }
}
