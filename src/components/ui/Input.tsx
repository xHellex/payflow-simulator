// src/components/ui/Input.tsx
import { forwardRef, InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    label: string;
    error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
    ({ label, error, ...props }, ref) => (
        <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">{label}</label>
            <input
                ref={ref}
                className={`w-full border rounded-md p-2 text-sm ${error ? 'border-red-500' : 'border-slate-300'}`}
                aria-invalid={!!error}
                {...props}
            />
            {error && <p className="text-red-500 text-xs mt-1" role="alert">{error}</p>}
        </div>
    )
);
Input.displayName = 'Input';