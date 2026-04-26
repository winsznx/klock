import React from 'react';

export function typedMemo<T extends React.ComponentType<any>>(Component: T): T {
  return React.memo(Component) as T;
}
