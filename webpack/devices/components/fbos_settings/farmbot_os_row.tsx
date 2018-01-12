import * as React from "react";
import { Row, Col, Markdown } from "../../../ui/index";
import { t } from "i18next";
import { OsUpdateButton } from "./os_update_button";
import { BotState } from "../../interfaces";
import { Popover, Position } from "@blueprintjs/core";
import { ColWidth } from "../farmbot_os_settings";
import { ToggleButton } from "../../../controls/toggle_button";
import { updateConfig } from "../../actions";
import { noop } from "lodash";
import { Content } from "../../../constants";

interface FarmbotOsRowProps {
  controller_version: string | undefined;
  bot: BotState;
  osReleaseNotes: string;
}

export function FbosDetails(bot: BotState) {
  const {
     env, commit, target, node_name, firmware_version, firmware_commit
  } = bot.hardware.informational_settings;
  const { beta_opt_in } = bot.hardware.configuration;
  return <div>
    <p><b>Environment: </b>{env}</p>
    <p><b>Commit: </b>{commit}</p>
    <p><b>Target: </b>{target}</p>
    <p><b>Node name: </b>{node_name}</p>
    <p><b>Firmware: </b>{firmware_version}</p>
    <p><b>Firmware commit: </b>{firmware_commit}</p>
    <fieldset>
      <label>
        {t("Opt-In to FarmBot OS Beta releases")}
      </label>
      <ToggleButton
        toggleValue={beta_opt_in}
        toggleAction={() =>
          (beta_opt_in || confirm(Content.OS_BETA_RELEASES)) &&
          updateConfig({ beta_opt_in: !beta_opt_in })(noop)} />
    </fieldset>
  </div>;
}

export function FarmbotOsRow(props: FarmbotOsRowProps) {
  const version = props.controller_version || t(" unknown (offline)");
  return <Row>
    <Col xs={ColWidth.label}>
      <label>
        {t("FARMBOT OS")}
      </label>
    </Col>
    <Col xs={3}>
      <Popover position={Position.TOP_LEFT}>
        <p>
          {t("Version {{ version }}", { version })}
        </p>
        <FbosDetails {...props.bot} />
      </Popover>
    </Col>
    <Col xs={3}>
      <Popover position={Position.BOTTOM}>
        <p className="release-notes-button">
          {t("Release Notes")}&nbsp;
          <i className="fa fa-caret-down" />
        </p>
        <div className="release-notes">
          <Markdown>
            {props.osReleaseNotes}
          </Markdown>
        </div>
      </Popover>
    </Col>
    <Col xs={3}>
      <OsUpdateButton bot={props.bot} />
    </Col>
  </Row >;
}
