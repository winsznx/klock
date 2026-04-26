import React, { forwardRef } from 'react';

export const Badge = forwardRef<HTMLDivElement, Readonly<React.HTMLAttributes<HTMLDivElement>>>((props, ref) => (
  <div ref={ref} className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold" {...props} />
));
Badge.displayName = 'Badge';
