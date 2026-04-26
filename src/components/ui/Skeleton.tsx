import React, { forwardRef } from 'react';

export const Skeleton = forwardRef<HTMLDivElement, Readonly<React.HTMLAttributes<HTMLDivElement>>>((props, ref) => (
  <div ref={ref} className="animate-pulse rounded-md bg-muted" {...props} />
));
Skeleton.displayName = 'Skeleton';
