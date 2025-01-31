import React from "react";
import { setHoveredPlant } from "../farm_designer/map/actions";
import {
  TaggedPointGroup, uuid, TaggedPoint, TaggedToolSlotPointer, TaggedTool,
  TaggedPlantTemplate,
} from "farmbot";
import { error } from "../toast/toast";
import { t } from "../i18next_wrapper";
import { uniq } from "lodash";
import { overwriteGroup } from "./actions";
import { ToolSlotSVG } from "../farm_designer/map/layers/tool_slots/tool_graphics";
import { ToolTransformProps } from "../tools/interfaces";
import { FilePath, Path } from "../internal_urls";
import { NavigationContext } from "../routes_helpers";
import { findIcon } from "../crops/find";

export const svgToUrl = (xml: string): string => {
  const DATA_URI = "data:image/svg+xml;utf8,";
  return DATA_URI + encodeURIComponent(xml);
};

export interface PointGroupItemProps {
  point: TaggedPoint | TaggedPlantTemplate;
  group?: TaggedPointGroup;
  dispatch?: Function;
  hovered?: boolean;
  tools?: TaggedTool[];
  toolTransformProps?: ToolTransformProps;
  navigate?: boolean;
}

const removePoint = (group: TaggedPointGroup, pointId: number) =>
  (dispatch: Function) => {
    type Body = (typeof group)["body"];
    const nextGroup: Body = { ...group.body };
    nextGroup.point_ids = uniq(nextGroup.point_ids.filter(x => x !== pointId));
    dispatch(overwriteGroup(group, nextGroup));
  };

export const genericPointIcon = (color: string | undefined) =>
  `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 50 50'
    fill='none' stroke-width='1.5' stroke='${color || "green"}'>
    <circle cx='25' cy='25' r='18' />
    <circle cx='25' cy='25' r='2' />
  </svg>`;

export const genericWeedIcon = (color: string | undefined) =>
  `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 50 50'>
      <defs>
        <radialGradient id='WeedGradient'>
          <stop offset='90%' stop-color='${color || "red"}'
            stop-opacity='0.25'></stop>
          <stop offset='100%' stop-color='${color || "red"}'
            stop-opacity='0'></stop>
        </radialGradient>
      </defs>
      <circle id='weed-radius' cx='25' cy='25' r='25'
        fill='url(#WeedGradient)' opacity='0.5'></circle>
    </svg>`;

// The individual plants in the point group detail page.
export class PointGroupItem
  extends React.Component<PointGroupItemProps, {}> {

  key = uuid();

  enter = () => this.props.dispatch?.(
    setHoveredPlant(this.props.point.uuid));

  leave = () => this.props.dispatch?.(setHoveredPlant(undefined));

  static contextType = NavigationContext;
  context!: React.ContextType<typeof NavigationContext>;
  navigate = this.context;

  click = () => {
    if (this.props.navigate) {
      this.navigate(Path.plants(this.props.point.body.id));
    }
    if (this.criteriaIcon) {
      return error(t("Cannot remove points selected by filters."));
    }
    if (this.props.group && this.props.dispatch) {
      this.props.dispatch(
        removePoint(this.props.group, this.props.point.body.id || 0));
    }
    this.leave();
  };

  get criteriaIcon() {
    return this.props.group && !this.props.group.body.point_ids
      .includes(this.props.point.body.id || 0);
  }

  get initIcon() {
    if (this.props.point.kind == "PlantTemplate") {
      return findIcon(this.props.point.body.openfarm_slug);
    }
    switch (this.props.point.body.pointer_type) {
      case "Plant":
        return findIcon(this.props.point.body.openfarm_slug);
      case "GenericPointer":
        const { color } = this.props.point.body.meta;
        return svgToUrl(genericPointIcon(color));
      case "Weed":
        const weedColor = this.props.point.body.meta.color;
        return svgToUrl(genericWeedIcon(weedColor));
      case "ToolSlot":
        return svgToUrl("<svg xmlns='http://www.w3.org/2000/svg'></svg>");
    }
  }

  ToolSlotGraphic = () => {
    if (this.props.point.kind == "PlantTemplate"
      || this.props.point.body.pointer_type !== "ToolSlot"
      || !this.props.tools || !this.props.toolTransformProps) {
      return <div className={"no-slot-icon"} />;
    }
    const { tool_id } = this.props.point.body;
    const toolName = this.props.tools
      .filter(tool => tool.body.id == tool_id)[0]?.body.name;
    return <div className={"slot-icon"} style={{ position: "absolute" }}>
      <ToolSlotSVG size={2}
        toolSlot={this.props.point as TaggedToolSlotPointer}
        toolName={tool_id ? toolName : "Empty"}
        toolTransformProps={this.props.toolTransformProps} />
    </div>;
  };

  render() {
    const size = 30;
    return <span
      key={this.key}
      className={"group-item-icon"}
      onMouseEnter={this.enter}
      onMouseLeave={this.leave}
      onClick={this.click}>
      {this.props.point.kind != "PlantTemplate"
        && this.props.point.body.pointer_type == "Weed" &&
        <img className={"weed-icon"}
          src={FilePath.DEFAULT_WEED_ICON}
          width={size}
          height={size} />}
      <this.ToolSlotGraphic />
      <img
        style={{ background: this.props.hovered ? "lightgray" : "none" }}
        src={this.initIcon}
        width={size}
        height={size} />
    </span>;
  }
}
