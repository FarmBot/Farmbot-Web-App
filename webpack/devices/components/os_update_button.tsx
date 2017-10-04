import * as React from "react";
import { BotProp } from "../interfaces";
import { t } from "i18next";
import { ToggleButton } from "../../controls/toggle_button";
import { checkControllerUpdates, updateConfig } from "../actions";
import { isUndefined, noop } from "lodash";
import { semverCompare, SemverResult } from "../../util";
import * as _ from "lodash";
import { Row, Col } from "../../ui/index";
import { JobProgress, Configuration } from "farmbot/dist";

export let OsUpdateButton = ({ bot }: BotProp) => {
  const osUpdateBool = bot.hardware.configuration.os_auto_update;
  let buttonStr = "Can't Connect to bot";
  let buttonColor = "yellow";
  const { currentOSVersion } = bot;
  const { controller_version } = bot.hardware.informational_settings;
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
  const toggleVal = isUndefined(osUpdateBool) ? "undefined" : ("" + osUpdateBool);

  // DONT TOUCH THIS!!! SERIOUSLY -- RC 8 August
  // DO NOT REMOVE `|| {}` UNTIL SEPTEMBER.
  const osUpdateJob = (bot.hardware.jobs || {})["FBOS_OTA"];

  const isWorking = (job: JobProgress | undefined) => job && (job.status == "working");

  function downloadProgress(job: JobProgress | undefined) {
    if (job && isWorking(job)) {
      switch (job.unit) {
        case ("bytes"):
          const kiloBytes = Math.round(job.bytes / 1024);
          const megaBytes = Math.round(job.bytes / 1048576);
          if (kiloBytes < 1) {
            return job.bytes + "B";
          } else if (megaBytes < 1) {
            return kiloBytes + "kB";
          } else {
            return megaBytes + "MB";
          }
        case ("percent"):
          return job.percent + "%";
      }
    }
  }

  return <div className="updates">
    <Row>
      <Col xs={4}>
        <p>{t("Auto Updates?")}</p>
      </Col>
      <Col xs={3}>
        <ToggleButton toggleValue={toggleVal}
          toggleAction={() => {
            const os_auto_update: Configuration = {
              os_auto_update: !osUpdateBool ? 1 : 0
            };
            updateConfig(os_auto_update)(noop);
          }} />
      </Col>
      <Col xs={5}>
        <button
          className={"fb-button " + buttonColor}
          disabled={isWorking(osUpdateJob)}
          onClick={() => checkControllerUpdates()}>
          {downloadProgress(osUpdateJob) || buttonStr}
        </button>
      </Col>
    </Row>
  </div>;
};
