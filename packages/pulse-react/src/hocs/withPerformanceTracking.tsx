import React, { useEffect } from 'react';
export function withPerformanceTracking<P extends object>(WrappedComponent: React.ComponentType<P>, componentName: string) {
  return function WithPerformanceTracking(props: P) {
    useEffect(() => {
      const start = performance.now();
      return () => console.log(`[${componentName}] unmounted after ${performance.now() - start}ms`);
    }, []);
    return <WrappedComponent {...props} />;
  };
}
