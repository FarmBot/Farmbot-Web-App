import * as React from "react";
import { SequenceBodyItem as Step } from "farmbot";
import { t } from "i18next";
import { CowardlyDictionary } from "../../util";
import { StepTitleBarProps } from "../interfaces";
import { BlurableInput } from "../../ui/index";
import { updateStepTitle } from "./index";

function translate(input: Step): string {
  // We load translations async. If I put this const outside of the function,
  // i18next might not have the correct translation loaded. To get around this,
  // I had to put the translations in the function.
  const TRANSLATIONS: CowardlyDictionary<string> = {
    "move_absolute": t("Move Absolute"),
    "move_relative": t("Move Relative"),
    "write_pin": t("Write Pin"),
    "read_pin": t("Read Pin"),
    "read_peripheral": t("Read Pin"),
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

export class StepTitleBar extends React.Component<StepTitleBarProps, {}> {
  render() {
    return <BlurableInput className="step-label"
      value={this.props.step.comment || ""}
      placeholder={translate(this.props.step)}
      onCommit={updateStepTitle(this.props)}
      allowEmpty={true} />;
  }
}
