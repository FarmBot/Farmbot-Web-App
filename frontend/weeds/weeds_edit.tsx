import React from "react";
import { connect } from "react-redux";
import {
  DesignerPanel, DesignerPanelHeader, DesignerPanelContent,
} from "../farm_designer/designer_panel";
import { t } from "../i18next_wrapper";
import { push } from "../history";
import { Everything } from "../interfaces";
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

export interface EditWeedProps {
  dispatch: Function;
  findPoint(id: number): TaggedWeedPointer | undefined;
  botOnline: boolean;
}

export const mapStateToProps = (props: Everything): EditWeedProps => ({
  dispatch: props.dispatch,
  findPoint: id => maybeFindWeedPointerById(props.resources.index, id),
  botOnline: isBotOnlineFromState(props.bot),
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
    const weedsPath = Path.weeds();
    !this.weed && Path.startsWith(weedsPath) && push(weedsPath);
    return <DesignerPanel panelName={this.panelName} panel={Panel.Weeds}>
      <DesignerPanelHeader
        panelName={this.panelName}
        panel={Panel.Weeds}
        title={t("Edit weed")}
        specialStatus={this.weed?.specialStatus}
        onSave={() => this.weed?.uuid &&
          this.props.dispatch(save(this.weed.uuid))}
        backTo={weedsPath}
        onBack={() => {
          this.props.dispatch({
            type: Actions.TOGGLE_HOVERED_POINT, payload: undefined
          });
          this.props.dispatch(selectPoint(undefined));
        }} />
      <DesignerPanelContent panelName={this.panelName}>
        {this.weed
          ? <div className={"weed-panel-content-wrapper"}>
            <EditPointProperties point={this.weed}
              botOnline={this.props.botOnline}
              updatePoint={updatePoint(this.weed, this.props.dispatch)} />
            <AdditionalWeedProperties point={this.weed}
              updatePoint={updatePoint(this.weed, this.props.dispatch)} />
            <PointActions uuid={this.weed.uuid} dispatch={this.props.dispatch} />
          </div>
          : <span>{t("Redirecting")}...</span>}
      </DesignerPanelContent>
    </DesignerPanel>;
  }
}

export const EditWeed = connect(mapStateToProps)(RawEditWeed);
