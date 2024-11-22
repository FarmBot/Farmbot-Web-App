import React from "react";
import { catchErrors } from "./util";
import { Apology } from "./apology";

interface State { hasError?: boolean; }
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
    // eslint-disable-next-line no-empty
    try { catchErrors(error); } catch (e) { }
    this.setState({ hasError: true });
  }

  no = () => this.props.fallback || <Apology />;

  ok = () => this.props.children;

  render() { return (this.state.hasError ? this.no : this.ok)(); }
}
