import React, { forwardRef } from 'react';

export const Label = forwardRef<HTMLLabelElement, Readonly<React.LabelHTMLAttributes<HTMLLabelElement>>>((props, ref) => (
  <label ref={ref} className="text-sm font-medium leading-none" {...props} />
));
Label.displayName = 'Label';
