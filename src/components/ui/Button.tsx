import React, { forwardRef } from 'react';

export type ButtonProps = Readonly<React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' }>;

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(({ variant = 'primary', ...props }, ref) => (
  <button ref={ref} className={`btn btn-${variant}`} {...props} />
));
Button.displayName = 'Button';
