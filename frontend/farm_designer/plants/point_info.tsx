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

export interface EditPointProps {
  dispatch: Function;
  findPoint(id: number): TaggedPoint | undefined;
}

export const mapStateToProps = (props: Everything): EditPointProps => ({
  dispatch: props.dispatch,
  findPoint: id => maybeFindPointById(props.resources.index, id),
});

@connect(mapStateToProps)
export class EditPoint extends React.Component<EditPointProps, {}> {
  get stringyID() { return getPathArray()[4] || ""; }
  get point() {
    if (this.stringyID) {
      return this.props.findPoint(parseInt(this.stringyID));
    }
  }

  fallback = () => {
    history.push("/app/designer/points");
    return <span>{t("Redirecting...")}</span>;
  }

  default = (point: TaggedPoint) => {
    return <DesignerPanel panelName={"plant-info"} panelColor={"green"}>
      <DesignerPanelHeader
        panelName={"plant-info"}
        panelColor={"gray"}
        title={`${t("Edit")} ${point.body.name}`}
        backTo={"/app/designer/points"}>
      </DesignerPanelHeader>
      <DesignerPanelContent panelName={"plants"}>
      </DesignerPanelContent>
    </DesignerPanel>;
  }

  render() {
    return this.point ? this.default(this.point) : this.fallback();
  }
}
