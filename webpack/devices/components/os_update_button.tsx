import * as React from "react";
import { BotProp } from "../interfaces";
import { t } from "i18next";
import { ToggleButton } from "../../controls/toggle_button";
import { checkControllerUpdates, updateConfig } from "../actions";
import { isUndefined, noop } from "lodash";
import { semverCompare, SemverResult } from "../../util";
import * as _ from "lodash";
import { Row, Col } from "../../ui/index";

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
  let downloadProgress = "";
  let disabled = false;
  // DONT TOUCH THIS!!! SERIOUSLY -- RC 8 August
  // DO NOT REMOVE `|| {}` UNTIL SEPTEMBER.
  let job = (bot.hardware.jobs || {})["FBOS_OTA"];
  if (job) {
    if (job.status == "working") {
      disabled = true;
      if (job.unit == "bytes") {
        let kiloBytes = Math.round(job.bytes / 1024);
        let megaBytes = Math.round(job.bytes / 1048576);
        if (kiloBytes < 1) {
          downloadProgress = job.bytes + "B";
        } else if (megaBytes < 1) {
          downloadProgress = kiloBytes + "kB";
        } else {
          downloadProgress = megaBytes + "MB";
        }
      } else if (job.unit == "percent") {
        downloadProgress = job.percent + "%";
      }
    } else {
      disabled = false;
    }
  }
  return <div className="updates">
    <Row>
      <Col xs={4}>
        <p>{t("Auto Updates?")}</p>
      </Col>
      <Col xs={1}>
        <ToggleButton toggleValue={toggleVal}
          toggleAction={() => {
            let os_auto_update = !osUpdateBool ? 1 : 0;
            updateConfig({ os_auto_update })(noop);
          }} />
      </Col>
      <Col xs={7}>
        <button
          className={"fb-button " + buttonColor}
          disabled={disabled}
          onClick={() => checkControllerUpdates()}>
          {downloadProgress || buttonStr}
        </button>
      </Col>
    </Row>
  </div>;
};
