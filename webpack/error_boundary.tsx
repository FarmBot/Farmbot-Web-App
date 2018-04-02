import * as React from "react";
import { catchErrors } from "./util";

interface State { hasError?: boolean; }
interface Props { }

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  componentDidCatch(error: Error) {
    try {
      this.setState({ hasError: true });
      catchErrors(error);
    } catch (e) {
      this.setState({ hasError: true });
    }
  }

  no = () => <h1>Something went wrong.</h1>;

  ok = () => this.props.children;

  render() { return (this.state.hasError ? this.no : this.ok)(); }
}
