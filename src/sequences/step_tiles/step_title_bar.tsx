import * as React from "react";
import { SequenceBodyItem as Step, Dictionary } from "farmbot";
import { addComment } from "../actions";
import { t } from "i18next";
import { CowardlyDictionary } from "../../util";

function translate(input: Step): string {
  // We load translations async. If I put this const outside of the function,
  // i18next might not have the correct translation loaded. To get around this,
  // I had to put the translations in the function.
  const TRANSLATIONS: CowardlyDictionary<string> = {
    "move_absolute": t("Move Absolute"),
    "move_relative": t("Move Relative"),
    "write_pin": t("Write Pin"),
    "read_pin": t("Read Pin"),
    "wait": t("Wait"),
    "send_message": t("Send Message"),
    "_if": t("If Statement"),
    "execute": t("Execute Sequence"),
    "execute_script": t("Run Farmware"),
    "take_photo": t("Take a Photo"),
    "find_home": t("Find Home")
  };

  return TRANSLATIONS[input.kind] || input.kind;

}

interface StepTitleBarProps {
  step: Step;
  index: number;
  dispatch: Function;
}

export class StepTitleBar extends React.Component<StepTitleBarProps, {}> {

  onChange(e: React.FormEvent<HTMLInputElement>) {
    let target = e.currentTarget;
    let { step, index, dispatch } = this.props;
    dispatch(addComment(step, index, target.value));
  }

  render() {
    return <input className="step-label"
      value={this.props.step.comment || ""}
      placeholder={translate(this.props.step)}
      onChange={this.onChange.bind(this)} />;
  };
};
