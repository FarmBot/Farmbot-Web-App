import * as React from "react";
import { DEFAULT_ICON, svgToUrl } from "../../open_farm/icons";
import { TaggedPlant } from "../map/interfaces";
import { cachedCrop } from "../../open_farm/cached_crop";
import { toggleHoveredPlant } from "../actions";
import { TaggedPointGroup } from "farmbot";
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

  render() {
    const plant = this.props.plant.body;
    const { plant: tpp, dispatch } = this.props;
    const plantId = (plant.id || "ERR_NO_PLANT_ID").toString();

    const enter = () => dispatch(toggleHoveredPlant(tpp.uuid, this.state.icon));
    const leave = () => dispatch(toggleHoveredPlant(undefined, ""));

    const click = () => {
      dispatch(removePoint(this.props.group, this.props.plant.body.id || 0));
    };

    // See `cachedIcon` for more details on this.
    const maybeGetCachedIcon = (e: IMGEvent) => {
      const ofs = tpp.body.openfarm_slug;
      const img = e.currentTarget;
      ofs && cachedCrop(ofs)
        .then((crop) => {
          const i = svgToUrl(crop.svg_icon);
          i !== img.getAttribute("src") && img.setAttribute("src", i);
          this.setState({ icon: i });
        });
    };

    return <span
      key={plantId}
      onMouseEnter={enter}
      onMouseLeave={leave}
      onClick={click}>
      <img
        src={DEFAULT_ICON}
        onLoad={maybeGetCachedIcon}
        width={32}
        height={32} />
    </span>;
  }
}
