import React from "react";
import { Row, Col, Markdown } from "../../ui/index";
import { fetchReleasesFromAPI, OsUpdateButton } from "./os_update_button";
import { Popover, Position } from "@blueprintjs/core";
import { FarmbotOsRowProps, FarmbotOsRowState } from "./interfaces";
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

export class FarmbotOsRow
  extends React.Component<FarmbotOsRowProps, FarmbotOsRowState> {
  state: FarmbotOsRowState = {
    version: this.props.bot.hardware.informational_settings.controller_version,
  };

  componentDidMount = () => {
    const { dispatch, shouldDisplay, bot } = this.props;
    const { target } = bot.hardware.informational_settings;
    dispatch(fetchReleasesFromAPI(target, shouldDisplay));
  }

  componentDidUpdate = () => {
    const { dispatch, shouldDisplay, bot } = this.props;
    const { controller_version, target } = bot.hardware.informational_settings;
    if (controller_version && this.state.version != controller_version) {
      this.setState({ version: controller_version });
      dispatch(fetchReleasesFromAPI(target, shouldDisplay));
    }
  };

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
    const { fbos_version } = this.props.deviceAccount.body;
    const version = controller_version || fbos_version;
    const releaseNotes = getOsReleaseNotesForVersion(osReleaseNotes, version);
    return <div className="release-notes">
      <h1>{releaseNotes.heading}</h1>
      <Markdown>
        {releaseNotes.notes}
      </Markdown>
    </div>;
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
            dispatch={this.props.dispatch}
            botOnline={botOnline} />
        </Col>
      </Row>
      <Row>
        <Col xs={7} className="no-pad"><this.Version /></Col>
        <Col xs={5} className="no-pad">
          <Popover position={Position.BOTTOM} className="release-notes-wrapper">
            <p className="release-notes-button">
              {t("Release Notes")}&nbsp;
              <i className="fa fa-caret-down" />
            </p>
            <this.ReleaseNotes />
          </Popover>
        </Col>
      </Row>
    </Highlight>;
  }
}
