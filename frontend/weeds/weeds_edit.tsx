import React from "react";
import { connect } from "react-redux";
import {
  DesignerPanel, DesignerPanelHeader, DesignerPanelContent,
} from "../farm_designer/designer_panel";
import { t } from "../i18next_wrapper";
import { push } from "../history";
import { Everything, MovementState, ResourceColor } from "../interfaces";
import { TaggedWeedPointer } from "farmbot";
import { maybeFindWeedPointerById } from "../resources/selectors";
import { Panel } from "../farm_designer/panel_header";
import {
  EditPointProperties, PointActions, updatePoint, AdditionalWeedProperties,
} from "../points/point_edit_actions";
import { Actions } from "../constants";
import { selectPoint } from "../farm_designer/map/actions";
import { isBotOnlineFromState } from "../devices/must_be_online";
import { save } from "../api/crud";
import { Path } from "../internal_urls";
import { ResourceTitle } from "../sequences/panel/editor";
import { ColorPicker } from "../ui";
import { getWebAppConfigValue } from "../config_storage/actions";
import { BotPosition } from "../devices/interfaces";
import { validBotLocationData } from "../util/location";
import { validGoButtonAxes } from "../farm_designer/move_to";

export interface EditWeedProps {
  dispatch: Function;
  findPoint(id: number): TaggedWeedPointer | undefined;
  botOnline: boolean;
  defaultAxes: string;
  arduinoBusy: boolean;
  currentBotLocation: BotPosition;
  movementState: MovementState;
}

export const mapStateToProps = (props: Everything): EditWeedProps => ({
  dispatch: props.dispatch,
  findPoint: id => maybeFindWeedPointerById(props.resources.index, id),
  botOnline: isBotOnlineFromState(props.bot),
  defaultAxes: validGoButtonAxes(getWebAppConfigValue(() => props)),
  arduinoBusy: props.bot.hardware.informational_settings.busy,
  currentBotLocation: validBotLocationData(props.bot.hardware.location_data)
    .position,
  movementState: props.app.movement,
});

export class RawEditWeed extends React.Component<EditWeedProps, {}> {
  get stringyID() { return Path.getSlug(Path.weeds()); }
  get weed() {
    if (this.stringyID) {
      return this.props.findPoint(parseInt(this.stringyID));
    }
  }
  get panelName() { return "weed-info"; }

  render() {
    const { dispatch } = this.props;
    const weedsPath = Path.weeds();
    !this.weed && Path.startsWith(weedsPath) && push(weedsPath);
    return <DesignerPanel panelName={this.panelName} panel={Panel.Weeds}>
      <DesignerPanelHeader
        panelName={this.panelName}
        panel={Panel.Weeds}
        colorClass={this.weed?.body.meta.color}
        titleElement={<ResourceTitle
          key={this.weed?.body.name}
          resource={this.weed}
          fallback={t("Edit weed")}
          dispatch={dispatch} />}
        specialStatus={this.weed?.specialStatus}
        onSave={() => this.weed?.uuid &&
          dispatch(save(this.weed.uuid))}
        backTo={weedsPath}
        onBack={() => {
          dispatch({ type: Actions.TOGGLE_HOVERED_POINT, payload: undefined });
          dispatch(selectPoint(undefined));
        }}>
        <ColorPicker
          current={(this.weed?.body.meta.color || "green") as ResourceColor}
          targetElement={<i title={t("select color")}
            className={"icon-saucer fa fa-paint-brush"} />}
          onChange={color =>
            updatePoint(this.weed, dispatch)({ meta: { color } })} />
      </DesignerPanelHeader>
      <DesignerPanelContent panelName={this.panelName}>
        {this.weed
          ? <div className={"weed-panel-content-wrapper"}>
            <EditPointProperties point={this.weed}
              botOnline={this.props.botOnline}
              dispatch={this.props.dispatch}
              arduinoBusy={this.props.arduinoBusy}
              currentBotLocation={this.props.currentBotLocation}
              movementState={this.props.movementState}
              defaultAxes={this.props.defaultAxes}
              updatePoint={updatePoint(this.weed, dispatch)} />
            <AdditionalWeedProperties point={this.weed}
              updatePoint={updatePoint(this.weed, dispatch)} />
            <PointActions uuid={this.weed.uuid} dispatch={dispatch} />
          </div>
          : <span>{t("Redirecting")}...</span>}
      </DesignerPanelContent>
    </DesignerPanel>;
  }
}

export const EditWeed = connect(mapStateToProps)(RawEditWeed);
