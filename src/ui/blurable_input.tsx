import * as React from "react";

interface BIProps {
  value: string;
  onCommit(e: React.SyntheticEvent<HTMLInputElement>): void;
  min?: number;
  max?: number;
  type?: "text" | "number" | "email" | "password" | "time" | "date";
  name?: string;
  id?: string;
  /** Allow the user to empty out the form control. If unset, form control
   * will reset itself to previous value. */
  allowEmpty?: boolean;
  disabled?: boolean;
  className?: string;
  placeholder?: string;
  hidden?: boolean;
}

interface BIState {
  buffer: string;
  isEditing: boolean;
}

export class BlurableInput extends React.Component<BIProps, Partial<BIState>> {

  state: BIState = { buffer: "", isEditing: false };

  /** Called on blur. */
  maybeCommit = (e: React.SyntheticEvent<HTMLInputElement>) => {
    let shouldPassToParent = (this.state.buffer || (this.props.allowEmpty));
    if (shouldPassToParent) { this.props.onCommit(e); }
    this.setState({ isEditing: false, buffer: "" });
  }

  focus = () => {
    this.setState({ isEditing: true, buffer: this.props.value || "" });
  }

  updateBuffer = (e: React.SyntheticEvent<HTMLInputElement>) => {
    let buffer = e.currentTarget.value;
    this.setState({ buffer });
  }

  render() {
    let value = this.state.isEditing ? this.state.buffer : this.props.value;
    return <input value={value}
      hidden={!!this.props.hidden}
      onFocus={this.focus}
      onChange={this.updateBuffer}
      onBlur={this.maybeCommit}
      name={this.props.name}
      id={this.props.id}
      type={this.props.type || "text"}
      disabled={this.props.disabled}
      className={this.props.className}
      placeholder={this.props.placeholder}
    />;
  }
}
