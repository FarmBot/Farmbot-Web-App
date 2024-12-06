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
  const { profileOpen, profileFollowBot } = props.designer;
  const axis = props.designer.profileAxis;
  const panelStatus = getPanelStatus(props.designer);
  const { x, y } = profileFollowBot
    ? props.botLocationData.position
    : props.designer.profilePosition;
  const noProfile = isUndefined(x) || isUndefined(y)
    || (!profileOpen && profileFollowBot);
  const className = [
    "profile-viewer",
    profileOpen ? "open" : "",
    `panel-${panelStatus}`,
    noProfile ? "none-chosen" : "",
  ].join(" ");
  const axisLabel = `${t("{{ axis }}-axis profile", {
    axis: axis == "x" ? "y" : "x"
  })}`;
  const coordinateLabel = `${axis} = ${round((axis == "x" ? x : y) || 0)}`;
  const [expanded, setExpanded] = React.useState(true);
  return <div className={className}>
    <Handle isOpen={profileOpen} dispatch={dispatch} setExpanded={setExpanded} />
    <div className={"profile-content"}>
      {noProfile
        ? <p className={"no-profile"}>
          {profileFollowBot
            ? t("FarmBot position unknown.")
            : t("Click any location in the map to choose a profile.")}
        </p>
        : <div className={"title-and-svg"}>
          <label>
            {`${axisLabel} (${coordinateLabel})`}
          </label>
          {expanded && <p className={"left-label"}>Z</p>}
          <ProfileSvg allPoints={props.allPoints}
            designer={props.designer}
            position={{ x, y }}
            expanded={expanded}
            botLocationData={props.botLocationData}
            peripheralValues={props.peripheralValues}
            negativeZ={props.negativeZ}
            sourceFbosConfig={props.sourceFbosConfig}
            mountedToolInfo={props.mountedToolInfo}
            tools={props.tools}
            farmwareEnvs={props.farmwareEnvs}
            getConfigValue={props.getConfigValue}
            mapTransformProps={props.mapTransformProps}
            botSize={props.botSize} />
          {expanded && <p className={"right-label"}>Z</p>}
        </div>}
      <ProfileOptions
        dispatch={dispatch}
        designer={props.designer}
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
