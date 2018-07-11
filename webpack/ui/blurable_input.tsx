import * as React from "react";
import { equals } from "../util";
import { isNumber } from "lodash";
import { error } from "farmbot-toastr";
import { t } from "i18next";

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
}

interface BIState {
  buffer: string;
  isEditing: boolean;
}

export class BlurableInput extends React.Component<BIProps, Partial<BIState>> {

  state: BIState = { buffer: "", isEditing: false };

  withinLimits = (): boolean => {
    if (this.props.type === "number") {
      const value = parseInt(this.state.buffer);
      if (isNumber(this.props.min) && value < this.props.min) {
        error(t("Value must be greater than or equal to {{min}}.",
          { min: this.props.min }));
        return false;
      }
      if (isNumber(this.props.max) && value > this.props.max) {
        error(t("Value must be less than or equal to {{max}}.",
          { max: this.props.max }));
        return false;
      }
    }
    return true;
  }

  /** Called on blur. */
  maybeCommit = (e: React.SyntheticEvent<HTMLInputElement>) => {
    const bufferOk = this.state.buffer || this.props.allowEmpty;
    const shouldPassToParent = bufferOk && this.withinLimits();
    shouldPassToParent && this.props.onCommit(e);
    this.setState({ isEditing: false, buffer: "" });
  }

  focus = () => {
    const { value } = this.props;
    this.setState({ isEditing: true, buffer: "" + (value || "") });
  }

  updateBuffer = (e: React.SyntheticEvent<HTMLInputElement>) => {
    this.setState({ buffer: e.currentTarget.value });
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
      className: this.props.className,
      placeholder: this.props.placeholder,
    };
  }

  shouldComponentUpdate(nextProps: BIProps, nextState: Partial<BIState>) {
    return !equals(this.props, nextProps) || !equals(this.state, nextState);
  }

  render() {
    return <input {...this.usualProps()} />;
  }
}
