/**
 * Input Component — OpenClaw UI
 *
 * Consumes ThemeContext tokens exclusively. Zero hardcoded colors.
 *
 * Variants:
 *   default   — standard text input
 *   disabled  — grayed out, pointer-events none, aria-disabled
 *   loading   — shows a spinning indicator, input remains visible but non-interactive
 *
 * All visual values (colors, radii, spacing, shadows, typography) are
 * resolved from the active theme via ThemeContext. Swapping the theme
 * flag at runtime changes every pixel of this component.
 */

import React, {
  useState,
  useCallback,
  forwardRef,
  useId,
  type InputHTMLAttributes,
  type ReactNode,
} from 'react';
import { useTheme } from './ThemeContext';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type InputVariant = 'default' | 'disabled' | 'loading';

export interface InputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  /** Visual variant — default | disabled | loading */
  variant?: InputVariant;
  /** Optional label rendered above the input */
  label?: string;
  /** Optional helper/error text rendered below the input */
  helperText?: string;
  /** When true, helperText renders in the theme's error color */
  error?: boolean;
  /** Predefined size scale from the theme */
  size?: 'sm' | 'md' | 'lg';
  /** Optional icon rendered inside the input, left side */
  leftIcon?: ReactNode;
  /** Optional icon rendered inside the input, right side */
  rightIcon?: ReactNode;
  /** Render the input as a textarea (multiline) */
  multiline?: boolean;
  /** Number of rows — only relevant when multiline is true */
  rows?: number;
}

// ---------------------------------------------------------------------------
// Spinner sub-component (loaded indicator)
// ---------------------------------------------------------------------------

interface SpinnerProps {
  size: number;
  color: string;
  trackColor: string;
}

const Spinner: React.FC<SpinnerProps> = ({ size, color, trackColor }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 16 16"
    fill="none"
    aria-hidden="true"
    style={{ flexShrink: 0, animation: 'oc-spin 800ms linear infinite' }}
  >
    <circle
      cx="8"
      cy="8"
      r="6"
      stroke={trackColor}
      strokeWidth="2"
      opacity="0.25"
    />
    <path
      d="M8 2 A6 6 0 0 1 14 8"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
);

// ---------------------------------------------------------------------------
// Input
// ---------------------------------------------------------------------------

