import * as React from "react";
import { Row, Col, Markdown } from "../../ui/index";
import { OsUpdateButton } from "./os_update_button";
import { Popover, Position } from "@blueprintjs/core";
import { FarmbotOsRowProps } from "./interfaces";
import { FbosDetails } from "./fbos_details";
import { t } from "../../i18next_wrapper";
import { ErrorBoundary } from "../../error_boundary";
import { Highlight } from "../maybe_highlight";
import { DeviceSetting } from "../../constants";
import { getLastSeenNumber } from "./last_seen_row";

export const getOsReleaseNotesForVersion = (
  osReleaseNotes: string | undefined,
  version: string | undefined,
) => {
  const fallback = globalConfig.FBOS_END_OF_LIFE_VERSION || "10";
  const majorVersion = (version || fallback).split(".")[0];
  const allReleaseNotes = osReleaseNotes || "";
  const notesByVersion = allReleaseNotes.split("# v");
  const fallbackNotes = notesByVersion.filter(x => x.startsWith("10"))[0];
  const thisReleaseNotes = notesByVersion
    .filter(x => x.startsWith(majorVersion))[0] || fallbackNotes || "";
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
    return <Highlight settingName={DeviceSetting.farmbotOS}>
      <Row>
        <Col xs={5}>
          <label>
            {t(DeviceSetting.farmbotOS)}
          </label>
        </Col>
        <Col xs={7}>
          <OsUpdateButton
            bot={bot}
            sourceFbosConfig={sourceFbosConfig}
            shouldDisplay={this.props.shouldDisplay}
            botOnline={botOnline} />
        </Col>
      </Row>
      <Row>
        <Col xs={7} className="no-pad"><this.Version /></Col>
        <Col xs={5} className="no-pad"><this.ReleaseNotes /></Col>
      </Row>
    </Highlight>;
  }
}
