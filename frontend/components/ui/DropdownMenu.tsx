'use client';

import { useCallback, useEffect, useId, useRef, useState } from 'react';

type TriggerProps = {
  ref: React.Ref<HTMLButtonElement>;
  id: string;
  'aria-expanded': boolean;
  'aria-haspopup': 'menu';
  'aria-controls': string;
  onClick: () => void;
};

type TriggerRenderArgs = {
  open: boolean;
  close: () => void;
  getTriggerProps: () => TriggerProps;
};

type PanelRender = (args: { close: () => void }) => React.ReactNode;

interface DropdownMenuProps {
  trigger: (args: TriggerRenderArgs) => React.ReactNode;
  children: React.ReactNode | PanelRender;
  align?: 'left' | 'right';
  panelClassName?: string;
  panelTestId?: string;
  ariaLabel?: string;
  onOpen?: () => void;
}

export default function DropdownMenu({
  trigger,
  children,
  align = 'left',
  panelClassName = '',
  panelTestId,
  ariaLabel,
  onOpen,
}: DropdownMenuProps) {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const baseId = useId();
  const triggerId = `${baseId}-trigger`;
  const panelId = `${baseId}-panel`;

  const close = useCallback(() => setOpen(false), []);
  const toggle = useCallback(() => {
    setOpen((prev) => {
      if (!prev) onOpen?.();
      return !prev;
    });
  }, [onOpen]);

  useEffect(() => {
    if (!open) return;
    const handleClick = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false);
        triggerRef.current?.focus();
        return;
      }
      if (!panelRef.current) return;
      const items = Array.from(
        panelRef.current.querySelectorAll<HTMLElement>('[role="menuitem"]:not([aria-disabled="true"])'),
      );
      if (items.length === 0) return;
      const activeIndex = items.findIndex((el) => el === document.activeElement);
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        items[(activeIndex + 1 + items.length) % items.length]?.focus();
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        items[(activeIndex - 1 + items.length) % items.length]?.focus();
      } else if (e.key === 'Home') {
        e.preventDefault();
        items[0]?.focus();
      } else if (e.key === 'End') {
        e.preventDefault();
        items[items.length - 1]?.focus();
      }
    };
    document.addEventListener('mousedown', handleClick);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('keydown', handleKey);
    };
  }, [open]);

  const getTriggerProps = useCallback(
    (): TriggerProps => ({
      ref: triggerRef,
      id: triggerId,
      'aria-expanded': open,
      'aria-haspopup': 'menu',
      'aria-controls': panelId,
      onClick: toggle,
    }),
    [open, toggle, triggerId, panelId],
  );

  return (
    <div ref={wrapperRef} className="relative">
      {trigger({ open, close, getTriggerProps })}
      {open && (
        <div
          ref={panelRef}
          id={panelId}
          role="menu"
          aria-labelledby={triggerId}
          aria-label={ariaLabel}
          data-testid={panelTestId}
          className={`absolute ${align === 'right' ? 'right-0' : 'left-0'} top-full mt-2 rounded-xl border border-border-primary bg-surface-elevated dark:bg-surface-elevated/95 dark:backdrop-blur-xl dark:border-border-secondary shadow-xl z-50 overflow-hidden ${panelClassName}`}
        >
          {typeof children === 'function' ? (children as PanelRender)({ close }) : children}
        </div>
      )}
    </div>
  );
}

export function DropdownDivider() {
  return <div className="my-1 h-px bg-border-tertiary" />;
}
