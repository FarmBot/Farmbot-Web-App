import * as React from "react";
import { connect } from "react-redux";
import {
  DesignerPanel, DesignerPanelHeader, DesignerPanelContent
} from "./designer_panel";
import { t } from "../../i18next_wrapper";
import { history, getPathArray } from "../../history";
import { Everything } from "../../interfaces";
import { TaggedPoint } from "farmbot";
import { maybeFindPointById } from "../../resources/selectors";
import { Panel } from "../panel_header";

export interface EditWeedProps {
  dispatch: Function;
  findPoint(id: number): TaggedPoint | undefined;
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

  fallback = () => {
    history.push("/app/designer/weeds");
    return <span>{t("Redirecting...")}</span>;
  }

  default = (point: TaggedPoint) => {
    return <DesignerPanel panelName={"weed-info"} panel={Panel.Weeds}>
      <DesignerPanelHeader
        panelName={"weed-info"}
        panel={Panel.Weeds}
        title={`${t("Edit")} ${point.body.name}`}
        backTo={"/app/designer/points"}>
      </DesignerPanelHeader>
      <DesignerPanelContent panelName={"weed-info"}>
      </DesignerPanelContent>
    </DesignerPanel>;
  }

  render() {
    return this.point ? this.default(this.point) : this.fallback();
  }
}

export const EditWeed = connect(mapStateToProps)(RawEditWeed);
