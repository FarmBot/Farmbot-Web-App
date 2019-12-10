import * as React from "react";
import { connect } from "react-redux";
import {
  DesignerPanel, DesignerPanelHeader, DesignerPanelContent
} from "../designer_panel";
import { t } from "../../i18next_wrapper";
import { history, getPathArray } from "../../history";
import { Everything } from "../../interfaces";
import { TaggedGenericPointer } from "farmbot";
import { maybeFindPointById } from "../../resources/selectors";
import { Panel } from "../panel_header";
import {
  EditPointProperties, PointActions, updatePoint
} from "./point_edit_actions";
import { Actions } from "../../constants";

export interface EditWeedProps {
  dispatch: Function;
  findPoint(id: number): TaggedGenericPointer | undefined;
}

export const mapStateToProps = (props: Everything): EditWeedProps => ({
  dispatch: props.dispatch,
  findPoint: id => maybeFindPointById(props.resources.index, id),
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

  fallback = () => {
    history.push(this.backTo);
    return <span>{t("Redirecting...")}</span>;
  }

  default = (point: TaggedGenericPointer) => {
    const { x, y, z } = point.body;
    return <DesignerPanel panelName={this.panelName} panel={Panel.Weeds}>
      <DesignerPanelHeader
        panelName={this.panelName}
        panel={Panel.Weeds}
        title={t("Edit weed")}
        backTo={this.backTo}
        onBack={() => this.props.dispatch({
          type: Actions.TOGGLE_HOVERED_POINT, payload: undefined
        })}>
      </DesignerPanelHeader>
      <DesignerPanelContent panelName={this.panelName}>
        <EditPointProperties point={point}
          updatePoint={updatePoint(point, this.props.dispatch)} />
        <PointActions x={x} y={y} z={z} uuid={point.uuid}
          dispatch={this.props.dispatch} />
      </DesignerPanelContent>
    </DesignerPanel>;
  }

  render() {
    return this.point ? this.default(this.point) : this.fallback();
  }
}

export const EditWeed = connect(mapStateToProps)(RawEditWeed);
