import React from 'react';

export class ErrorBoundary extends React.Component<Readonly<{children: React.ReactNode}>, {hasError: boolean}> {
  constructor(props: Readonly<{children: React.ReactNode}>) { super(props); this.state = { hasError: false }; }
  static getDerivedStateFromError() { return { hasError: true }; }
  render() { if (this.state.hasError) return <h1>Something went wrong.</h1>; return this.props.children; }
}
