import { useCallback, useEffect, useMemo } from 'react';

import { listFunctions, listConstants, listPrefixOperators, listPostfixOperators, listCustomBinaryOperators } from '../utils/math';
import { transpileAndRegister } from '../utils/math';

interface SerializableCustomItem {
  type: 'function' | 'constant' | 'prefix' | 'postfix' | 'operand';
  name: string;
  displayName?: string;
  sourceCode?: string;
  value?: number;
  precedence?: number;
  associativity?: 'left' | 'right';
}

const STORAGE_KEY = 'operon_custom_items';

export function useLocalStorage() {

  const saveCustomItems = useCallback((): void => {
    try {
      const customItems: SerializableCustomItem[] = [];


      const functions = listFunctions();
      functions.forEach(func => {
        if (func.sourceCode) {
          customItems.push({
            type: 'function',
            name: func.name,
            displayName: func.displayName,
            sourceCode: func.sourceCode
          });
        }
      });


      const constants = listConstants();
      constants.forEach(constant => {
        customItems.push({
          type: 'constant',
          name: constant.name,
          value: constant.value
        });
      });


      const prefixOps = listPrefixOperators();
      prefixOps.forEach(op => {
        if (op.sourceCode) {
          customItems.push({
            type: 'prefix',
            name: op.symbol,
            displayName: op.displayName,
            sourceCode: op.sourceCode,
            precedence: op.precedence
          });
        }
      });


      const postfixOps = listPostfixOperators();
      postfixOps.forEach(op => {
        if (op.sourceCode) {
          customItems.push({
            type: 'postfix',
            name: op.symbol,
            displayName: op.displayName,
            sourceCode: op.sourceCode,
            precedence: op.precedence
          });
        }
      });


      const customOps = listCustomBinaryOperators();
      customOps.forEach(op => {
        if (op.sourceCode) {
          customItems.push({
            type: 'operand',
            name: op.symbol,
            displayName: op.displayName,
            sourceCode: op.sourceCode,
            precedence: op.precedence,
            associativity: op.associativity
          });
        }
      });

      localStorage.setItem(STORAGE_KEY, JSON.stringify(customItems));
    } catch (error) {
      console.error('Failed to save custom items to localStorage:', error);
    }
  }, []);


  const loadCustomItems = useCallback((): void => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) return;

      const customItems: SerializableCustomItem[] = JSON.parse(stored);

      customItems.forEach(item => {
        try {
          if (item.sourceCode) {

            transpileAndRegister(item.sourceCode, item.displayName);
          }
        } catch (error) {
          console.error(`Failed to restore custom item:`, item, error);
        }
      });
    } catch (error) {
      console.error('Failed to load custom items from localStorage:', error);
    }
  }, []);


  const clearCustomItems = useCallback((): void => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error('Failed to clear custom items from localStorage:', error);
    }
  }, []);


  const hasStoredCustomItems = useCallback((): boolean => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored !== null && JSON.parse(stored).length > 0;
    } catch {
      return false;
    }
  }, []);


  useEffect(() => {
    loadCustomItems();
  }, [loadCustomItems]);


  return useMemo(() => ({
    saveCustomItems,
    loadCustomItems,
    clearCustomItems,
    hasStoredCustomItems
  }), [saveCustomItems, loadCustomItems, clearCustomItems, hasStoredCustomItems]);
}