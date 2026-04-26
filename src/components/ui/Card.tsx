import React, { forwardRef } from 'react';

export const Card = forwardRef<HTMLDivElement, Readonly<React.HTMLAttributes<HTMLDivElement>>>((props, ref) => (
  <div ref={ref} className="rounded-xl border bg-card text-card-foreground shadow" {...props} />
));
Card.displayName = 'Card';
