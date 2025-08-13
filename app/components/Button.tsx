import React, { memo, useMemo, useCallback } from 'react';

interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'ac' | 'equal' | 'operator' | 'default';
  className?: string;
  span?: number;
}

interface Theme {
  buttonDefault: string;
  buttonAC: string;
  buttonEqual: string;
  buttonOperator: string;
  textPrimary: string;
  textAC: string;
  textEqual: string;
  textOperator: string;
}

interface ButtonWithThemeProps extends ButtonProps {
  theme: Theme;
}

const Button = memo<ButtonWithThemeProps>(({ children, onClick, variant = 'default', className = '', span = 1, theme }) => {
  const buttonStyle = useMemo(() => {
    const baseStyle = "rounded-full text-2xl font-normal transition-all duration-200 ease-in-out hover:brightness-110 active:scale-95 flex items-center justify-center";
    
    switch (variant) {
      case 'ac':
      case 'equal':
        return `${baseStyle} text-white`;
      case 'operator':
      default:
        return baseStyle;
    }
  }, [variant]);

  const backgroundColor = useMemo(() => {
    switch (variant) {
      case 'ac':
        return theme.buttonAC;
      case 'equal':
        return theme.buttonEqual;
      case 'operator':
        return theme.buttonOperator;
      default:
        return theme.buttonDefault;
    }
  }, [variant, theme]);

  const textColor = useMemo(() => {
    switch (variant) {
      case 'ac':
        return theme.textAC;
      case 'equal':
        return theme.textEqual;
      case 'operator':
        return theme.textOperator;
      default:
        return theme.textPrimary;
    }
  }, [variant, theme]);

  const handleClick = useCallback(() => {
    onClick?.();
  }, [onClick]);

  const containerClassName = useMemo(() => {
    return span === 2 ? 'col-span-2' : '';
  }, [span]);

  const buttonClassName = useMemo(() => {
    return `w-full aspect-square ${buttonStyle} ${className}`;
  }, [buttonStyle, className]);

  const buttonStyles = useMemo(() => ({
    backgroundColor,
    color: textColor,
  }), [backgroundColor, textColor]);

  return (
    <div className={containerClassName}>
      <button
        className={buttonClassName}
        style={buttonStyles}
        onClick={handleClick}
        type="button"
      >
        {children}
      </button>
    </div>
  );
});

Button.displayName = 'Button';

export default Button;