import { useState, useRef, useEffect, useCallback, ReactNode, CSSProperties, memo, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";

export interface ContextMenuItem {
  id: string;
  label?: string;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
  icon?: ReactNode;
  style?: CSSProperties;
  navigateTo?: string;
}

interface ContextMenuProps {
  items: ContextMenuItem[];
  disabled?: boolean;
  triggerClassName?: string;
  menuClassName?: string;
  children?: ReactNode;
  style?: CSSProperties;
  onOpenDrawer?: (type: "function" | "operand" | "prefix" | "postfix") => void;
}

const ContextMenu = memo<ContextMenuProps>(({
  items,
  disabled = false,
  triggerClassName = "p-2 text-neutral-400 hover:text-white hover:bg-neutral-600 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed",
  menuClassName = "absolute right-0 top-full mt-2 w-44 bg-neutral-900 border border-neutral-700 rounded-xl shadow-xl z-50 overflow-hidden",
  children,
  style,
  onOpenDrawer
}: ContextMenuProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState<string>('main');
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const closeMenu = useCallback(() => {
    setIsMenuOpen(false);
    setCurrentPage('main');
  }, []);

  const handleClickOutside = useCallback((event: MouseEvent | TouchEvent) => {
    const target = event.target as Node;
    if (
      menuRef.current &&
      buttonRef.current &&
      !menuRef.current.contains(target) &&
      !buttonRef.current.contains(target)
    ) {
      closeMenu();
    }
  }, [closeMenu]);

  const handleEscape = useCallback((event: KeyboardEvent) => {
    if (event.key === "Escape") {
      closeMenu();
    }
  }, [closeMenu]);

  useEffect(() => {
    if (!isMenuOpen) return;
    document.addEventListener("mousedown", handleClickOutside, true);
    document.addEventListener("touchstart", handleClickOutside, true);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside, true);
      document.removeEventListener("touchstart", handleClickOutside, true);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isMenuOpen, handleClickOutside, handleEscape]);

  const handleMenuToggle = useCallback(() => {
    setIsMenuOpen(prev => !prev);
  }, []);

  const handleItemClick = useCallback((item: ContextMenuItem) => {
    if (item.navigateTo) {
      setCurrentPage(item.navigateTo);
    } else {
      closeMenu();
      item.onClick?.();
    }
  }, [closeMenu]);

  const handleBackClick = useCallback(() => {
    setCurrentPage('main');
  }, []);

  const operationsMenuItems = useMemo((): ContextMenuItem[] => {
    const commonClassName = "w-full px-3 py-2 text-left text-sm text-neutral-300 hover:bg-neutral-700/60 hover:text-white transition-colors flex items-center space-x-2 rounded-lg";
    
    return [
      {
        id: "add-function",
        label: "Add Function",
        onClick: () => {
          closeMenu();
          onOpenDrawer?.('function');
        },
        className: commonClassName,
      },
      {
        id: "add-operand",
        label: "Add Operand",
        onClick: () => {
          closeMenu();
          onOpenDrawer?.('operand');
        },
        className: commonClassName,
      },
      {
        id: "add-prefix",
        label: "Add Prefix",
        onClick: () => {
          closeMenu();
          onOpenDrawer?.('prefix');
        },
        className: commonClassName,
      },
      {
        id: "add-postfix",
        label: "Add Postfix",
        onClick: () => {
          closeMenu();
          onOpenDrawer?.('postfix');
        },
        className: commonClassName,
      },
    ];
  }, [closeMenu, onOpenDrawer]);

  const currentMenuItems = useMemo(() => {
    return currentPage === 'operations' ? operationsMenuItems : items;
  }, [currentPage, operationsMenuItems, items]);

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        onClick={handleMenuToggle}
        disabled={disabled}
        className={triggerClassName}
        aria-haspopup="menu"
        aria-expanded={isMenuOpen}
      >
        {children || (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01" />
          </svg>
        )}
      </button>

      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            ref={menuRef}
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ duration: 0.15 }}
            className={menuClassName}
            style={style}
            role="menu"
          >
            <motion.div 
              key={currentPage}
              initial={{ opacity: 0, x: currentPage === 'main' ? -20 : 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: currentPage === 'main' ? 20 : -20 }}
              transition={{ duration: 0.2 }}
              className="p-2"
            >
              {currentPage !== 'main' && (
                <button
                  onClick={handleBackClick}
                  className="w-full px-3 py-2 text-left text-sm text-neutral-300 hover:bg-neutral-700/60 hover:text-white transition-colors flex items-center space-x-2 rounded-lg mb-2"
                  role="menuitem"
                  type="button"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  <span>Back</span>
                </button>
              )}
              {currentMenuItems.map(item => {
                if (item.id === "divider") {
                  return <div key={item.id} className={item.className} />;
                }
                return (
                  <button
                    key={item.id}
                    onClick={() => handleItemClick(item)}
                    disabled={item.disabled}
                    className={
                      item.className ||
                      "w-full px-3 py-2 text-left text-sm text-neutral-300 hover:bg-neutral-700/60 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-between rounded-lg"
                    }
                    style={item.style}
                    role="menuitem"
                    type="button"
                  >
                    <div className="flex items-center space-x-2">
                      {item.icon && <span className="flex-shrink-0">{item.icon}</span>}
                      {item.label && <span>{item.label}</span>}
                    </div>
                    {item.navigateTo && (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    )}
                  </button>
                );
              })}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});

ContextMenu.displayName = 'ContextMenu';

export default ContextMenu;

export const useContextMenuActions = () => {
  const [isLoading, setIsLoading] = useState(false);

  const executeAction = useCallback(async (action: () => Promise<void>) => {
    setIsLoading(true);
    try {
      await action();
    } catch (error) {
      console.error("Action failed:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { isLoading, executeAction };
};
