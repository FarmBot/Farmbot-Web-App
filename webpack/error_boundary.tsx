import * as React from "react";
import { catchErrors } from "./util";
import { Apology } from "./apology";

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

  no = () => <Apology />;

  ok = () => this.props.children || <div />;

  render() { return (this.state.hasError ? this.no : this.ok)(); }
}
