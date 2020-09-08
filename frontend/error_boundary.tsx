import React from "react";
import { catchErrors } from "./util";
import { Apology } from "./apology";

interface State { hasError?: boolean; }
interface Props { fallback?: React.ReactElement }

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  componentDidCatch(error: Error) {
    // eslint-disable-next-line no-empty
    try { catchErrors(error); } catch (e) { }
    this.setState({ hasError: true });
  }

  no = () => this.props.fallback || <Apology />;

  ok = () => this.props.children || <div className={"no-children"} />;

  render() { return (this.state.hasError ? this.no : this.ok)(); }
}
