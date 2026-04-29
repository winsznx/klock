import React from 'react';
export class ErrorBoundaryStrict extends React.Component<Readonly<{children: React.ReactNode, fallback: React.ReactNode}>, {hasError: boolean}> {
  constructor(props: any) { super(props); this.state = { hasError: false }; }
  static getDerivedStateFromError() { return { hasError: true }; }
  render() { return this.state.hasError ? this.props.fallback : this.props.children; }
}
export function withErrorBoundaryStrict<P extends object>(Component: React.ComponentType<P>, fallback: React.ReactNode) {
  return (props: P) => <ErrorBoundaryStrict fallback={fallback}><Component {...props} /></ErrorBoundaryStrict>;
}
