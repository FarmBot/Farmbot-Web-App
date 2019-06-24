import * as React from "react";
import { equals, parseIntInput } from "../util";
import { isNumber } from "lodash";

import { InputError } from "./input_error";
import { t } from "../i18next_wrapper";
import { error } from "../toast/toast";

export interface BIProps {
  value: string | number;
  onCommit(e: React.SyntheticEvent<HTMLInputElement>): void;
  min?: number;
  max?: number;
  type?:
  | "text"
  | "number"
  | "email"
  | "time"
  | "date"
  | "hidden";
  name?: string;
  id?: string;
  /** Allow the user to empty out the form control. If unset, form control
   * will reset itself to previous defaultValue. */
  allowEmpty?: boolean;
  disabled?: boolean;
  className?: string;
  placeholder?: string;
  hidden?: boolean;
  error?: string;
  title?: string;
  autoFocus?: boolean;
}

interface BIState {
  buffer: string;
  isEditing: boolean;
  error: string | undefined;
}

export class BlurableInput extends React.Component<BIProps, Partial<BIState>> {

  state: BIState = { buffer: "", isEditing: false, error: undefined };

  get error() { return this.props.error || this.state.error; }

  withinLimits = (options?: { toasts?: boolean }): boolean => {
    const onError = (msg: string) => {
      this.setState({ error: msg });
      options && options.toasts && error(msg);
    };

    if (this.props.type === "number") {
      const value = parseIntInput(this.state.buffer);
      if (isNumber(this.props.min) && value < this.props.min) {
        onError(t("Value must be greater than or equal to {{min}}.",
          { min: this.props.min }));
        return false;
      }
      if (isNumber(this.props.max) && value > this.props.max) {
        onError(t("Value must be less than or equal to {{max}}.",
          { max: this.props.max }));
        return false;
      }
      /** `e.currentTarget.value` is "" for any invalid number input. */
      if ((this.state.buffer === "") && !this.props.allowEmpty) {
        onError(t("Please enter a number."));
        return false;
      }
    }
    this.setState({ error: undefined });
    return true;
  }

  /** Called on blur. */
  maybeCommit = (e: React.SyntheticEvent<HTMLInputElement>) => {
    const bufferOk = this.state.buffer || this.props.allowEmpty;
    const shouldPassToParent = bufferOk && this.withinLimits({ toasts: true });
    shouldPassToParent && this.props.onCommit(e);
    this.setState({ isEditing: false, buffer: "", error: undefined });
  }

  focus = () => {
    const { value } = this.props;
    this.setState({
      isEditing: true,
      buffer: "" + (value || ""),
      error: undefined
    });
  }

  updateBuffer = (e: React.SyntheticEvent<HTMLInputElement>) => {
    this.setState({ buffer: e.currentTarget.value }, this.withinLimits);
  }

  usualProps = () => {
    const value = this.state.isEditing ?
      this.state.buffer : this.props.value;
    return {
      value,
      hidden: !!this.props.hidden,
      onFocus: this.focus,
      onChange: this.updateBuffer,
      onSubmit: this.maybeCommit,
      onBlur: this.maybeCommit,
      name: this.props.name,
      id: this.props.id,
      min: this.props.min,
      max: this.props.max,
      type: this.props.type || "text",
      disabled: this.props.disabled,
      className: (this.props.className || "") + (this.error ? " error" : ""),
      title: this.props.title || "",
      placeholder: this.props.placeholder,
      autoFocus: this.props.autoFocus,
    };
  }

  shouldComponentUpdate(nextProps: BIProps, nextState: Partial<BIState>) {
    return !equals(this.props, nextProps) || !equals(this.state, nextState);
  }

  render() {
    return <div className="input">
      <InputError error={this.error} />
      <input {...this.usualProps()} />
    </div>;
  }
}
