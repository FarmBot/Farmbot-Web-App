import React from "react";
import { Row, Col, Markdown, Popover } from "../../ui";
import { fetchOsUpdateVersion, OsUpdateButton } from "./os_update_button";
import { Position } from "@blueprintjs/core";
import { FarmbotOsRowProps, FarmbotOsRowState } from "./interfaces";
import { FbosDetails } from "./fbos_details";
import { t } from "../../i18next_wrapper";
import { ErrorBoundary } from "../../error_boundary";
import { Highlight } from "../maybe_highlight";
import { DeviceSetting } from "../../constants";
import { removeToast } from "../../toast/toast";

export const getOsReleaseNotesForVersion = (
  osReleaseNotes: string | undefined,
  version: string | undefined,
) => {
  const lastKnownNoteV = "11";
  const fallbackV = globalConfig.FBOS_END_OF_LIFE_VERSION || lastKnownNoteV;
  const majorVersion = (version || fallbackV).split(".")[0];
  const stripVersion = (n: string) => n.split("\n\n").slice(1).join("\n");
  const notesByV = (osReleaseNotes || "").split("# v");
  const allNotes = notesByV.filter(n => stripVersion(n).replace(/\s/g, ""));
  const getNote = (v: string) => allNotes.filter(x => x.startsWith(v))[0];
  const latestNote = allNotes[allNotes.length - 1] || "";
  const latestNoteMajorV = latestNote.split("\n")[0];
  const fallbackNotes = parseInt(latestNoteMajorV) > parseInt(majorVersion)
    ? getNote(lastKnownNoteV)
    : latestNote;
  const releaseNotes = getNote(majorVersion) || fallbackNotes || "";
  const notes = stripVersion(releaseNotes) || t("Could not get release notes.");
  const heading = "FarmBot OS v" + majorVersion;
  return { heading, notes };
};

export class FarmbotOsRow
  extends React.Component<FarmbotOsRowProps, FarmbotOsRowState> {
  state: FarmbotOsRowState = {
    version: this.props.bot.hardware.informational_settings.controller_version,
    channel: "" + this.props.sourceFbosConfig("update_channel").value,
  };

  componentDidMount = () => {
    const { dispatch } = this.props;
    const { target } = this.props.bot.hardware.informational_settings;
    dispatch(fetchOsUpdateVersion(target));
  };

  componentDidUpdate = () => {
    const { dispatch, bot, sourceFbosConfig } = this.props;
    const { controller_version, target } = bot.hardware.informational_settings;
    const channel = "" + sourceFbosConfig("update_channel").value;
    const versionChange =
      controller_version && this.state.version != controller_version;
    const channelChange = channel && this.state.channel != channel;
    if (versionChange || channelChange) {
      this.setState({ version: controller_version, channel });
      dispatch(fetchOsUpdateVersion(target));
    }
    if (versionChange) {
      removeToast("EOL");
    }
  };

  Version = () => {
    const { controller_version } = this.props.bot.hardware.informational_settings;
    const version = controller_version || t("unknown (offline)");
    return <Popover position={Position.BOTTOM_LEFT}
      target={<p>
        {t("Version {{ version }}", { version })}
      </p>}
      content={<ErrorBoundary>
        <FbosDetails
          dispatch={this.props.dispatch}
          sourceFbosConfig={this.props.sourceFbosConfig}
          bot={this.props.bot}
          timeSettings={this.props.timeSettings}
          deviceAccount={this.props.device} />
      </ErrorBoundary>} />;
  };

  ReleaseNotes = () => {
    const { osReleaseNotes, hardware } = this.props.bot;
    const { controller_version } = hardware.informational_settings;
    const { fbos_version } = this.props.device.body;
    const version = controller_version || fbos_version;
    const releaseNotes = getOsReleaseNotesForVersion(osReleaseNotes, version);
    return <div className="release-notes">
      <h1>{releaseNotes.heading}</h1>
      <Markdown>
        {releaseNotes.notes}
      </Markdown>
    </div>;
  };

  render() {
    return <Highlight settingName={DeviceSetting.farmbotOS}
      hidden={!this.props.showAdvanced}
      className={"advanced"}>
      <Row>
        <Col xs={5}>
          <label>
            {t(DeviceSetting.farmbotOS)}
          </label>
        </Col>
        <Col xs={7}>
          <OsUpdateButton
            bot={this.props.bot}
            dispatch={this.props.dispatch}
            botOnline={this.props.botOnline} />
        </Col>
      </Row>
      <Row>
        <Col xs={7} className="no-pad"><this.Version /></Col>
        <Col xs={5} className="no-pad">
          <Popover position={Position.BOTTOM} className="release-notes-wrapper"
            target={<p className="release-notes-button">
              {t("Release Notes")}&nbsp;
              <i className="fa fa-caret-down" />
            </p>}
            content={<this.ReleaseNotes />} />
        </Col>
      </Row>
    </Highlight>;
  }
}
