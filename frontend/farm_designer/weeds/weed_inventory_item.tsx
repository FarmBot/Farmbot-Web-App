import * as React from "react";
import { TaggedWeedPointer } from "farmbot";
import { Actions } from "../../constants";
import { push } from "../../history";
import { t } from "../../i18next_wrapper";
import { DEFAULT_WEED_ICON } from "../map/layers/weeds/garden_weed";
import { svgToUrl } from "../../open_farm/icons";
import { genericWeedIcon } from "../point_groups/point_group_item";
import { getMode } from "../map/util";
import { Mode } from "../map/interfaces";
import { mapPointClickAction } from "../map/actions";

export interface WeedInventoryItemProps {
  tpp: TaggedWeedPointer;
  dispatch: Function;
  hovered: boolean;
}

export class WeedInventoryItem extends
  React.Component<WeedInventoryItemProps, {}> {

  render() {
    const weed = this.props.tpp.body;
    const { tpp, dispatch } = this.props;
    const weedId = (weed.id || "ERR_NO_POINT_ID").toString();

    const toggle = (action: "enter" | "leave") => {
      const isEnter = action === "enter";
      dispatch({
        type: Actions.TOGGLE_HOVERED_POINT,
        payload: isEnter ? tpp.uuid : undefined
      });
    };

    const click = () => {
      if (getMode() == Mode.boxSelect) {
        mapPointClickAction(dispatch, tpp.uuid)();
        toggle("leave");
      } else {
        push(`/app/designer/weeds/${weedId}`);
        dispatch({ type: Actions.TOGGLE_HOVERED_POINT, payload: [tpp.uuid] });
      }
    };

    return <div
      className={`weed-search-item ${this.props.hovered ? "hovered" : ""}`}
      key={weedId}
      onMouseEnter={() => toggle("enter")}
      onMouseLeave={() => toggle("leave")}
      onClick={click}>
      <span className={"weed-item-icon"}>
        <img className={"weed-icon"}
          src={DEFAULT_WEED_ICON}
          width={32}
          height={32} />
        <img
          src={svgToUrl(genericWeedIcon(weed.meta.color))}
          width={32}
          height={32} />
      </span>
      <span className="weed-search-item-name">
        {weed.name || t("Untitled weed")}
      </span>
      <p className="weed-search-item-info">
        <i>{`(${weed.x}, ${weed.y}) ⌀${weed.radius * 2}`}</i>
      </p>
    </div>;
  }
}
