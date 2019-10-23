import * as React from "react";
import { DEFAULT_ICON, svgToUrl } from "../../open_farm/icons";
import { TaggedPlant } from "../map/interfaces";
import { cachedCrop } from "../../open_farm/cached_crop";
import { toggleHoveredPlant } from "../actions";
import { TaggedPointGroup, uuid } from "farmbot";
import { overwrite } from "../../api/crud";

type IMGEvent = React.SyntheticEvent<HTMLImageElement>;

export interface PointGroupItemProps {
  plant: TaggedPlant;
  group: TaggedPointGroup;
  dispatch: Function;
  hovered: boolean;
}

interface PointGroupItemState { icon: string; }

const removePoint = (group: TaggedPointGroup, pointId: number) => {
  type Body = (typeof group)["body"];
  const nextGroup: Body = { ...group.body };
  nextGroup.point_ids = nextGroup.point_ids.filter(x => x !== pointId);
  return overwrite(group, nextGroup);
};

// The individual plants in the point group detail page.
export class PointGroupItem extends React.Component<PointGroupItemProps, PointGroupItemState> {

  state: PointGroupItemState = { icon: "" };

  key = uuid();

  enter = () => this
    .props
    .dispatch(toggleHoveredPlant(this.props.plant.uuid, this.state.icon));

  leave = () => this
    .props
    .dispatch(toggleHoveredPlant(undefined, ""));

  click = () => this
    .props
    .dispatch(removePoint(this.props.group, this.props.plant.body.id || 0));

  maybeGetCachedIcon = ({ currentTarget }: IMGEvent) => {
    return cachedCrop(this.props.plant.body.openfarm_slug).then((crop) => {
      const i = svgToUrl(crop.svg_icon);
      if (i !== currentTarget.getAttribute("src")) {
        currentTarget.setAttribute("src", i);
      }
      this.setState({ icon: i });
    });
  };

  render() {
    return <span
      key={this.key}
      onMouseEnter={this.enter}
      onMouseLeave={this.leave}
      onClick={this.click}>
      <img
        src={DEFAULT_ICON}
        onLoad={this.maybeGetCachedIcon}
        width={32}
        height={32} />
    </span>;
  }
}
