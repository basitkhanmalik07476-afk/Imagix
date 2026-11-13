import * as React from 'react';
import { cn } from '@/src/lib/utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive';
  size?: 'sm' | 'md' | 'lg' | 'icon';
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', type = 'button', ...props }, ref) => {
    const variants: Record<NonNullable<ButtonProps['variant']>, string> = {
      primary:
        'bg-[#0e7c5b] text-white hover:bg-[#095e44] active:bg-[#074d38] shadow-[0_2px_8px_rgba(14,124,91,0.18)]',
      secondary:
        'bg-[#f1ede3] text-[#181a18] hover:bg-[#e7e1d4]',
      outline:
        'border border-[#d9d3c5] bg-white text-[#181a18] hover:border-[#b9b1a0] hover:bg-[#faf8f3]',
      ghost:
        'text-[#555955] hover:bg-[#f1ede3] hover:text-[#181a18]',
      destructive:
        'bg-red-600 text-white hover:bg-red-700',
    };

    const sizes: Record<NonNullable<ButtonProps['size']>, string> = {
      sm: 'h-8.5 px-3 text-xs rounded-lg',
      md: 'h-10 px-4 text-sm rounded-xl',
      lg: 'h-11 px-5 text-sm rounded-xl',
      icon: 'h-9.5 w-9.5 rounded-lg',
    };

    return (
      <button
        ref={ref}
        type={type}
        className={cn(
          'inline-flex items-center justify-center gap-2 font-medium whitespace-nowrap shrink-0 transition-[background-color,border-color,color,transform] duration-150 active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0e7c5b] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 cursor-pointer',
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';
