import * as React from "react";
import { TaggedGenericPointer } from "farmbot";
import { Saucer } from "../../ui";
import { Actions } from "../../constants";
import { push } from "../../history";

export interface PointInventoryItemProps {
  tpp: TaggedGenericPointer;
  dispatch: Function;
  hovered: boolean;
  navName: "points" | "weeds";
}

// The individual points that show up in the farm designer sub nav.
export class PointInventoryItem extends
  React.Component<PointInventoryItemProps, {}> {

  render() {
    const point = this.props.tpp.body;
    const { tpp, dispatch } = this.props;
    const pointId = (point.id || "ERR_NO_POINT_ID").toString();

    const toggle = (action: "enter" | "leave") => {
      const isEnter = action === "enter";
      dispatch({
        type: Actions.TOGGLE_HOVERED_POINT,
        payload: isEnter ? tpp.uuid : undefined
      });
    };

    const click = () => {
      push(`/app/designer/${this.props.navName}/${pointId}`);
      dispatch({ type: Actions.TOGGLE_HOVERED_POINT, payload: [tpp.uuid] });
    };

    // Name given from OpenFarm's API.
    const label = point.name || "Unknown plant";

    return <div
      className={`point-search-item ${this.props.hovered ? "hovered" : ""}`}
      key={pointId}
      onMouseEnter={() => toggle("enter")}
      onMouseLeave={() => toggle("leave")}
      onClick={click}>
      <Saucer color={point.meta.color || "green"} />
      <span className="point-search-item-name">
        {label}
      </span>
      <p className="point-search-item-info">
        <i>{`(${point.x}, ${point.y}) ⌀${point.radius * 2}`}</i>
      </p>
    </div>;
  }
}
