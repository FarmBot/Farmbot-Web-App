import * as React from "react";
import { Row, Col, Markdown } from "../../../ui/index";
import { OsUpdateButton } from "./os_update_button";
import { Popover, Position } from "@blueprintjs/core";
import { ColWidth } from "../farmbot_os_settings";
import { FarmbotOsRowProps } from "./interfaces";
import { FbosDetails } from "./fbos_details";
import { t } from "../../../i18next_wrapper";
import { ErrorBoundary } from "../../../error_boundary";
import { Highlight } from "../maybe_highlight";
import { DeviceSetting } from "../../../constants";
import { DevSettings } from "../../../account/dev/dev_support";
import { getLastSeenNumber } from "./last_seen_row";

export const getOsReleaseNotesForVersion = (
  osReleaseNotes: string | undefined,
  version: string | undefined,
) => {
  const fallback = globalConfig.FBOS_END_OF_LIFE_VERSION || "9";
  const majorVersion = (version || fallback).split(".")[0];
  const allReleaseNotes = osReleaseNotes || "";
  const thisReleaseNotes = allReleaseNotes.split("# v")
    .filter(x => x.startsWith(majorVersion))[0] || "";
  const notes = thisReleaseNotes.split("\n\n").slice(1).join("\n")
    || t("Could not get release notes.");
  const heading = "FarmBot OS v" + majorVersion;
  return { heading, notes };
};

const getVersionString =
  (fbosVersion: string | undefined, onBeta: boolean | undefined): string => {
    const needsExtension = fbosVersion && !fbosVersion.includes("-") && onBeta;
    const extension = needsExtension ? "-beta" : "";
    return fbosVersion ? fbosVersion + extension : t(" unknown (offline)");
  };

export class FarmbotOsRow extends React.Component<FarmbotOsRowProps> {

  Version = () => {
    const { controller_version, currently_on_beta } =
      this.props.bot.hardware.informational_settings;
    const version = getVersionString(controller_version, currently_on_beta);
    return <Popover position={Position.BOTTOM_LEFT}>
      <p>
        {t("Version {{ version }}", { version })}
      </p>
      <ErrorBoundary>
        <FbosDetails
          botInfoSettings={this.props.bot.hardware.informational_settings}
          dispatch={this.props.dispatch}
          shouldDisplay={this.props.shouldDisplay}
          sourceFbosConfig={this.props.sourceFbosConfig}
          botToMqttLastSeen={getLastSeenNumber(this.props.bot)}
          timeSettings={this.props.timeSettings}
          deviceAccount={this.props.deviceAccount} />
      </ErrorBoundary>
    </Popover>;
  }

  ReleaseNotes = () => {
    const { osReleaseNotes, hardware } = this.props.bot;
    const { controller_version } = hardware.informational_settings;
    const releaseNotes =
      getOsReleaseNotesForVersion(osReleaseNotes, controller_version);
    return <Popover position={Position.BOTTOM} className="release-notes-wrapper">
      <p className="release-notes-button">
        {t("Release Notes")}&nbsp;
          <i className="fa fa-caret-down" />
      </p>
      <div className="release-notes">
        <h1>{releaseNotes.heading}</h1>
        <Markdown>
          {releaseNotes.notes}
        </Markdown>
      </div>
    </Popover>;
  }

  render() {
    const { sourceFbosConfig, bot, botOnline } = this.props;
    const newFormat = DevSettings.futureFeature1Enabled();
    return <Highlight settingName={DeviceSetting.farmbotOS}>
      <Row>
        <Col xs={newFormat ? 5 : ColWidth.label}>
          <label>
            {t(DeviceSetting.farmbotOS)}
          </label>
        </Col>
        {!newFormat && <Col xs={3}><this.Version /></Col>}
        {!newFormat && <Col xs={3}><this.ReleaseNotes /></Col>}
        <Col xs={newFormat ? 7 : 3}>
          <OsUpdateButton
            bot={bot}
            sourceFbosConfig={sourceFbosConfig}
            shouldDisplay={this.props.shouldDisplay}
            botOnline={botOnline} />
        </Col>
      </Row>
      <Row>
        {newFormat && <Col xs={7} className="no-pad"><this.Version /></Col>}
        {newFormat && <Col xs={5} className="no-pad"><this.ReleaseNotes /></Col>}
      </Row>
    </Highlight>;
  }
}
