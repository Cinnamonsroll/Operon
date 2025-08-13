"use client";

import React, { useState, useEffect, useCallback, useMemo, memo } from "react";
import { X } from "lucide-react";
import { useTheme } from "../contexts/ThemeContext";
import CodeEditor from "./CodeEditor";
import { MathFunction, PrefixOperator, PostfixOperator, CustomBinaryOperator } from "../utils/math/types";
import { MathEvaluator } from "../utils/math/mathEvaluator";


export interface OperationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  operationType: 'function' | 'operand' | 'prefix' | 'postfix';
  onSave: (data: OperationData) => void;
  mathEvaluator?: MathEvaluator;
}

export interface OperationData {
  type: string;
  name: string;
  call: string;
  code: string;
}

const operationTypeLabels: Record<
  OperationDrawerProps["operationType"],
  string
> = {
  function: "Add Function",
  operand: "Add Operand",
  prefix: "Add Prefix",
  postfix: "Add Postfix",
};

const placeholderMap: Record<
  OperationDrawerProps["operationType"],
  { name: string; call: string; code: string }
> = {
  function: {
    name: "e.g., gcd",
    call: "e.g., gcd",
    code: `if b == 0 return a
return gcd(b, a % b)`,
  },
  operand: {
    name: "e.g., **",
    call: "e.g., **",
    code: `return Math.pow(left, right)`,
  },
  prefix: {
    name: "e.g., √",
    call: "e.g., √",
    code: `return Math.sqrt(x)`,
  },
  postfix: {
    name: "e.g., !",
    call: "e.g., !",
    code: `if n <= 1 return 1
return n * (n-1)!`,
  },
};


