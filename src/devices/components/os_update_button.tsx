import * as React from "react";
import { BotProp } from "../interfaces";
import { t } from "i18next";
import { ToggleButton } from "../../controls/toggle_button";
import { checkControllerUpdates, updateConfig } from "../actions";
import { isUndefined, noop } from "lodash";
import { semverCompare, SemverResult } from "../../util";

export let OsUpdateButton = ({ bot }: BotProp) => {
  let osUpdateBool = bot.hardware.configuration.os_auto_update;
  let buttonStr = "Can't Connect to bot";
  let buttonColor = "yellow";
  let { currentOSVersion } = bot;
  let { controller_version } = bot.hardware.informational_settings;
  if (_.isString(currentOSVersion) && _.isString(controller_version)) {
    switch (semverCompare(currentOSVersion, controller_version)) {
      case SemverResult.RIGHT_IS_GREATER:
      case SemverResult.EQUAL:
        buttonStr = t("UP TO DATE");
        buttonColor = "gray";
        break;
      default:
        buttonStr = t("UPDATE");
        buttonColor = "green";
    }
  } else {
    buttonStr = "Can't Connect to release server";
  }
  let toggleVal = isUndefined(osUpdateBool) ? "undefined" : ("" + osUpdateBool);
  return <div className="updates">
    <p>
      {t("Auto Updates?")}
    </p>
    <ToggleButton toggleval={toggleVal}
      toggleAction={() => {
        let os_auto_update = !osUpdateBool ? 1 : 0;
        // TODO: This no longer needs to be a thunk
        //       since it does not change redux state.
        updateConfig({ os_auto_update })(noop);
      }} />
    <button
      className={"fb-button " + buttonColor}
      onClick={() => checkControllerUpdates()}
    >
      {buttonStr}
    </button>
  </div>;
};
