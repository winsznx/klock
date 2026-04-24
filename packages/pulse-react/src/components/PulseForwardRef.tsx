import React, { forwardRef } from 'react';

export type PulseProps<T> = T & {
    className?: string;
    children?: React.ReactNode;
};

export function withPulseRef<T, P = {}>(Component: React.ForwardRefRenderFunction<T, PulseProps<P>>) {
    return forwardRef(Component);
}
