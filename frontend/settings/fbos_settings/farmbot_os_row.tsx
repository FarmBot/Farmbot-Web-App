import React from "react";
import { Row, Markdown, Popover } from "../../ui";
import { fetchOsUpdateVersion, OsUpdateButton } from "./os_update_button";
import { Position } from "@blueprintjs/core";
import { FarmbotOsRowProps } from "./interfaces";
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

export const FarmbotOsRow = (props: FarmbotOsRowProps) => {
  const [version, setVersion] = React.useState(
    props.bot.hardware.informational_settings.controller_version);
  const [channel, setChannel] = React.useState(
    "" + props.sourceFbosConfig("update_channel").value);

  const { dispatch, bot, sourceFbosConfig } = props;
  const { controller_version, target } = bot.hardware.informational_settings;
  const configChannel = "" + sourceFbosConfig("update_channel").value;

  React.useEffect(() => {
    const { dispatch } = props;
    const { target } = props.bot.hardware.informational_settings;
    dispatch(fetchOsUpdateVersion(target));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  React.useEffect(() => {
    const versionChange = controller_version && version != controller_version;
    const channelChange = configChannel && channel != configChannel;
    if (versionChange || channelChange) {
      setVersion(controller_version);
      setChannel(configChannel);
      dispatch(fetchOsUpdateVersion(target));
    }
    if (versionChange) {
      removeToast("EOL");
    }
  }, [dispatch, controller_version, target, configChannel, version, channel]);

  const releaseNotes = getOsReleaseNotesForVersion(
    props.bot.osReleaseNotes,
    version || props.device.body.fbos_version);

  return <Highlight settingName={DeviceSetting.farmbotOS}
    hidden={!props.showAdvanced}
    className={"advanced"}>
    <div className="grid half-gap farmbot-os-setting">
      <Row className="grid-exp-1">
        <label>
          {t(DeviceSetting.farmbotOS)}
        </label>
        <OsUpdateButton
          bot={props.bot}
          dispatch={props.dispatch}
          botOnline={props.botOnline} />
      </Row>
      <Row className="grid-2-col">
        <Popover position={Position.BOTTOM_LEFT}
          target={<p>
            {t("Version {{ version }}",
              { version: version || t("unknown (offline)") })}
          </p>}
          content={<ErrorBoundary>
            <FbosDetails
              dispatch={props.dispatch}
              sourceFbosConfig={props.sourceFbosConfig}
              bot={props.bot}
              timeSettings={props.timeSettings}
              deviceAccount={props.device} />
          </ErrorBoundary>} />
        <Popover position={Position.BOTTOM} className="release-notes-wrapper"
          target={<p className="release-notes-button">
            {t("Release Notes")}&nbsp;
            <i className="fa fa-caret-down" />
          </p>}
          content={<div className="release-notes">
            <h1>{releaseNotes.heading}</h1>
            <Markdown>
              {releaseNotes.notes}
            </Markdown>
          </div>} />
      </Row>
    </div>
  </Highlight>;
};
