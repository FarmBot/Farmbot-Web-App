import * as React from "react";
import { TaggedGenericPointer } from "farmbot";
import { Saucer } from "../../ui";
import { push } from "../../history";

export interface PointInventoryItemProps {
  tpp: TaggedGenericPointer;
  dispatch: Function;
}

// The individual points that show up in the farm designer sub nav.
export class PointInventoryItem extends
  React.Component<PointInventoryItemProps, {}> {

  render() {
    const point = this.props.tpp.body;
    const pointId = (point.id || "ERR_NO_POINT_ID").toString();

    const click = () => {
      push(`/app/designer/points/${pointId}`);
    };

    const label = point.name || "Unknown point";

    return <div
      className={`point-search-item`}
      key={pointId}
      onClick={click}>
      <Saucer color={point.meta.color || "green"} />
      <span className="point-search-item-name">
        {label}
      </span>
      <p className="point-search-item-info">
        {`(${point.x}, ${point.y}) ⌀${point.radius * 2}`}
      </p>
    </div>;
  }
}
