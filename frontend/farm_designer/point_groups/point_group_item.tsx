import * as React from "react";
import { DEFAULT_ICON, svgToUrl } from "../../open_farm/icons";
import { maybeGetCachedPlantIcon } from "../../open_farm/cached_crop";
import { setHoveredPlant } from "../map/actions";
import { TaggedPointGroup, uuid, TaggedPoint } from "farmbot";
import { overwrite } from "../../api/crud";
import { error } from "../../toast/toast";
import { t } from "../../i18next_wrapper";
import { DEFAULT_WEED_ICON } from "../map/layers/weeds/garden_weed";

export interface PointGroupItemProps {
  point: TaggedPoint;
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

export const genericPointIcon = (color: string | undefined) =>
  `<svg xmlns='http://www.w3.org/2000/svg'
    fill='none' stroke-width='1.5' stroke='${color || "green"}'>
    <circle cx='15' cy='15' r='12' />
    <circle cx='15' cy='15' r='2' />
  </svg>`;

export const genericWeedIcon = (color: string | undefined) =>
  `<svg xmlns='http://www.w3.org/2000/svg'>
      <defs>
        <radialGradient id='WeedGradient'>
          <stop offset='90%' stop-color='${color || "red"}'
            stop-opacity='0.25'></stop>
          <stop offset='100%' stop-color='${color || "red"}'
            stop-opacity='0'></stop>
        </radialGradient>
      </defs>
      <circle id='weed-radius' cx='15' cy='15' r='14'
        fill='url(#WeedGradient)' opacity='0.5'></circle>
    </svg>`;

export const OTHER_POINT_ICON =
  `<svg xmlns='http://www.w3.org/2000/svg' fill='gray'>
    <circle cx='15' cy='15' r='12' />
    </svg>`;

// The individual plants in the point group detail page.
export class PointGroupItem
  extends React.Component<PointGroupItemProps, PointGroupItemState> {

  state: PointGroupItemState = { icon: "" };

  key = uuid();

  enter = () => this.props.dispatch(
    setHoveredPlant(this.props.point.uuid, this.state.icon));

  leave = () => this.props.dispatch(setHoveredPlant(undefined));

  click = () => {
    if (this.criteriaIcon) {
      return error(t("Cannot remove points selected by criteria."));
    }
    this.props.dispatch(
      removePoint(this.props.group, this.props.point.body.id || 0));
    this.leave();
  }

  setIconState = (icon: string) => this.setState({ icon });

  get criteriaIcon() {
    return !this.props.group.body.point_ids
      .includes(this.props.point.body.id || 0);
  }

  maybeGetCachedIcon = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    if (this.props.point.body.pointer_type == "Plant") {
      const slug = this.props.point.body.openfarm_slug;
      maybeGetCachedPlantIcon(slug, img, this.setIconState);
    }
  };

  get initIcon() {
    switch (this.props.point.body.pointer_type) {
      case "Plant":
        return DEFAULT_ICON;
      case "GenericPointer":
        const { color } = this.props.point.body.meta;
        return svgToUrl(genericPointIcon(color));
      case "Weed":
        const weedColor = this.props.point.body.meta.color;
        return svgToUrl(genericWeedIcon(weedColor));
      default:
        return svgToUrl(OTHER_POINT_ICON);
    }
  }

  render() {
    return <span
      key={this.key}
      className={"group-item-icon"}
      onMouseEnter={this.enter}
      onMouseLeave={this.leave}
      onClick={this.click}>
      {this.props.point.body.pointer_type == "Weed" &&
        <img className={"weed-icon"}
          src={DEFAULT_WEED_ICON}
          width={32}
          height={32} />}
      <img
        style={{
          border: this.criteriaIcon ? "1px solid gray" : "none",
          borderRadius: "5px",
          background: this.props.hovered ? "lightgray" : "none",
        }}
        src={this.initIcon}
        onLoad={this.maybeGetCachedIcon}
        width={32}
        height={32} />
    </span>;
  }
}
