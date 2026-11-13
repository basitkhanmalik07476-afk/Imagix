import { cn } from '@/src/lib/utils';

interface SwitchProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
}

export function Switch({ checked, onCheckedChange, label, disabled = false }: SwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onCheckedChange(!checked)}
      className={cn(
        'relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0e7c5b] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
        checked
          ? 'border-[#0e7c5b] bg-[#0e7c5b]'
          : 'border-[#d6cfc0] bg-[#e9e4d9]'
      )}
    >
      <span
        className={cn(
          'pointer-events-none inline-block h-4 w-4 rounded-full bg-white shadow-xs transition-transform duration-150',
          checked ? 'translate-x-6' : 'translate-x-1'
        )}
      />
    </button>
  );
}
