import React from "react";
import { SequenceBodyItem, LegalSequenceKind } from "farmbot";
import { StepTitleBarProps } from "../interfaces";
import { BlurableInput } from "../../ui";
import { updateStepTitle } from "./index";
import { t } from "../../i18next_wrapper";
import { FarmwareName } from "./tile_execute_script";

const STEP_TITLES =
  (): Partial<Record<SequenceBodyItem["kind"], string>> => ({
    _if: t("If ..."),
    execute_script: t("Run Farmware"),
    execute: t("Execute Sequence"),
    find_home: t("Find Home"),
    move: t("Move"),
    move_absolute: t("Move To"),
    move_relative: t("Move Relative"),
    read_pin: t("Read Sensor"),
    send_message: t("Send Message"),
    take_photo: t("Take a Photo"),
    update_resource: t("Mark As"),
    ["resource_update" as LegalSequenceKind]: t("Deprecated Mark As"),
    assertion: t("Assertion"),
    lua: t("Lua"),
    set_servo_angle: t("Control Servo"),
    wait: t("Wait"),
    write_pin: t("Control Peripheral"),
    sync: t("Sync"),
    power_off: t("Shutdown"),
    read_status: t("Read status"),
    emergency_unlock: t("UNLOCK"),
    emergency_lock: t("E-STOP"),
    install_first_party_farmware: t("Install first-party Farmware"),
    install_farmware: t("Install Farmware"),
    remove_farmware: t("Remove Farmware"),
    update_farmware: t("Update Farmware"),
    check_updates: t("Update"),
    calibrate: t("Find axis length"),
    home: t("Move to Home"),
    factory_reset: t("Factory reset"),
    reboot: t("Reboot"),
    toggle_pin: t("Toggle Peripheral"),
    zero: t("Set home"),
    set_user_env: t("Set Farmware Env"),
  });

export class StepTitleBar extends React.Component<StepTitleBarProps, {}> {
  render() {
    const { step, pinnedSequenceName } = this.props;
    const { kind } = step;
    const title = step.kind == "execute_script"
      && step.args.label == FarmwareName.MeasureSoilHeight
      && t("MEASURE SOIL HEIGHT");
    return <div className={"step-comment"}
      style={this.props.readOnly ? { pointerEvents: "none" } : {}}
      onMouseEnter={this.props.toggleDraggable("enter")}
      onMouseLeave={this.props.toggleDraggable("leave")}>
      <BlurableInput className="step-label"
        value={this.props.step.comment || ""}
        placeholder={title || pinnedSequenceName || STEP_TITLES()[kind] || kind}
        onCommit={updateStepTitle(this.props)}
        allowEmpty={true} />
    </div>;
  }
}
