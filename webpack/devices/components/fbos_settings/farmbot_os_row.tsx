import * as React from "react";
import { Row, Col, Markdown } from "../../../ui/index";
import { t } from "i18next";
import { OsUpdateButton } from "./os_update_button";
import { Popover, Position } from "@blueprintjs/core";
import { ColWidth } from "../farmbot_os_settings";
import { ToggleButton } from "../../../controls/toggle_button";
import { updateConfig } from "../../actions";
import { last } from "lodash";
import { Content } from "../../../constants";
import { FbosDetailsProps, FarmbotOsRowProps } from "./interfaces";

export function FbosDetails(props: FbosDetailsProps) {
  const { dispatch, sourceFbosConfig } = props;
  const {
    env, commit, target, node_name, firmware_version, firmware_commit
  } = props.bot.hardware.informational_settings;
  const betaOptIn = sourceFbosConfig("beta_opt_in");
  const shortenCommit = (longCommit: string) => (longCommit || "").slice(0, 8);
  return <div>
    <p><b>Environment: </b>{env}</p>
    <p><b>Commit: </b>{shortenCommit(commit)}</p>
    <p><b>Target: </b>{target}</p>
    <p><b>Node name: </b>{last(node_name.split("@"))}</p>
    <p><b>Firmware: </b>{firmware_version}</p>
    <p><b>Firmware commit: </b>{shortenCommit(firmware_commit)}</p>
    <fieldset>
      <label style={{ marginTop: "0.75rem" }}>
        {t("Beta release Opt-In")}
      </label>
      <ToggleButton
        toggleValue={betaOptIn.value}
        dim={!betaOptIn.consistent}
        toggleAction={() =>
          (betaOptIn.value || confirm(Content.OS_BETA_RELEASES)) &&
          dispatch(updateConfig({ beta_opt_in: !betaOptIn.value }))} />
    </fieldset>
  </div>;
}

export function FarmbotOsRow(props: FarmbotOsRowProps) {
  const { sourceFbosConfig, dispatch, bot, osReleaseNotes, botOnline } = props;
  const { controller_version } = bot.hardware.informational_settings;
  const version = controller_version || t(" unknown (offline)");
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
        <FbosDetails
          bot={bot}
          dispatch={dispatch}
          sourceFbosConfig={sourceFbosConfig} />
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
            {osReleaseNotes}
          </Markdown>
        </div>
      </Popover>
    </Col>
    <Col xs={3}>
      <OsUpdateButton
        bot={bot}
        sourceFbosConfig={sourceFbosConfig}
        botOnline={botOnline} />
    </Col>
  </Row >;
}