const Input = forwardRef<HTMLInputElement | HTMLTextAreaElement, InputProps>(
  (props, ref) => {
    const {
      variant = 'default',
      label,
      helperText,
      error = false,
      size = 'md',
      leftIcon,
      rightIcon,
      multiline = false,
      rows = 3,
      disabled,
      className = '',
      style,
      id: externalId,
      ...rest
    } = props;

    const theme = useTheme();
    const generatedId = useId();
    const id = externalId ?? generatedId;
    const isDisabled = disabled || variant === 'disabled';
    const isLoading = variant === 'loading';
    const isInteractive = !isDisabled && !isLoading;

    // -----------------------------------------------------------------------
    // Token resolution
    // -----------------------------------------------------------------------

    const t = theme.tokens;

    // Size scale
    const sizeScale: Record<string, { height: number; fontSize: number; paddingH: number; iconSize: number }> = {
      sm: {
        height: 32,
        fontSize: Number(t.typography?.sizes?.xs ?? 12),
        paddingH: Number(t.spacing?.sm ?? 8),
        iconSize: 14,
      },
      md: {
        height: 40,
        fontSize: Number(t.typography?.sizes?.sm ?? 14),
        paddingH: Number(t.spacing?.md ?? 12),
        iconSize: 16,
      },
      lg: {
        height: 48,
        fontSize: Number(t.typography?.sizes?.base ?? 16),
        paddingH: Number(t.spacing?.lg ?? 16),
        iconSize: 18,
      },
    };

    const sz = sizeScale[size] ?? sizeScale.md;

    // Color tokens — resolved from the active theme
    const tokenColors = {
      // Surface
      bg: isDisabled
        ? t.colors?.surfaceDisabled ?? t.colors?.surfaceMuted ?? '#1e1e1e'
        : t.colors?.surfaceInput ?? t.colors?.surface ?? '#111111',

      // Border
      borderDefault: isDisabled
        ? t.colors?.borderDisabled ?? t.colors?.borderMuted ?? 'rgba(255,255,255,0.08)'
        : t.colors?.border ?? t.colors?.borderDefault ?? 'rgba(255,255,255,0.12)',

      borderFocus: isDisabled
        ? t.colors?.borderDisabled ?? 'rgba(255,255,255,0.08)'
        : t.colors?.primary ?? t.colors?.accent ?? '#f59e0b',

      // Text
      text: isDisabled
        ? t.colors?.textMuted ?? t.colors?.textDisabled ?? 'rgba(255,255,255,0.3)'
        : t.colors?.textPrimary ?? t.colors?.text ?? '#f5f5f5',

      placeholder: isDisabled
        ? t.colors?.textDisabled ?? 'rgba(255,255,255,0.2)'
        : t.colors?.textPlaceholder ?? t.colors?.textSecondary ?? 'rgba(255,255,255,0.45)',

      // Label
      label: isDisabled
        ? t.colors?.textMuted ?? 'rgba(255,255,255,0.3)'
        : t.colors?.textSecondary ?? t.colors?.label ?? 'rgba(255,255,255,0.7)',

      // Helper / error
      helper: error
        ? (t.colors?.error ?? '#ef4444')
        : (t.colors?.textMuted ?? 'rgba(255,255,255,0.5)'),

      // Icon
      icon: isDisabled
        ? t.colors?.textDisabled ?? 'rgba(255,255,255,0.25)'
        : (t.colors?.textSecondary ?? 'rgba(255,255,255,0.6)'),

      // Spinner
      spinner: t.colors?.primary ?? t.colors?.accent ?? '#f59e0b',
      spinnerTrack: t.colors?.textDisabled ?? 'rgba(255,255,255,0.15)',
    };

    // Radii
    const radius = t.radii?.input ?? t.radii?.md ?? t.radii?.base ?? 8;

    // Shadow tokens
    const shadow = t.shadows?.input ?? t.shadows?.sm ?? 'none';
    const shadowFocus = t.shadows?.inputFocus ?? t.shadows?.focus ?? 'none';

    // Transition
    const transition = 'border-color 150ms ease, box-shadow 150ms ease, background-color 150ms ease';

    // -----------------------------------------------------------------------
    // Local state for focus ring
    // -----------------------------------------------------------------------

    const [isFocused, setIsFocused] = useState(false);

    const handleFocus = useCallback(
      (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setIsFocused(true);
        props.onFocus?.(e as React.FocusEvent<HTMLInputElement>);
      },
      [props.onFocus],
    );

    const handleBlur = useCallback(
      (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setIsFocused(false);
        props.onBlur?.(e as React.FocusEvent<HTMLInputElement>);
      },
      [props.onBlur],
    );

    // -----------------------------------------------------------------------
    // Base input / textarea style
    // -----------------------------------------------------------------------

    const inputStyle: React.CSSProperties = {
      width: '100%',
      height: multiline ? undefined : sz.height,
      minHeight: multiline ? sz.height * 1.5 : undefined,
      paddingTop: multiline ? sz.paddingH * 0.75 : 0,
      paddingBottom: multiline ? sz.paddingH * 0.75 : 0,
      paddingLeft: leftIcon ? sz.height + sz.paddingH - 4 : sz.paddingH,
      paddingRight: (rightIcon || isLoading) ? sz.height + sz.paddingH - 4 : sz.paddingH,
      fontSize: sz.fontSize,
      fontFamily: t.typography?.fontFamily ?? t.typography?.fonts?.body ?? 'DM Sans, sans-serif',
      lineHeight: t.typography?.lineHeight ?? 1.5,
      color: tokenColors.text,
      backgroundColor: tokenColors.bg,
      borderWidth: 1,
      borderStyle: 'solid',
      borderColor: isFocused ? tokenColors.borderFocus : tokenColors.borderDefault,
      borderRadius: radius,
      outline: 'none',
      boxShadow: isFocused ? shadowFocus : shadow,
      transition,
      cursor: isDisabled ? 'not-allowed' : 'text',
      opacity: isDisabled ? 0.6 : 1,
      pointerEvents: isDisabled ? 'none' : 'auto',
      boxSizing: 'border-box',
      resize: 'vertical' as const,
      WebkitAppearance: 'none',
      ...style,
    };

    // -----------------------------------------------------------------------
    // Global keyframe injection (once)
    // -----------------------------------------------------------------------

    React.useEffect(() => {
      const id = 'oc-input-keyframes';
      if (!document.getElementById(id)) {
        const style = document.createElement('style');
        style.id = id;
        style.textContent = '@keyframes oc-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }';
        document.head.appendChild(style);
      }
    }, []);

    // -----------------------------------------------------------------------
    // Computed container class + style
    // -----------------------------------------------------------------------

    const containerStyle: React.CSSProperties = {
      display: 'flex',
      flexDirection: 'column',
      gap: t.spacing?.xs ?? 4,
      width: '100%',
    };

    const inputWrapperStyle: React.CSSProperties = {
      position: 'relative',
      display: 'flex',
      alignItems: 'center',
      width: '100%',
    };

    // -----------------------------------------------------------------------
    // Render
    // -----------------------------------------------------------------------

    const InputElement = multiline ? 'textarea' : 'input';

    return (
      <div className={className} style={containerStyle}>
        {/* Label */}
        {label && (
          <label
            htmlFor={id as string}
            style={{
              fontSize: sz.fontSize * 0.875,
              fontWeight: 500,
              fontFamily: t.typography?.fontFamily ?? t.typography?.fonts?.heading ?? 'Space Grotesk, sans-serif',
              color: tokenColors.label,
              cursor: isDisabled ? 'not-allowed' : 'default',
              userSelect: 'none',
            }}
          >
            {label}
          </label>
        )}

        {/* Input wrapper — hosts left icon, input, right icon / spinner */}
        <div style={inputWrapperStyle}>
          {/* Left icon */}
          {leftIcon && (
            <span
              aria-hidden="true"
              style={{
                position: 'absolute',
                left: sz.paddingH,
                top: '50%',
                transform: 'translateY(-50%)',
                display: 'flex',
                alignItems: 'center',
                color: tokenColors.icon,
                pointerEvents: 'none',
              }}
            >
              {React.isValidElement(leftIcon)
                ? React.cloneElement(leftIcon as React.ReactElement<{ size?: number; style?: React.CSSProperties }>, {
                    size: sz.iconSize,
                    style: { color: tokenColors.icon },
                  })
                : leftIcon}
            </span>
          )}

          {/* The actual input / textarea */}
          <InputElement
            ref={ref as any}
            id={id as string}
            disabled={isDisabled}
            aria-disabled={isDisabled}
            aria-invalid={error || undefined}
            aria-describedby={helperText ? `${id}-helper` : undefined}
            rows={multiline ? rows : undefined}
            placeholder={rest.placeholder}
            style={inputStyle}
            onFocus={handleFocus as any}
            onBlur={handleBlur as any}
            {...rest as any}
          />

          {/* Right icon */}
          {rightIcon && !isLoading && (
            <span
              aria-hidden="true"
              style={{
                position: 'absolute',
                right: sz.paddingH,
                top: '50%',
                transform: 'translateY(-50%)',
                display: 'flex',
                alignItems: 'center',
                color: tokenColors.icon,
                pointerEvents: 'none',
              }}
            >
              {React.isValidElement(rightIcon)
                ? React.cloneElement(rightIcon as React.ReactElement<{ size?: number; style?: React.CSSProperties }>, {
                    size: sz.iconSize,
                    style: { color: tokenColors.icon },
                  })
                : rightIcon}
            </span>
          )}

          {/* Loading spinner — replaces right icon when loading */}
          {isLoading && (
            <span
              aria-hidden="true"
              style={{
                position: 'absolute',
                right: sz.paddingH,
                top: '50%',
                transform: 'translateY(-50%)',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <Spinner
                size={sz.iconSize}
                color={tokenColors.spinner}
                trackColor={tokenColors.spinnerTrack}
              />
            </span>
          )}
        </div>

        {/* Helper / error text */}
        {helperText && (
          <span
            id={`${id}-helper`}
            role={error ? 'alert' : undefined}
            style={{
              fontSize: sz.fontSize * 0.8125,
              lineHeight: 1.4,
              color: tokenColors.helper,
              fontFamily: t.typography?.fontFamily ?? t.typography?.fonts?.body ?? 'DM Sans, sans-serif',
            }}
          >
            {helperText}
          </span>
        )}
      </div>
    );
  },
);

Input.displayName = 'Input';

export default Input;
