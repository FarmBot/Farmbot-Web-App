import * as React from "react";

interface BPProps {
  onCommit(e: React.SyntheticEvent<HTMLInputElement>): void;
  name?: string;
}

interface BPState {
  value: string;
}

export class BlurablePassword extends React.Component<BPProps, BPState> {
  constructor(props: BPProps) {
    super(props);
    this.state = { value: "" };
  }
  render() {
    return <input
      type="password"
      onBlur={(e) => this.props.onCommit(e)}
      onChange={(e) => this.setState({ value: e.target.value })} />;
  }
}
