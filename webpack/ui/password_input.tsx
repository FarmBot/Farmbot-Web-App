import * as React from "react";
import { equals } from "../util";

export class PasswordInput extends React.Component<BIProps, Partial<BIState>> {

  state: BIState = { buffer: "", isEditing: false };

  /** Called on blur. */
  maybeCommit = (e: React.SyntheticEvent<HTMLInputElement>) => {
    const shouldPassToParent = (this.state.buffer || (this.props.allowEmpty));
    if (shouldPassToParent) { this.props.onCommit(e); }
    this.setState({ isEditing: false, buffer: "" });
  }

  focus = () => {
    const { value } = this.props;
    this.setState({ isEditing: true, buffer: "" + (value || "") });
  }

  updateBuffer = (e: React.SyntheticEvent<HTMLInputElement>) => {
    const buffer = e.currentTarget.value;
    this.setState({ buffer });
  }

  usualProps = () => {
    const value = this.state.isEditing ?
      this.state.buffer : this.props.value;
    return {
      value: value,
      hidden: !!this.props.hidden,
      onFocus: this.focus,
      onChange: this.updateBuffer,
      onSubmit: this.maybeCommit,
      onBlur: this.maybeCommit,
      name: this.props.name,
      id: this.props.id,
      type: this.props.type || "text",
      disabled: this.props.disabled,
      className: this.props.className,
      placeholder: this.props.placeholder,
    };
  }

  shouldComponentUpdate(nextProps: BIProps, nextState: Partial<BIState>) {
    return !equals(this.props, nextProps) || !equals(this.state, nextState);
  }

  render() {
    return <input {...this.usualProps() } />;
  }
}
