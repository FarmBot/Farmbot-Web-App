import React from "react";
import { connect } from "react-redux";
import {
  DesignerPanel, DesignerPanelHeader, DesignerPanelContent,
} from "../farm_designer/designer_panel";
import { t } from "../i18next_wrapper";
import { useNavigate } from "react-router";
import { Panel } from "../farm_designer/panel_header";
import { Everything, MovementState, ResourceColor } from "../interfaces";
import { TaggedGenericPointer } from "farmbot";
import { maybeFindGenericPointerById } from "../resources/selectors";
import { Actions } from "../constants";
import { EditPointProperties, updatePoint } from "./point_edit_actions";
import { isBotOnlineFromState } from "../devices/must_be_online";
import { destroy, save } from "../api/crud";
import { Path } from "../internal_urls";
import { ColorPickerCluster, Popover } from "../ui";
import { ResourceTitle } from "../sequences/panel/editor";
import { BotPosition } from "../devices/interfaces";
import { getWebAppConfigValue } from "../config_storage/actions";
import { validBotLocationData } from "../util/location";
import { validGoButtonAxes } from "../farm_designer/move_to";
import { Position } from "@blueprintjs/core";

export interface EditPointProps {
  dispatch: Function;
  findPoint(id: number): TaggedGenericPointer | undefined;
  botOnline: boolean;
  defaultAxes: string;
  arduinoBusy: boolean;
  currentBotLocation: BotPosition;
  movementState: MovementState;
}

export const mapStateToProps = (props: Everything): EditPointProps => ({
  dispatch: props.dispatch,
  findPoint: id => maybeFindGenericPointerById(props.resources.index, id),
  botOnline: isBotOnlineFromState(props.bot),
  defaultAxes: validGoButtonAxes(getWebAppConfigValue(() => props)),
  arduinoBusy: props.bot.hardware.informational_settings.busy,
  currentBotLocation: validBotLocationData(props.bot.hardware.location_data)
    .position,
  movementState: props.app.movement,
});

export const RawEditPoint = (props: EditPointProps) => {
  const getPoint = () => {
    const stringyID = Path.getSlug(Path.points());
    if (stringyID) {
      return props.findPoint(parseInt(stringyID));
    }
  };
  const point = getPoint();
  const panelName = "point-info";

  const { dispatch } = props;
  const pointsPath = Path.points();
  const navigate = useNavigate();
  !point && Path.startsWith(pointsPath) && navigate(pointsPath);
  const pointColor = point?.body.meta.color || "green";
  return <DesignerPanel panelName={panelName} panel={Panel.Points}>
    <DesignerPanelHeader
      panelName={panelName}
      panel={Panel.Points}
      colorClass={pointColor}
      titleElement={<ResourceTitle
        key={point?.body.name}
        resource={point}
        save={true}
        fallback={t("Edit weed")}
        dispatch={dispatch} />}
      specialStatus={point?.specialStatus}
      onSave={() => point?.uuid &&
        dispatch(save(point.uuid))}
      backTo={pointsPath}
      onBack={() => dispatch({
        type: Actions.TOGGLE_HOVERED_POINT, payload: undefined
      })}>
      <div className={"panel-header-icon-group"}>
        <Popover className={"color-picker"}
          position={Position.BOTTOM}
          popoverClassName={"colorpicker-menu gray"}
          target={<i title={t("select color")}
            className={"fa fa-paint-brush fb-icon-button"} />}
          content={<ColorPickerCluster
            onChange={color =>
              updatePoint(point, dispatch)({ meta: { color } })}
            current={pointColor as ResourceColor} />} />
        {point &&
          <i title={t("delete")}
            className={"fa fa-trash fb-icon-button"}
            onClick={() => dispatch(destroy(point.uuid))} />}
      </div>
    </DesignerPanelHeader>
    <DesignerPanelContent panelName={panelName}>
      {point
        ? <EditPointProperties point={point}
          botOnline={props.botOnline}
          dispatch={props.dispatch}
          arduinoBusy={props.arduinoBusy}
          currentBotLocation={props.currentBotLocation}
          movementState={props.movementState}
          defaultAxes={props.defaultAxes}
          updatePoint={updatePoint(point, dispatch)} />
        : <span>{t("Redirecting")}...</span>}
    </DesignerPanelContent>
  </DesignerPanel>;
};

export const EditPoint = connect(mapStateToProps)(RawEditPoint);
// eslint-disable-next-line import/no-default-export
export default EditPoint;
