import * as React from "react";
import { SequenceBodyItem as Step, SequenceBodyItem } from "farmbot";
import { StepTitleBarProps } from "../interfaces";
import { BlurableInput } from "../../ui/index";
import { updateStepTitle } from "./index";
import { t } from "../../i18next_wrapper";

function translate(input: Step): string {
  // We load translations async. If I put this const outside of the function,
  // i18next might not have the correct translation loaded. To get around this,
  // I had to put the translations in the function.
  const TRANSLATIONS: Partial<Record<SequenceBodyItem["kind"], string>> = {
    "_if": t("If ..."),
    "execute_script": t("Run Farmware"),
    "execute": t("Execute Sequence"),
    "find_home": t("Find Home"),
    "move_absolute": t("Move To"),
    "move_relative": t("Move Relative"),
    "read_pin": t("Read Sensor"),
    "send_message": t("Send Message"),
    "take_photo": t("Take a Photo"),
    "resource_update": t("Mark As"),
    "assertion": t("Assertion"),
    "set_servo_angle": t("Control Servo"),
    "wait": t("Wait"),
    "write_pin": t("Control Peripheral"),
    "sync": t("Sync"),
    "dump_info": t("Diagnostic Report"),
    "power_off": t("Shutdown"),
    "read_status": t("Read status"),
    "emergency_unlock": t("UNLOCK"),
    "emergency_lock": t("E-STOP"),
    "install_first_party_farmware": t("Install first-party Farmware"),
    "install_farmware": t("Install Farmware"),
    "remove_farmware": t("Remove Farmware"),
    "update_farmware": t("Update Farmware"),
    "check_updates": t("Update"),
    "calibrate": t("Calibrate"),
    "home": t("Move to Home"),
    "factory_reset": t("Factory reset"),
    "reboot": t("Reboot"),
    "toggle_pin": t("Toggle Peripheral"),
    "zero": t("Set zero"),
    "set_user_env": t("Set Farmware Env"),
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
