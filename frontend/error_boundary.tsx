import React from "react";
import { catchErrors } from "./util";
import { Apology } from "./apology";

interface State {
  hasError?: boolean;
  error?: Error;
}
interface ErrorBoundaryProps {
  fallback?: React.ReactElement;
  children: React.ReactNode;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, State> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  componentDidCatch(error: Error) {
    if (process.env.BUN_TEST_DEBUG_ERROR_BOUNDARY) {
      try {
        process.stderr.write(`${error.stack || error.message}\n`);
      } catch {
        // ignore logging failures
      }
    }
    // eslint-disable-next-line no-empty
    try { catchErrors(error); } catch { }
    this.setState({ hasError: true, error });
  }

  no = () => this.props.fallback || <Apology error={this.state.error} />;

  ok = () => this.props.children;

  render() { return (this.state.hasError ? this.no : this.ok)(); }
}
