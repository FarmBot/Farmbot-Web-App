import * as React from "react";
import { connect } from "react-redux";
import {
  DesignerPanel, DesignerPanelHeader, DesignerPanelContent,
} from "../designer_panel";
import { t } from "../../i18next_wrapper";
import { history, getPathArray } from "../../history";
import { Everything } from "../../interfaces";
import { TaggedWeedPointer } from "farmbot";
import { maybeFindWeedPointerById } from "../../resources/selectors";
import { Panel } from "../panel_header";
import {
  EditPointProperties, PointActions, updatePoint,
} from "../points/point_edit_actions";
import { Actions } from "../../constants";

export interface EditWeedProps {
  dispatch: Function;
  findPoint(id: number): TaggedWeedPointer | undefined;
}

export const mapStateToProps = (props: Everything): EditWeedProps => ({
  dispatch: props.dispatch,
  findPoint: id => maybeFindWeedPointerById(props.resources.index, id),
});

export class RawEditWeed extends React.Component<EditWeedProps, {}> {
  get stringyID() { return getPathArray()[4] || ""; }
  get point() {
    if (this.stringyID) {
      return this.props.findPoint(parseInt(this.stringyID));
    }
  }
  get panelName() { return "weed-info"; }
  get backTo() { return "/app/designer/weeds"; }

  render() {
    !this.point && history.push(this.backTo);
    return <DesignerPanel panelName={this.panelName} panel={Panel.Weeds}>
      <DesignerPanelHeader
        panelName={this.panelName}
        panel={Panel.Weeds}
        title={t("Edit weed")}
        backTo={this.backTo}
        onBack={() => this.props.dispatch({
          type: Actions.TOGGLE_HOVERED_POINT, payload: undefined
        })} />
      <DesignerPanelContent panelName={this.panelName}>
        {this.point
          ? <div className={"weed-panel-content-wrapper"}>
            <EditPointProperties point={this.point}
              updatePoint={updatePoint(this.point, this.props.dispatch)} />
            <PointActions
              x={this.point.body.x}
              y={this.point.body.y}
              z={this.point.body.z}
              uuid={this.point.uuid}
              dispatch={this.props.dispatch} />
          </div>
          : <span>{t("Redirecting")}...</span>}
      </DesignerPanelContent>
    </DesignerPanel>;
  }
}

export const EditWeed = connect(mapStateToProps)(RawEditWeed);
