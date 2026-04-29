import React from 'react';
export function withStrictMemo<P extends object>(Component: React.ComponentType<P>, areEqual?: (prev: Readonly<P>, next: Readonly<P>) => boolean) {
  return React.memo(Component, areEqual);
}
