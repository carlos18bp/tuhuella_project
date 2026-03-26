'use client';

import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

export interface MultiSelectOption {
  value: string;
  label: string;
}

interface MultiSelectDropdownProps {
  label: string;
  options: MultiSelectOption[];
  selected: string[];
  onChange: (selected: string[]) => void;
}

export default function MultiSelectDropdown({
  label,
  options,
  selected,
  onChange,
}: MultiSelectDropdownProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const toggle = (value: string) => {
    if (selected.includes(value)) {
      onChange(selected.filter((v) => v !== value));
    } else {
      onChange([...selected, value]);
    }
  };

  const displayLabel =
    selected.length === 0
      ? label
      : selected.length === 1
        ? options.find((o) => o.value === selected[0])?.label ?? label
        : `${label} (${selected.length})`;

  return (
    <div ref={ref} className="relative" data-testid={`filter-${label}`}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm transition-colors ${
          selected.length > 0
            ? 'border-teal-400 bg-teal-50 text-teal-700 ring-1 ring-teal-200/50'
            : 'border-border-secondary bg-surface-primary text-text-secondary hover:border-stone-400 hover:shadow-sm'
        }`}
      >
        <span>{displayLabel}</span>
        <ChevronDown
          className={`h-4 w-4 transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open && (
        <div className="absolute left-0 top-full z-30 mt-1 min-w-[200px] rounded-xl border border-border-primary bg-surface-primary py-1 shadow-xl ring-1 ring-black/5 animate-scale-in">
          {options.map((option) => {
            const isSelected = selected.includes(option.value);
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => toggle(option.value)}
                className={`flex w-full items-center gap-3 px-3 py-2 text-sm transition-colors hover:bg-surface-hover ${
                  isSelected ? 'text-teal-700 font-medium' : 'text-text-secondary'
                }`}
              >
                <span
                  className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors ${
                    isSelected
                      ? 'border-teal-500 bg-teal-500 text-white'
                      : 'border-border-secondary'
                  }`}
                >
                  {isSelected && <Check className="h-3 w-3" />}
                </span>
                <span>{option.label}</span>
              </button>
            );
          })}

          {selected.length > 0 && (
            <>
              <hr className="my-1 border-border-tertiary" />
              <button
                type="button"
                onClick={() => onChange([])}
                className="w-full px-3 py-2 text-left text-xs text-text-quaternary hover:text-text-secondary transition-colors"
              >
                Limpiar filtro
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
