import * as React from "react";
import { Panel } from "../panel_header";
import { t } from "../../i18next_wrapper";
import {
  DesignerPanel,
  DesignerPanelContent,
  DesignerPanelHeader
} from "../plants/designer_panel";
import { TaggedPointGroup, SpecialStatus } from "farmbot";
import { DeleteButton } from "../../controls/pin_form_fields";
import { svgToUrl, DEFAULT_ICON } from "../../open_farm/icons";
import { overwrite, save, edit } from "../../api/crud";
import { Dictionary } from "lodash";
import { cachedCrop, OFIcon } from "../../open_farm/cached_crop";
import { toggleHoveredPlant } from "../actions";
import { TaggedPlant } from "../map/interfaces";
import { PointGroupSortSelector, sortGroupBy } from "./point_group_sort_selector";
import { PointGroupSortType } from "farmbot/dist/resources/api_resources";

interface GroupDetailActiveProps {
  dispatch: Function;
  group: TaggedPointGroup;
  plants: TaggedPlant[];
}

type State = Dictionary<OFIcon | undefined>;
const removePoint = (group: TaggedPointGroup, pointId: number) => {
  type Body = (typeof group)["body"];
  const nextGroup: Body = { ...group.body };
  nextGroup.point_ids = nextGroup.point_ids.filter(x => x !== pointId);
  return overwrite(group, nextGroup);
};

interface LittleIconProps {
  /** URL (or even a data-url) to the icon image. */
  icon: string;
  group: TaggedPointGroup;
  plant: TaggedPlant;
  dispatch: Function;
}

export const LittleIcon =
  ({ group, plant: point, icon, dispatch }: LittleIconProps) => {
    const { body } = point;
    const p = point;
    const plantUUID = point.uuid;
    return <span
      key={plantUUID}
      onMouseEnter={() => dispatch(toggleHoveredPlant(plantUUID, icon))}
      onMouseLeave={() => dispatch(toggleHoveredPlant(undefined, icon))}
      onClick={() => dispatch(removePoint(group, body.id || 0))}>
      <img src={icon} alt={p.body.name} width={32} height={32} />
    </span>;
  };

export class GroupDetailActive
  extends React.Component<GroupDetailActiveProps, State> {
  state: State = {};

  update = ({ currentTarget }: React.SyntheticEvent<HTMLInputElement>) => {
    this.props.dispatch(edit(this.props.group, { name: currentTarget.value }));
  };

  handleIcon =
    (uuid: string) =>
      (icon: Readonly<OFIcon>) =>
        this.setState({ [uuid]: icon });

  performLookup = (plant: TaggedPlant) => {
    cachedCrop(plant.body.openfarm_slug).then(this.handleIcon(plant.uuid));
    return DEFAULT_ICON;
  }

  findIcon = (plant: TaggedPlant) => {
    const svg = this.state[plant.uuid];
    if (svg) {
      if (svg.svg_icon) {
        return svgToUrl(svg.svg_icon);
      }
      return DEFAULT_ICON;
    }
    return this.performLookup(plant);

  }

  get name() {
    const { group } = this.props;
    return group ? group.body.name : "Group Not found";
  }

  get icons() {
    const plants = sortGroupBy(this.props.group.body.sort_type,
      this.props.plants);

    return plants.map(point => {
      return <LittleIcon
        key={point.uuid}
        icon={this.findIcon(point)}
        group={this.props.group}
        plant={point}
        dispatch={this.props.dispatch} />;
    });
  }

  get saved(): boolean {
    return !this.props.group.specialStatus;
  }

  saveGroup = () => {
    if (!this.saved) {
      this.props.dispatch(save(this.props.group.uuid));
    }
  }

  changeSortType = (sort_type: PointGroupSortType) => {
    const { dispatch, group } = this.props;
    dispatch(edit(group, { sort_type }));
  }

  render() {
    const { group } = this.props;
    return <DesignerPanel panelName={"groups"} panelColor={"blue"}>
      <DesignerPanelHeader
        onBack={this.saveGroup}
        panelName={Panel.Groups}
        panelColor={"blue"}
        title={t("Edit Group")}
        backTo={"/app/designer/groups"}>
      </DesignerPanelHeader>
      <DesignerPanelContent
        panelName={"groups"}>
        <label>{t("GROUP NAME")}{this.saved ? "" : "*"}</label>
        <input
          defaultValue={this.name}
          onChange={this.update}
          onBlur={this.saveGroup} />
        <PointGroupSortSelector
          value={this.props.group.body.sort_type}
          onChange={this.changeSortType} />
        <label>
          {t("GROUP MEMBERS ({{count}})", { count: this.icons.length })}
        </label>
        <p>
          {t("Click plants in map to add or remove.")}
        </p>
        <div className="groups-list-wrapper">
          {this.icons}
        </div>
        <DeleteButton
          className="groups-delete-btn"
          dispatch={this.props.dispatch}
          uuid={group.uuid}
          onDestroy={history.back}>
          {t("DELETE GROUP")}
        </DeleteButton>
      </DesignerPanelContent>
    </DesignerPanel>;
  }
}
