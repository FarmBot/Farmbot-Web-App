import * as React from "react";
import { connect } from "react-redux";
import {
  DesignerPanel, DesignerPanelHeader, DesignerPanelContent
} from "./designer_panel";
import { t } from "../../i18next_wrapper";
import { history, getPathArray } from "../../history";
import { Everything } from "../../interfaces";
import { TaggedPoint, Vector3 } from "farmbot";
import { maybeFindPointById } from "../../resources/selectors";
import { DeleteButton } from "../../controls/pin_form_fields";
import { getDevice } from "../../device";

export const moveToPoint =
  (body: Vector3) => () => getDevice().moveAbsolute(body);

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

  temporaryMenu = (p: TaggedPoint) => {
    const { body } = p;
    return <div>
      <h3>
        Point {body.name || body.id || ""} @ ({body.x}, {body.y}, {body.z})
      </h3>
      <ul>
        {
          Object.entries(body.meta).map(([k, v]) => {
            return <li>{k}: {v}</li>;
          })
        }
      </ul>
      <button
        className="green fb-button"
        type="button"
        onClick={moveToPoint(body)}>
        {t("Move Device to Point")}
      </button>
      <DeleteButton
        dispatch={this.props.dispatch}
        uuid={p.uuid}
        onDestroy={this.fallback}>
        {t("Delete Point")}
      </DeleteButton>
    </div>;
  };

  default = (point: TaggedPoint) => {
    return <DesignerPanel panelName={"plant-info"} panelColor={"green"}>
      <DesignerPanelHeader
        panelName={"plant-info"}
        panelColor={"gray"}
        title={`${t("Edit")} ${point.body.name}`}
        backTo={"/app/designer/points"}>
      </DesignerPanelHeader>
      <DesignerPanelContent panelName={"plants"}>
        {this.point && this.temporaryMenu(this.point)}
      </DesignerPanelContent>
    </DesignerPanel>;
  }

  render() {
    return this.point ? this.default(this.point) : this.fallback();
  }
}
