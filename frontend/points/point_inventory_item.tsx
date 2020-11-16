import React from "react";
import { TaggedGenericPointer } from "farmbot";
import { Actions } from "../constants";
import { push } from "../history";
import { t } from "../i18next_wrapper";
import { getMode } from "../farm_designer/map/util";
import { Mode } from "../farm_designer/map/interfaces";
import { mapPointClickAction } from "../farm_designer/map/actions";
import { DevSettings } from "../settings/dev/dev_support";
import { destroy } from "../api/crud";

export interface PointInventoryItemProps {
  tpp: TaggedGenericPointer;
  dispatch: Function;
  hovered: boolean;
  colorOverride?: string;
}

// The individual points that show up in the farm designer sub nav.
export class PointInventoryItem extends
  React.Component<PointInventoryItemProps, {}> {

  render() {
    const point = this.props.tpp.body;
    const color = point.meta.color || "green";
    const { tpp, dispatch, hovered, colorOverride } = this.props;
    const pointId = (point.id || "ERR_NO_POINT_ID").toString();

    const toggle = (action: "enter" | "leave") => {
      const isEnter = action === "enter";
      dispatch({
        type: Actions.TOGGLE_HOVERED_POINT,
        payload: isEnter ? tpp.uuid : undefined
      });
    };

    const click = () => {
      if (DevSettings.quickDeleteEnabled()) {
        dispatch(destroy(tpp.uuid, true));
        return;
      }
      if (getMode() == Mode.boxSelect) {
        mapPointClickAction(dispatch, tpp.uuid)();
        toggle("leave");
      } else {
        push(`/app/designer/points/${pointId}`);
        dispatch({ type: Actions.TOGGLE_HOVERED_POINT, payload: [tpp.uuid] });
      }
    };

    return <div
      className={`point-search-item ${hovered ? "hovered" : ""}`}
      key={pointId}
      onMouseEnter={() => toggle("enter")}
      onMouseLeave={() => toggle("leave")}
      onClick={click}>
      {DevSettings.quickDeleteEnabled()
        ? <div className={`quick-delete ${hovered ? "hovered" : ""}`}>X</div>
        : <div className={`saucer ${colorOverride ? `soil-${color}` : color}`}
          style={colorOverride ? { background: colorOverride } : {}} />}
      <span className="point-search-item-name">
        {point.name || t("Untitled point")}
      </span>
      <p className="point-search-item-info">
        <i>{colorOverride
          ? `(${point.x}, ${point.y}) z${point.z}`
          : `(${point.x}, ${point.y}) r${point.radius}`}</i>
      </p>
    </div>;
  }
}
