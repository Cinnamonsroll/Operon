"use client";

import React, { useState, useRef, useEffect, useCallback, useMemo, memo } from "react";
import { useTheme } from "../contexts/ThemeContext";

interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  language?: "javascript" | "typescript";
  readOnly?: boolean;
  showLineNumbers?: boolean;
  fontSize?: number;
  tabSize?: number;
  className?: string;
  style?: React.CSSProperties;
}

interface SyntaxToken {
  type:
    | "keyword"
    | "string"
    | "number"
    | "comment"
    | "operator"
    | "identifier"
    | "bracket"
    | "function";
  value: string;
  start: number;
  end: number;
}

const CodeEditor = memo<CodeEditorProps>(({
  value,
  onChange,
  placeholder = "",
  language: _language = "javascript",
  readOnly = false,
  showLineNumbers = true,
  fontSize = 14,
  tabSize = 2,
  className = "",
  style = {},
}: CodeEditorProps) => {
  const { currentTheme: theme } = useTheme();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const highlightRef = useRef<HTMLDivElement>(null);
  const [isFocused, setIsFocused] = useState(false);
  const [_cursorPosition, setCursorPosition] = useState(0);
  const [_selection, setSelection] = useState({ start: 0, end: 0 });
  const [editorHeight, setEditorHeight] = useState(200);

  const keywords = useMemo(() => [
    "return",
    "if",
    "else",
    "for",
    "while",
    "do",
    "switch",
    "case",
    "break",
    "continue",
    "function",
    "var",
    "let",
    "const",
    "true",
    "false",
    "null",
    "undefined",
    "typeof",
    "instanceof",
    "new",
    "this",
    "try",
    "catch",
    "finally",
    "throw",
    "class",
    "extends",
    "import",
    "export",
    "default",
    "async",
    "await",
    "static",
    "public",
    "private",
    "protected",
    "readonly",
    "abstract",
    "interface",
    "type",
    "enum",
    "namespace",
    "module",
    "declare",
    "in",
    "of",
    "with",
    "delete",
    "void",
    "yield",
    "super",
    "debugger",
  ], []);

  const operators = useMemo(() => [
    "+",
    "-",
    "*",
    "/",
    "%",
    "=",
    "==",
    "===",
    "!=",
    "!==",
    "<",
    ">",
    "<=",
    ">=",
    "&&",
    "||",
    "!",
    "?",
    ":",
    ";",
    ",",
  ], []);

  const brackets = useMemo(() => ["(", ")", "{", "}", "[", "]"], []);

  const mathConstants = useMemo(() => [
    "PI",
    "E",
    "LN2",
    "LN10",
    "LOG2E",
    "LOG10E",
    "SQRT1_2",
    "SQRT2",
  ], []);

  const tokenize = useCallback((code: string): SyntaxToken[] => {
    const tokens: SyntaxToken[] = [];


    let i = 0;
    while (i < code.length) {
      const char = code[i];

      if (/\s/.test(char)) {
        i++;
        continue;
      }

      if (char === "/" && code[i + 1] === "/") {
        const start = i;
        while (i < code.length && code[i] !== "\n") i++;
        tokens.push({
          type: "comment",
          value: code.slice(start, i),
          start,
          end: i,
        });
        continue;
      }

      if (char === "/" && code[i + 1] === "*") {
        const start = i;
        i += 2;
        while (i < code.length - 1 && !(code[i] === "*" && code[i + 1] === "/"))
          i++;
        if (i < code.length - 1) i += 2;
        tokens.push({
          type: "comment",
          value: code.slice(start, i),
          start,
          end: i,
        });
        continue;
      }

      if (char === '"' || char === "'" || char === "`") {
        const quote = char;
        const start = i;
        i++;
        while (i < code.length && code[i] !== quote) {
          if (code[i] === "\\") i++;
          i++;
        }
        if (i < code.length) i++;
        tokens.push({
          type: "string",
          value: code.slice(start, i),
          start,
          end: i,
        });
        continue;
      }

      if (/\d/.test(char)) {
        const start = i;
        while (i < code.length && /[\d.]/.test(code[i])) i++;
        tokens.push({
          type: "number",
          value: code.slice(start, i),
          start,
          end: i,
        });
        continue;
      }

      if (brackets.includes(char)) {
        tokens.push({ type: "bracket", value: char, start: i, end: i + 1 });
        i++;
        continue;
      }

      let operatorFound = false;
      for (const op of operators.sort((a, b) => b.length - a.length)) {
        if (code.slice(i, i + op.length) === op) {
          tokens.push({
            type: "operator",
            value: op,
            start: i,
            end: i + op.length,
          });
          i += op.length;
          operatorFound = true;
          break;
        }
      }
      if (operatorFound) continue;

      if (/[a-zA-Z_$]/.test(char)) {
        const start = i;
        while (i < code.length && /[a-zA-Z0-9_$]/.test(code[i])) i++;
        const value = code.slice(start, i);

        if (value === "Math" && i < code.length && code[i] === ".") {
          i++;
          const dotStart = i - 1;

          const methodStart = i;
          while (i < code.length && /[a-zA-Z0-9_$]/.test(code[i])) i++;
          const methodName = code.slice(methodStart, i);

          if (methodName) {


            tokens.push({
              type: "identifier",
              value: "Math",
              start,
              end: dotStart,
            });

            tokens.push({
              type: "operator",
              value: ".",
              start: dotStart,
              end: methodStart,
            });

            if (mathConstants.includes(methodName)) {
              tokens.push({
                type: "keyword",
                value: methodName,
                start: methodStart,
                end: i,
              });
            } else {
              tokens.push({
                type: "function",
                value: methodName,
                start: methodStart,
                end: i,
              });
            }
          } else {
            tokens.push({
              type: "identifier",
              value: "Math",
              start,
              end: dotStart,
            });
            i = dotStart;
          }
        } else {
          const type = keywords.includes(value)
            ? "keyword"
            : /^[A-Z]/.test(value)
            ? "function"
            : "identifier";
          tokens.push({ type, value, start, end: i });
        }
        continue;
      }

      i++;
    }

    return tokens;
  }, [keywords, operators, brackets, mathConstants]);

  const generateHighlightedHTML = useCallback(
    (code: string): string => {
      const tokens = tokenize(code);
      let html = "";
      let lastIndex = 0;

      const getTokenColor = (type: SyntaxToken["type"]): string => {
        switch (type) {
          case "keyword":
            return theme.code.keyword;
          case "string":
            return theme.code.string;
          case "number":
            return theme.code.number;
          case "comment":
            return theme.code.comment;
          case "operator":
            return theme.code.operator;
          case "bracket":
            return theme.code.bracket;
          case "function":
            return theme.code.function;
          case "identifier":
            return theme.code.identifier;
          default:
            return theme.code.text;
        }
      };

      tokens.forEach((token) => {
        if (token.start > lastIndex) {
          html += escapeHtml(code.slice(lastIndex, token.start));
        }

        const color = getTokenColor(token.type);
        const fontWeight =
          token.type === "keyword" || token.type === "function"
            ? "bold"
            : "normal";
        const fontStyle = token.type === "comment" ? "italic" : "normal";

        html += `<span style="color: ${color}; font-weight: ${fontWeight}; font-style: ${fontStyle};">${escapeHtml(
          token.value
        )}</span>`;
        lastIndex = token.end;
      });

      if (lastIndex < code.length) {
        html += escapeHtml(code.slice(lastIndex));
      }

      return html || " ";
    },
    [tokenize, theme]
  );

  const escapeHtml = (text: string): string => {
    return text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  };

  const bracketPairs = useMemo(() => ({
    "(": ")",
    "{": "}",
    "[": "]",
    '"': '"',
    "'": "'",
    "`": "`",
  } as Record<string, string>), []);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    const textarea = e.target as HTMLTextAreaElement;
    const { selectionStart, selectionEnd } = textarea;

    if (e.key === "Tab") {
      e.preventDefault();
      const spaces = " ".repeat(tabSize);
      const newValue =
        value.substring(0, selectionStart) +
        spaces +
        value.substring(selectionEnd);
      onChange(newValue);

      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd =
          selectionStart + tabSize;
      }, 0);
      return;
    }



    if (bracketPairs[e.key]) {
      e.preventDefault();
      const closing = bracketPairs[e.key];
      const newValue =
        value.substring(0, selectionStart) +
        e.key +
        closing +
        value.substring(selectionEnd);
      onChange(newValue);

      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = selectionStart + 1;
      }, 0);
      return;
    }

    if (e.key === "Enter") {
      const lines = value.substring(0, selectionStart).split("\n");
      const currentLine = lines[lines.length - 1];
      const indent = currentLine.match(/^\s*/)?.[0] || "";

      const extraIndent = /[{([]\s*$/.test(currentLine.trim())
        ? " ".repeat(tabSize)
        : "";

      e.preventDefault();
      const newValue =
        value.substring(0, selectionStart) +
        "\n" +
        indent +
        extraIndent +
        value.substring(selectionEnd);
      onChange(newValue);

      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd =
          selectionStart + 1 + indent.length + extraIndent.length;
      }, 0);
      return;
    }
  }, [value, onChange, tabSize, bracketPairs]);

  const handleScroll = useCallback(() => {
    if (textareaRef.current && highlightRef.current) {
      highlightRef.current.scrollTop = textareaRef.current.scrollTop;
      highlightRef.current.scrollLeft = textareaRef.current.scrollLeft;
    }
  }, []);

  const handleSelectionChange = useCallback(() => {
    if (textareaRef.current) {
      setCursorPosition(textareaRef.current.selectionStart);
      setSelection({
        start: textareaRef.current.selectionStart,
        end: textareaRef.current.selectionEnd,
      });
    }
  }, []);

  const calculateHeight = useCallback(() => {
    if (textareaRef.current) {
      const lineHeight = fontSize * 1.5;
      const lines = (value || "").split("\n").length;
      const minLines = 10;
      const maxLines = 30;
      const actualLines = Math.max(minLines, Math.min(maxLines, lines));
      const calculatedHeight = actualLines * lineHeight + 24;
      setEditorHeight(Math.max(200, calculatedHeight));
    }
  }, [value, fontSize]);

  useEffect(() => {
    calculateHeight();
  }, [calculateHeight]);

  const lineNumbers = useMemo(() => {
    const text = value || placeholder;
    const lines = text.split("\n");
    const minLines = Math.max(10, lines.length);
    return Array.from({ length: minLines }, (_, index) =>
      (index + 1).toString()
    );
  }, [value, placeholder]);

  const highlightedCode = useMemo(() => generateHighlightedHTML(value || ""), [generateHighlightedHTML, value]);

  useEffect(() => {
    const styleId = "code-editor-selection-styles";
    let existingStyle = document.getElementById(styleId);

    if (!existingStyle) {
      existingStyle = document.createElement("style");
      existingStyle.id = styleId;
      document.head.appendChild(existingStyle);
    }

    existingStyle.textContent = `
      .code-editor-textarea::selection {
        background-color: ${theme.code.selection} !important;
        color: ${theme.code.text} !important;
      }
      .code-editor-textarea::-moz-selection {
        background-color: ${theme.code.selection} !important;
        color: ${theme.code.text} !important;
      }
    `;

    return () => {
      if (existingStyle && existingStyle.parentNode) {
        existingStyle.parentNode.removeChild(existingStyle);
      }
    };
  }, [theme]);

  return (
    <div
      className={`relative border overflow-hidden ${className}`}
      style={{
        backgroundColor: theme.code.background,
        borderColor: isFocused ? theme.buttonOperator : theme.border,
        fontSize: `${fontSize}px`,
        fontFamily:
          'ui-monospace, SFMono-Regular, "SF Mono", Consolas, "Liberation Mono", Menlo, monospace',
        height: `${editorHeight}px`,
        ...style,
      }}
    >
      <div className="flex h-full">
        
        {showLineNumbers && (
          <div
            className="flex-shrink-0 border-r select-none"
            style={{
              backgroundColor: theme.buttonDefault + "10",
              borderColor: theme.border,
              color: theme.textSecondary,
              lineHeight: "1.5",
              fontSize: `${fontSize}px`,
              minHeight: "100%",
              padding: "12px 8px 12px 12px",
            }}
          >
            <div className="whitespace-pre-wrap" style={{ lineHeight: "1.5" }}>
              {lineNumbers.map((num, index) => (
                <div
                  key={index}
                  className="text-right"
                  style={{ minWidth: "2rem" }}
                >
                  {num}
                </div>
              ))}
            </div>
          </div>
        )}

        
        <div className="flex-1 relative h-full overflow-hidden">
          
          <div
            ref={highlightRef}
            className="absolute inset-0 pointer-events-none overflow-auto whitespace-pre-wrap break-words"
            style={{
              lineHeight: "1.5",
              color: theme.code.text,
              padding: "12px",
            }}
            dangerouslySetInnerHTML={{ __html: highlightedCode }}
          />

          
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            onScroll={handleScroll}
            onSelect={handleSelectionChange}
            onFocus={useCallback(() => setIsFocused(true), [])}
            onBlur={useCallback(() => setIsFocused(false), [])}
            placeholder={placeholder}
            readOnly={readOnly}
            className="code-editor-textarea relative z-10 w-full h-full resize-none bg-transparent border-none outline-none whitespace-pre-wrap break-words overflow-auto"
            style={{
              color: "transparent",
              caretColor: theme.code.text,
              lineHeight: "1.5",
              tabSize,
              WebkitTextFillColor: "transparent",
              padding: "12px",
            }}
            spellCheck={false}
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
          />
        </div>
      </div>
    </div>
  );
});

CodeEditor.displayName = 'CodeEditor';

export default CodeEditor;
