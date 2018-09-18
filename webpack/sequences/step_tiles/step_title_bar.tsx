import * as React from "react";
import { SequenceBodyItem as Step, SequenceBodyItem } from "farmbot";
import { t } from "i18next";
import { StepTitleBarProps } from "../interfaces";
import { BlurableInput } from "../../ui/index";
import { updateStepTitle } from "./index";

function translate(input: Step): string {
  // We load translations async. If I put this const outside of the function,
  // i18next might not have the correct translation loaded. To get around this,
  // I had to put the translations in the function.
  const TRANSLATIONS: Record<SequenceBodyItem["kind"], string> = {
    "_if": t("If Statement"),
    "execute_script": t("Run Farmware"),
    "execute": t("Execute Sequence"),
    "find_home": t("Find Home"),
    "move_absolute": t("Move Absolute"),
    "move_relative": t("Move Relative"),
    "read_pin": t("Read Pin"),
    "send_message": t("Send Message"),
    "take_photo": t("Take a Photo"),
    "resource_update": t("Mark As"),
    "wait": t("Wait"),
    "write_pin": t("Write Pin")
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
