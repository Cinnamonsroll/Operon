import { useReducer, useCallback } from 'react';
import { evaluate } from '../utils/math';

interface CalculatorHistory {
  equation: string;
  result: string;
}

interface State {
  equation: string;
  result: string;
  history: CalculatorHistory[];
}

type Action =
  | { type: 'INPUT_NUMBER'; payload: string }
  | { type: 'INPUT_OPERATOR'; payload: string }
  | { type: 'CLEAR' }
  | { type: 'BACKSPACE' }
  | { type: 'EQUALS' }
  | { type: 'DECIMAL' }
  | { type: 'PARENTHESIS' }
  | { type: 'PERCENT' }
  | { type: 'LOAD_HISTORY'; payload: CalculatorHistory };

const MAX_HISTORY = 50;

const initialState: State = {
  equation: '',
  result: '',
  history: []
};

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'INPUT_NUMBER':
      return { ...state, equation: state.equation + action.payload };

    case 'INPUT_OPERATOR': {
      const prev = state.equation;
      if (prev && /[+\-×÷*/%]$/.test(prev)) {
        return { ...state, equation: prev.slice(0, -1) + action.payload };
      }
      return { ...state, equation: prev + action.payload };
    }

    case 'CLEAR':
      return { ...initialState };

    case 'BACKSPACE':
      return { ...state, equation: state.equation.slice(0, -1), result: '' };

    case 'EQUALS': {
      if (!state.equation.trim()) return state;
      try {
        const mathEq = state.equation
          .replace(/×/g, '*')
          .replace(/÷/g, '/')
          .replace(/−/g, '-')
          .replace(/%/g, '/100');

        const evalResult = evaluate(mathEq);
        
        const resultStr = Number.isInteger(evalResult)
          ? evalResult.toString()
          : evalResult.toFixed(10).replace(/\.?0+$/, '');

        return {
          equation: state.equation,
          result: resultStr,
          history: [{ equation: state.equation, result: resultStr }, ...state.history].slice(0, MAX_HISTORY)
        };
      } catch (error) {

        return { ...state, result: 'Error' };
      }
    }

    case 'DECIMAL': {
      const lastNumber = state.equation.split(/[+\-×÷*/%]/).pop() || '';
      if (lastNumber.includes('.')) return state;
      return { ...state, equation: state.equation + '.' };
    }

    case 'PARENTHESIS': {
      const openCount = (state.equation.match(/\(/g) || []).length;
      const closeCount = (state.equation.match(/\)/g) || []).length;
      return { ...state, equation: state.equation + (openCount > closeCount ? ')' : '(') };
    }

    case 'PERCENT':
      return { ...state, equation: state.equation + '%' };

    case 'LOAD_HISTORY':
      return {
        ...state,
        equation: action.payload.equation,
        result: action.payload.result
      };

    default:
      return state;
  }
}

export function useCalculator() {
  const [state, dispatch] = useReducer(reducer, initialState);

  const handleNumber = useCallback((num: string) => dispatch({ type: 'INPUT_NUMBER', payload: num }), []);
  const handleOperator = useCallback((op: string) => dispatch({ type: 'INPUT_OPERATOR', payload: op }), []);
  const handleClear = useCallback(() => dispatch({ type: 'CLEAR' }), []);
  const handleBackspace = useCallback(() => dispatch({ type: 'BACKSPACE' }), []);
  const handleEquals = useCallback(() => dispatch({ type: 'EQUALS' }), []);
  const handleDecimal = useCallback(() => dispatch({ type: 'DECIMAL' }), []);
  const handleParentheses = useCallback(() => dispatch({ type: 'PARENTHESIS' }), []);
  const handlePercent = useCallback(() => dispatch({ type: 'PERCENT' }), []);
  const loadFromHistory = useCallback((item: CalculatorHistory) => dispatch({ type: 'LOAD_HISTORY', payload: item }), []);

  return {
    equation: state.equation,
    result: state.result,
    isError: state.result === 'Error',
    history: state.history,
    handleNumber,
    handleOperator,
    handleClear,
    handleBackspace,
    handleEquals,
    handleDecimal,
    handleParentheses,
    handlePercent,
    loadFromHistory
  };
}

export type { CalculatorHistory };
