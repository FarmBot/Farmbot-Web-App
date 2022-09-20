import React from "react";
import { t } from "../../../i18next_wrapper";
import { isUndefined, round } from "lodash";
import { Actions } from "../../../constants";
import { getPanelStatus } from "../util";
import { HandleProps, ProfileViewerProps } from "./interfaces";
import { ProfileSvg } from "./content";
import { ProfileOptions } from "./options";

/** View a profile of the points in the selected map region. */
export const ProfileViewer = (props: ProfileViewerProps) => {
  const { dispatch } = props;
  const {
    profileOpen, profilePosition, profileWidth, profileFollowBot,
  } = props.designer;
  const axis = props.designer.profileAxis;
  const panelStatus = getPanelStatus();
  const className = [
    "profile-viewer",
    profileOpen ? "open" : "",
    `panel-${panelStatus}`,
  ].join(" ");
  const { x, y } = profileFollowBot ? props.botPosition : profilePosition;
  const axisLabel = `${t("{{ axis }}-axis profile", {
    axis: axis == "x" ? "y" : "x"
  })}`;
  const coordinateLabel = `${axis} = ${round((axis == "x" ? x : y) || 0)}`;
  const [expanded, setExpanded] = React.useState(true);
  return <div className={className}>
    <Handle isOpen={profileOpen} dispatch={dispatch} setExpanded={setExpanded} />
    <div className={"profile-content"}>
      {(isUndefined(x) || isUndefined(y))
        ? <p className={"no-profile"}>
          {profileFollowBot
            ? t("FarmBot position unknown.")
            : t("Click any location in the map to choose a profile.")}
        </p>
        : <div className={"title-and-svg"}>
          <label>
            {`${axisLabel} (${coordinateLabel})`}
          </label>
          <p className={"left-label"}>Z</p>
          <ProfileSvg allPoints={props.allPoints}
            axis={axis}
            position={{ x, y }}
            selectionWidth={profileWidth}
            expanded={expanded}
            botPosition={props.botPosition}
            negativeZ={props.negativeZ}
            sourceFbosConfig={props.sourceFbosConfig}
            mountedToolInfo={props.mountedToolInfo}
            tools={props.tools}
            farmwareEnvs={props.farmwareEnvs}
            getConfigValue={props.getConfigValue}
            mapTransformProps={props.mapTransformProps}
            botSize={props.botSize} />
          <p className={"right-label"}>Z</p>
        </div>}
      <ProfileOptions
        dispatch={dispatch}
        axis={axis}
        selectionWidth={profileWidth}
        followBot={profileFollowBot}
        expanded={expanded}
        setExpanded={setExpanded} />
    </div>
  </div>;
};

/** Profile viewer open/close button. */
const Handle = ({ isOpen, dispatch, setExpanded }: HandleProps) =>
  <div className={"profile-button"}
    title={isOpen ? t("close profile viewer") : t("open profile viewer")}
    onClick={() => {
      isOpen && setExpanded(false);
      !isOpen && setExpanded(true);
      dispatch({ type: Actions.SET_PROFILE_OPEN, payload: !isOpen });
    }}>
    <i className={"fa fa-area-chart"} />
  </div>;