const extractFunctionName = (codeText: string): string => {
  const pattern = /(?:function|postfix|prefix|operand)\s+([^\s(]+)\s*\(/;
  const match = codeText.trim().match(pattern);
  return match ? match[1] : "";
};



const OperationDrawer = memo<OperationDrawerProps>(({
  isOpen,
  onClose,
  operationType,
  onSave,
  mathEvaluator,
}: OperationDrawerProps) => {
  const { currentTheme: theme } = useTheme();
  const [name, setName] = useState("");
  const [call, setCall] = useState("");
  const [code, setCode] = useState(""); 
  const [callManuallyEdited, setCallManuallyEdited] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isAutoFilled, setIsAutoFilled] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const placeholders = placeholderMap[operationType];

  const defaultParams = useMemo(() => {
    switch (operationType) {
      case "function":
      case "prefix":
        return "x";
      case "operand":
        return "left, right";
      case "postfix":
        return "n";
      default:
        return "x";
    }
  }, [operationType]);

  
  const checkExistingItem = useCallback((itemName: string) => {
    if (!mathEvaluator || !itemName.trim()) return null;
    
    try {
      switch (operationType) {
        case 'function':
          const functions = mathEvaluator.listFunctions();
          const existingFunc = functions.find((f: MathFunction) => f.name === itemName);
          if (existingFunc) {
            return {
              call: existingFunc.call || itemName,
              code: existingFunc.sourceCode || ``
            };
          }
          break;
        case 'prefix':
          const prefixOps = mathEvaluator.listPrefixOperators();
          const existingPrefixOp = prefixOps.find((op: PrefixOperator) => op.symbol === itemName);
          if (existingPrefixOp) {
            return {
              call: existingPrefixOp.symbol || itemName,
              code: existingPrefixOp.sourceCode || ``
            };
          }
          break;
        case 'postfix':
          const postfixOps = mathEvaluator.listPostfixOperators();
          const existingPostfixOp = postfixOps.find((op: PostfixOperator) => op.symbol === itemName);
          if (existingPostfixOp) {
            return {
              call: existingPostfixOp.symbol || itemName,
              code: existingPostfixOp.sourceCode || ``
            };
          }
          break;
        case 'operand':
          const customOps = mathEvaluator.listCustomBinaryOperators();
          const existingCustomOp = customOps.find((op: CustomBinaryOperator) => op.symbol === itemName);
          if (existingCustomOp) {
            return {
              call: existingCustomOp.symbol || itemName,
              code: existingCustomOp.sourceCode || ``
            };
          }
          break;
      }
    } catch (error) {
      console.error('Error checking existing item:', error);
    }
    
    return null;
  }, [mathEvaluator, operationType]);

  
  const fullCodeText = useMemo(() => {
    const header = `${operationType} ${call}(${defaultParams})`;
    return `${header} {\n${code}\n}`;
  }, [operationType, call, defaultParams, code]);

  
  const functionNameFromCode = useMemo(() => extractFunctionName(fullCodeText), [fullCodeText]);

  
  const isFunctionNameValid = useMemo(() => 
    !code || !call || !functionNameFromCode || functionNameFromCode === call,
    [code, call, functionNameFromCode]
  );

  
  useEffect(() => {
    const extracted = extractFunctionName(fullCodeText);
    if (extracted && !callManuallyEdited) {
      setCall(extracted);
    }
    
    if (!code && !callManuallyEdited) {
      setCall("");
    }
  }, [fullCodeText, code, callManuallyEdited]);

  
  useEffect(() => {
    const searchTerm = name || call;
    if (searchTerm && !isAutoFilled) {
      const existingItem = checkExistingItem(searchTerm);
      if (existingItem) {
        if (!name) setName(searchTerm);
        if (!call || !callManuallyEdited) setCall(existingItem.call);
        setCode(existingItem.code);
        setCallManuallyEdited(false);
        setIsAutoFilled(true);
      }
    }
  }, [name, call, operationType, isAutoFilled, callManuallyEdited]);

  
  useEffect(() => {
    setName("");
    setCall("");
    setCode("");
    setCallManuallyEdited(false);
    setIsAutoFilled(false);
  }, [operationType]);

  
  const handleNameChange = useCallback((newName: string) => {
    setName(newName);
    setIsAutoFilled(false);
    setSaveError(null);
  }, []);

  
  const handleCallChange = useCallback((newCall: string) => {
    setCall(newCall);
    setCallManuallyEdited(true);
    setIsAutoFilled(false);
    setSaveError(null);
  }, []);

  
  const handleCodeChange = useCallback((newCode: string) => {
    setCode(newCode);
    setSaveError(null);
  }, []);

  const handleClose = useCallback(() => {
    setIsAnimating(false);
    setTimeout(() => {
      setName("");
      setCall("");
      setCode("");
      setCallManuallyEdited(false);
      setSaveError(null);
      onClose();
    }, 300); 
  }, [onClose]);

  const handleSave = useCallback(() => {
    if (!name || !call || !code) return;
    if (!isFunctionNameValid) return;

    try {
      setSaveError(null);
      onSave({
        type: operationTypeLabels[operationType],
        name,
        call,
        code: fullCodeText,
      });
      handleClose();
    } catch (error) {
      let errorMessage = error instanceof Error ? error.message : 'An error occurred while saving';
      
      
      const lineMatch = errorMessage.match(/line (\d+)/i);
      if (lineMatch) {
        const lineNumber = parseInt(lineMatch[1]);
        const codeLines = code.split('\n');
        if (lineNumber > 0 && lineNumber <= codeLines.length) {
          const errorLine = codeLines[lineNumber - 1];
          errorMessage += `\n\nLine ${lineNumber}: ${errorLine.trim()}`;
        }
      }
      
      setSaveError(errorMessage);
    }
  }, [name, call, code, isFunctionNameValid, operationType, fullCodeText, onSave, handleClose]);

  
  useEffect(() => {
    if (isOpen) {
      setIsAnimating(true);
    }
  }, [isOpen]);

  

  if (!isOpen) return null;

  return (
    <>
      
      <div
        className={`fixed inset-0 bg-black/20 z-40 transition-opacity duration-300 ${
          isAnimating ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            handleClose();
          }
        }}
      />

      
      <div
        className={`fixed bottom-0 left-0 right-0 max-h-[80vh] shadow-xl z-50 flex flex-col rounded-t-lg overflow-hidden transition-transform duration-300 ease-out ${
          isAnimating ? 'translate-y-0' : 'translate-y-full'
        }`}
        style={{
          backgroundColor: theme.displayBackground,
          borderTop: `1px solid ${theme.buttonDefault}`,
        }}
      >
        
        <div
          className="flex items-center justify-between p-6 border-b"
          style={{ borderColor: theme.buttonDefault }}
        >
          <h2
            className="text-xl font-semibold"
            style={{ color: theme.textPrimary }}
          >
            {operationTypeLabels[operationType]}
          </h2>
          <button
            onClick={handleClose}
            className="p-2 rounded-lg hover:bg-opacity-20"
            style={{ color: theme.textSecondary }}
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        
        <div className="flex-1 p-6 space-y-6 overflow-y-auto">
          <InputField
            label="Name"
            value={name}
            onChange={handleNameChange}
            placeholder={placeholders.name}
          />
          <InputField
            label="Call"
            value={call}
            onChange={handleCallChange}
            placeholder={placeholders.call}
            error={
              code &&
              call &&
              functionNameFromCode &&
              functionNameFromCode !== call
                ? "Must match function name in code"
                : undefined
            }
          />

          <div className="space-y-2">
            <label
              className="block text-sm font-medium"
              style={{ color: theme.textSecondary }}
            >
              Code
            </label>
            <div className="space-y-2">
              
              <div 
                className="px-3 py-2 rounded-t-lg border-b font-mono text-sm"
                style={{ 
                  color: theme.textSecondary,
                  backgroundColor: theme.buttonDefault + '20',
                  borderColor: theme.buttonDefault
                }}
              >
                {operationType} {call || 'functionName'}({defaultParams}) {"{"}
              </div>
              
              
              <CodeEditor
                value={code}
                onChange={handleCodeChange}
                placeholder={placeholders.code}
                language="javascript"
                showLineNumbers={true}
                style={{ minHeight: '200px', borderRadius: '0' }}
              />
              
              
              <div 
                className="px-3 py-2 rounded-b-lg border-t font-mono text-sm"
                style={{ 
                  color: theme.textSecondary,
                  backgroundColor: theme.buttonDefault + '20',
                  borderColor: theme.buttonDefault
                }}
              >
                {"}"}  
              </div>
              
              
              {code &&
                call &&
                functionNameFromCode &&
                functionNameFromCode !== call && (
                <div className="text-sm" style={{ color: "#ff6b6b" }}>
                  Function name &quot;{functionNameFromCode}&quot; must match Call value &quot;{call}&quot;
                </div>
              )}
            </div>
          </div>
          
          
          {saveError && (
            <div className="p-4 rounded-lg border" style={{
              backgroundColor: theme.displayBackground,
              borderColor: "#ff6b6b",
              color: "#ff6b6b"
            }}>
              <div className="font-medium mb-1">Error</div>
              <div className="text-sm" style={{
                whiteSpace: 'pre-wrap',
                fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Consolas, "Liberation Mono", Menlo, monospace'
              }}>{saveError}</div>
            </div>
          )}
        </div>

        
        <div
          className="p-6 flex gap-3 border-t"
          style={{ borderColor: theme.buttonDefault }}
        >
          <button
            onClick={handleClose}
            className="flex-1 px-4 py-2 rounded-lg"
            style={{
              color: theme.textSecondary,
              backgroundColor: theme.buttonDefault,
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!name || !call || !code || !isFunctionNameValid}
            className="flex-1 px-4 py-2 rounded-lg disabled:opacity-50"
            style={{
              color: theme.textPrimary,
              backgroundColor: theme.buttonOperator,
            }}
          >
            Save
          </button>
        </div>
      </div>
    </>
  );
});

OperationDrawer.displayName = 'OperationDrawer';

export default OperationDrawer;

interface InputFieldProps {
  label: string;
  value: string;
  onChange: (val: string) => void;
  placeholder: string;
  error?: string;
}

const InputField = memo<InputFieldProps>(({
  label,
  value,
  onChange,
  placeholder,
  error,
}: InputFieldProps) => {
  const { currentTheme: theme } = useTheme();
  const [isFocused, setIsFocused] = useState(false);
  const hasError = !!error;

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  }, [onChange]);

  const handleFocus = useCallback(() => {
    setIsFocused(true);
  }, []);

  const handleBlur = useCallback(() => {
    setIsFocused(false);
  }, []);

  return (
    <div className="space-y-2">
      <label
        className="block text-sm font-medium"
        style={{ color: theme.textSecondary }}
      >
        {label}
      </label>
      <input
        type="text"
        value={value || ""}
        onChange={handleChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        placeholder={placeholder}
        className="w-full px-3 py-2 rounded-lg focus:outline-none transition-all"
        style={{
          backgroundColor: theme.displayBackground,
          border: `1px solid ${
            hasError ? "#ff6b6b" : isFocused ? theme.buttonOperator : theme.buttonDefault
          }`,
          color: theme.textPrimary,
        }}
        aria-invalid={hasError}
        autoComplete="off"
        spellCheck={false}
      />
      {error && (
        <div className="text-sm" style={{ color: "#ff6b6b" }}>
          {error}
        </div>
      )}
    </div>
  );
});

InputField.displayName = 'InputField';
