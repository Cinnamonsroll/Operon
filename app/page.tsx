"use client";
import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  useMemo,
  memo,
} from "react";
import Button from "./components/Button";
import ContextMenu from "./components/ContextMenu";
import OperationDrawer, { OperationData } from "./components/OperationDrawer";
import ThemeDrawer from "./components/ThemeDrawer";
import CalculatorKeypad from "./components/CalculatorKeypad";
import { transpileAndRegister } from "./utils/math";
import { useCalculator } from "./hooks/useCalculator";
import { MathEvaluator } from "./utils/math/mathEvaluator";
import { useTheme } from "./contexts/ThemeContext";
import { getAllCustomItemsFlat } from "./utils";
import { useLocalStorage } from "./hooks/useLocalStorage";

type HistoryItem = {
  equation: string;
  result: string;
};

const MAX_HISTORY_HEIGHT_RATIO = 0.7;
const SNAP_THRESHOLD_RATIO = 0.1;


interface CustomItemsSearchProps {
  handleOperator: (op: string) => void;
}

const CustomItemsSearch = memo(({ handleOperator }: CustomItemsSearchProps) => {
  const { currentTheme: theme } = useTheme();
  const [isSearchDropdownOpen, setIsSearchDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const searchDropdownRef = useRef<HTMLDivElement>(null);

  const filteredItems = useMemo(() => {
    const allItems = getAllCustomItemsFlat();
    return allItems
      .filter(
        (item) =>
          item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.display.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (item.call || item.name)
            .toLowerCase()
            .includes(searchQuery.toLowerCase())
      )
      .slice(0, 3);
  }, [searchQuery]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchDropdownRef.current &&
        !searchDropdownRef.current.contains(event.target as Node)
      ) {
        setIsSearchDropdownOpen(false);
        setSearchQuery("");
      }
    };

    if (isSearchDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isSearchDropdownOpen]);

  return (
    <div className="px-4 pb-2 pt-6">
      <div className="flex justify-center mb-4">
        <div className="relative" ref={searchDropdownRef}>
          <button
            className="flex items-center justify-center gap-2 px-6 py-1.5 rounded-lg transition-all duration-200 hover:scale-105 w-72 h-8"
            style={{
              backgroundColor: theme.buttonOperator,
              color: theme.textPrimary,
              border: `1px solid ${theme.border || theme.backgroundMain}`,
            }}
            onClick={() => setIsSearchDropdownOpen(!isSearchDropdownOpen)}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ color: theme.textPrimary }}
            >
              <circle cx="11" cy="11" r="8"></circle>
              <path d="m21 21-4.35-4.35"></path>
            </svg>
            <span
              className="text-sm font-medium"
              style={{ color: theme.textPrimary }}
            >
              Search Custom Items
            </span>
          </button>

          {isSearchDropdownOpen && (
            <div
              className="absolute top-full left-0 right-0 mt-2 rounded-lg shadow-xl z-[60] max-h-64 overflow-hidden border transition-all duration-300 ease-out transform origin-top animate-in slide-in-from-top-2 fade-in-0 zoom-in-95"
              style={{
                backgroundColor: theme.displayBackground,
                borderColor: theme.border,
                animation: "dropdownSlide 0.3s ease-out forwards",
              }}
            >
              <div
                className="p-3 border-b"
                style={{ borderColor: theme.backgroundMain }}
              >
                <input
                  type="text"
                  placeholder="Search functions, constants, operators..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-3 py-2 rounded border-none outline-none text-sm"
                  style={{
                    backgroundColor: theme.backgroundMain,
                    color: theme.textPrimary,
                  }}
                  autoFocus
                />
              </div>
              <div className="max-h-48 overflow-y-auto p-2">
                {filteredItems.length > 0 ? (
                  filteredItems.map((item, index) => (
                    <button
                      key={`${item.type}-${item.name}-${index}`}
                      className={`w-full text-left px-3 py-2 rounded hover:opacity-80 transition-colors duration-150 flex items-center justify-between ${index > 0 ? 'mt-2' : ''}`}
                      style={{
                        backgroundColor:
                          item.type === "constant"
                            ? theme.buttonDefault
                            : theme.buttonOperator,
                        color:
                          item.type === "constant"
                            ? theme.textPrimary
                            : theme.textOperator,
                      }}
                      onClick={() => {
                        const insertText = item.type === 'function' ? `${item.call || item.name}(` : (item.call || item.name);
                        handleOperator(insertText);
                        setIsSearchDropdownOpen(false);
                        setSearchQuery("");
                      }}
                    >
                      <span className="font-medium">{item.display}</span>
                      <span
                        className="text-xs opacity-60 font-mono px-2 py-1 rounded"
                        style={{ backgroundColor: theme.backgroundMain }}
                      >
                        {item.call || item.name}
                      </span>
                    </button>
                  ))
                ) : searchQuery ? (
                  <div
                    className="px-3 py-4 text-center text-sm"
                    style={{ color: theme.textSecondary }}
                  >
                    No items found
                  </div>
                ) : (
                  <div
                    className="px-3 py-4 text-center text-sm"
                    style={{ color: theme.textSecondary }}
                  >
                    Start typing to search...
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
});
CustomItemsSearch.displayName = 'CustomItemsSearch';

const Page: React.FC = () => {
  const { currentTheme: theme } = useTheme();
  const { saveCustomItems, loadCustomItems } = useLocalStorage();
  const [historyOffset, setHistoryOffset] = useState(0);
  const historyOffsetRef = useRef(0);
  const isDraggingRef = useRef(false);
  const startYRef = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isThemeDrawerOpen, setIsThemeDrawerOpen] = useState(false);
  const [drawerOperationType, setDrawerOperationType] = useState<
    "function" | "operand" | "prefix" | "postfix"
  >("function");
  const [hasCustomItems, setHasCustomItems] = useState(false);

  const mathEvaluator = useRef(new MathEvaluator()).current;

  const {
    equation,
    result,
    isError,
    history,
    handleNumber,
    handleOperator,
    handleClear,
    handleBackspace,
    handleEquals,
    handleDecimal,
    handleParentheses,
    handlePercent,
    loadFromHistory,
  } = useCalculator();

  const windowDimensions = useMemo(() => {
    if (typeof window === "undefined") return { height: 800 };
    return { height: window.innerHeight };
  }, []);

  const getMaxHeight = useCallback(
    () => windowDimensions.height * MAX_HISTORY_HEIGHT_RATIO,
    [windowDimensions.height]
  );
  const getSnapThreshold = useCallback(
    () => windowDimensions.height * SNAP_THRESHOLD_RATIO,
    [windowDimensions.height]
  );

  const updateHistoryOffset = useCallback(
    (deltaY: number) => {
      const maxHeight = getMaxHeight();
      const newOffset = Math.max(
        0,
        Math.min(maxHeight, historyOffsetRef.current + deltaY)
      );
      historyOffsetRef.current = newOffset;
      setHistoryOffset(newOffset);
    },
    [getMaxHeight]
  );

  const endDrag = useCallback(() => {
    isDraggingRef.current = false;
    const maxHeight = getMaxHeight();
    const snapThreshold = getSnapThreshold();
    const finalOffset =
      historyOffsetRef.current > snapThreshold ? maxHeight : 0;
    historyOffsetRef.current = finalOffset;
    setHistoryOffset(finalOffset);
  }, [getMaxHeight, getSnapThreshold]);

  const startDrag = useCallback((y: number) => {
    isDraggingRef.current = true;
    startYRef.current = y;
  }, []);

  const moveDrag = useCallback(
    (y: number) => {
      if (!isDraggingRef.current) return;
      const deltaY = (y - startYRef.current) * 1.5;
      startYRef.current = y;
      updateHistoryOffset(deltaY);
    },
    [updateHistoryOffset]
  );

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => moveDrag(e.clientY);
    const handleMouseUp = () => endDrag();

    if (isDraggingRef.current) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    }
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [moveDrag, endDrag]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const isButton = (target: Element) =>
      target.closest("button") ||
      target.closest('[role="button"]') ||
      target.closest("input") ||
      target.closest("textarea");

    const onTouchStart = (e: TouchEvent) => {
      if (isButton(e.target as Element)) return;
      e.preventDefault();
      startDrag(e.touches[0].clientY);
    };
    const onTouchMove = (e: TouchEvent) => {
      if (isButton(e.target as Element)) return;
      e.preventDefault();
      moveDrag(e.touches[0].clientY);
    };
    const onTouchEnd = () => endDrag();

    container.addEventListener("touchstart", onTouchStart, { passive: false });
    container.addEventListener("touchmove", onTouchMove, { passive: false });
    container.addEventListener("touchend", onTouchEnd);

    return () => {
      container.removeEventListener("touchstart", onTouchStart);
      container.removeEventListener("touchmove", onTouchMove);
      container.removeEventListener("touchend", onTouchEnd);
    };
  }, [startDrag, moveDrag, endDrag]);

  const handleLoadFromHistory = useCallback(
    (item: HistoryItem) => {
      loadFromHistory(item);
      historyOffsetRef.current = 0;
      setHistoryOffset(0);
    },
    [loadFromHistory]
  );

  const handleOpenDrawer = useCallback(
    (operationType: "function" | "operand" | "prefix" | "postfix") => {
      setDrawerOperationType(operationType);
      setIsDrawerOpen(true);
    },
    []
  );

  const handleCloseDrawer = useCallback(() => {
    setIsDrawerOpen(false);
  }, []);

  const handleOpenThemeDrawer = useCallback(() => {
    setIsThemeDrawerOpen(true);
  }, []);

  const handleCloseThemeDrawer = useCallback(() => {
    setIsThemeDrawerOpen(false);
  }, []);

  const updateCustomItems = useCallback(() => {
    const hasItems = getAllCustomItemsFlat().length > 0;
    setHasCustomItems(hasItems);
  }, []);

  const handleSaveOperation = useCallback(
    (data: OperationData) => {
      transpileAndRegister(data.code, data.name);
      saveCustomItems();

      updateCustomItems();
      setIsDrawerOpen(false);
    },
    [updateCustomItems, saveCustomItems]
  );

  
  useEffect(() => {
    loadCustomItems();
    updateCustomItems();
  }, [loadCustomItems, updateCustomItems]);

  return (
    <div
      ref={containerRef}
      className="w-full flex flex-col relative overflow-hidden main-container"
      style={{
        backgroundColor: theme.backgroundMain,
      }}
    >
      <div className="absolute top-4 right-4 z-40">
        <ContextMenu
          items={[
            {
              id: "operations",
              label: "Operations",
              navigateTo: "operations",
              className:
                "w-full px-3 py-2 text-left text-sm transition-colors flex items-center space-x-2 rounded-lg hover:opacity-80",
              style: { color: theme.textPrimary },
            },
            {
              id: "themes",
              label: "Themes",
              onClick: handleOpenThemeDrawer,
              className:
                "w-full px-3 py-2 text-left text-sm transition-colors flex items-center space-x-2 rounded-lg hover:opacity-80",
              style: { color: theme.textPrimary },
            },
          ]}
          onOpenDrawer={handleOpenDrawer}
          triggerClassName="p-2 rounded-full hover:opacity-80 transition-opacity"
          menuClassName="absolute right-0 top-full mt-2 w-44 rounded-xl shadow-xl z-50 overflow-hidden border"
          style={{
            backgroundColor: theme.displayBackground,
            borderColor: theme.backgroundMain,
          }}
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ color: theme.textPrimary }}
          >
            <circle cx="12" cy="12" r="1"></circle>
            <circle cx="12" cy="5" r="1"></circle>
            <circle cx="12" cy="19" r="1"></circle>
          </svg>
        </ContextMenu>
      </div>

      <div
        className="absolute top-0 left-0 right-0 overflow-y-auto transition-transform duration-300"
        style={{
          height: "70vh",
          backgroundColor: theme.backgroundMain,
          transform: `translateY(-${
            100 - (historyOffset / getMaxHeight()) * 100
          }%)`,
        }}
        onMouseDown={(e) => startDrag(e.clientY)}
      >
        <div className="p-4 pt-8">
          {history.length === 0 ? (
            <div
              className="text-center py-8"
              style={{ color: theme.textSecondary }}
            >
              No calculations yet
            </div>
          ) : (
            <div className="space-y-2">
              {history.map((item, index) => (
                <div
                  key={`${item.equation}-${index}`}
                  onClick={() => handleLoadFromHistory(item)}
                  className="p-3 rounded-lg cursor-pointer hover:opacity-80 transition-opacity"
                  style={{ backgroundColor: theme.displayBackground }}
                >
                  <div
                    className="text-sm"
                    style={{ color: theme.textSecondary }}
                  >
                    {item.equation}
                  </div>
                  <div
                    className="text-lg font-medium"
                    style={{ color: theme.textPrimary }}
                  >
                    = {item.result}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div
        className="flex-1 flex flex-col justify-end p-6 pb-4 rounded-b-3xl transition-transform duration-300"
        style={{
          backgroundColor: theme.displayBackground,
          transform: `translateY(${historyOffset}px)`,
        }}
      >
        <div className="text-right overflow-hidden">
          <div
            className="text-4xl font-light tracking-tight min-h-[3rem] overflow-x-auto whitespace-nowrap scrollbar-hidden"
            style={{ color: theme.textSecondary }}
          >
            {equation || "0"}
          </div>
        </div>

        <div className="text-right mt-2 overflow-hidden">
          <div
            className="text-6xl font-light tracking-tight min-h-[4rem] overflow-x-auto whitespace-nowrap scrollbar-hidden"
            style={{ color: isError ? "#ff6b6b" : theme.textPrimary }}
          >
            {result || "0"}
          </div>
        </div>

        <div
          className="flex justify-center mt-4 cursor-grab active:cursor-grabbing"
          onMouseDown={(e) => startDrag(e.clientY)}
        >
          <div
            className="w-8 h-1 rounded-full"
            style={{ backgroundColor: theme.textSecondary, opacity: 0.5 }}
          />
        </div>
      </div>

      {hasCustomItems && <CustomItemsSearch handleOperator={handleOperator} />}

      <CalculatorKeypad
        handleNumber={handleNumber}
        handleOperator={handleOperator}
        handleClear={handleClear}
        handleBackspace={handleBackspace}
        handleEquals={handleEquals}
        handleDecimal={handleDecimal}
        handleParentheses={handleParentheses}
        handlePercent={handlePercent}
      />

      <OperationDrawer
        isOpen={isDrawerOpen}
        onClose={handleCloseDrawer}
        operationType={drawerOperationType}
        onSave={handleSaveOperation}
        mathEvaluator={mathEvaluator}
      />

      <ThemeDrawer
        isOpen={isThemeDrawerOpen}
        onClose={handleCloseThemeDrawer}
      />
    </div>
  );
};

export default Page;
