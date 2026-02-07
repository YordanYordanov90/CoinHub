'use client';

import React, { type ReactNode } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
  /** Rendered when an error is caught. Receives the error if you need to display it. */
  fallback?: ReactNode | ((error: Error) => ReactNode);
  /** Called when an error is caught (e.g. for logging or analytics). */
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

/**
 * Reusable React Error Boundary. Wrap any component tree to catch render errors
 * and show a fallback instead of crashing the app.
 */
export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    this.props.onError?.(error, errorInfo);
  }

  render(): ReactNode {
    if (this.state.hasError && this.state.error) {
      const fallback = this.props.fallback;
      if (typeof fallback === 'function') {
        return fallback(this.state.error);
      }
      if (fallback) {
        return fallback;
      }
      return (
        <div className="rounded-lg border border-border bg-muted/30 p-4 text-center text-sm text-muted-foreground">
          Something went wrong in this section.
        </div>
      );
    }
    return this.props.children;
  }
}
