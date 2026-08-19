// src/components/ui/Button.tsx
import { ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'danger';
}

export const Button = ({ variant = 'primary', children, className = '', ...props }: ButtonProps) => {
    const baseStyle = "py-3 px-4 rounded-lg font-bold transition-colors w-full";
    const variants = {
        primary: "bg-emerald-600 text-white hover:bg-emerald-700",
        secondary: "border border-slate-300 text-slate-600 hover:bg-slate-50",
        danger: "bg-red-600 text-white hover:bg-red-700"
    };

    return (
        <button className={`${baseStyle} ${variants[variant]} ${className}`} {...props}>
            {children}
        </button>
    );
};