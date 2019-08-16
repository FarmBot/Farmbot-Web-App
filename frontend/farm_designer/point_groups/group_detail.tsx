import * as React from "react";
import { connect } from "react-redux";
import { Everything } from "../../interfaces";
import { Panel } from "../panel_header";
import { t } from "../../i18next_wrapper";
import {
  DesignerPanel,
  DesignerPanelContent,
  DesignerPanelHeader
} from "../plants/designer_panel";
import { TaggedPointGroup, TaggedPoint, SpecialStatus } from "farmbot";
import { findByKindAndId } from "../../resources/selectors";
import { betterCompact } from "../../util/util";
import { DeleteButton } from "../../controls/pin_form_fields";
import { svgToUrl, DEFAULT_ICON } from "../../open_farm/icons";
import { overwrite, save } from "../../api/crud";
import { push } from "../../history";
import { Dictionary } from "lodash";
import { TaggedPlant } from "../map/interfaces";
import { cachedCrop } from "../../open_farm/cached_crop";
import { Actions } from "../../constants";

interface GroupDetailProps {
  dispatch: Function;
  group: TaggedPointGroup | undefined;
  points: TaggedPoint[];
}

interface State {
  icons: Dictionary<string | undefined>
}

function mapStateToProps(props: Everything): GroupDetailProps {
  const points: TaggedPoint[] = [];

  /** TODO: Write better selectors. */
  const groupId = parseInt(location.pathname.split("/").pop() || "?", 10);
  let group: TaggedPointGroup | undefined;
  try {
    group = findByKindAndId<TaggedPointGroup>(props.resources.index,
      "PointGroup",
      groupId);
  } catch (error) {
    group = undefined;
  }

  if (group) {
    betterCompact(group
      .body
      .point_ids
      .map((id) => {
        return props.resources.index.byKindAndId[`Point.${id}`];
      })).map(uuid => {
        const p =
          props.resources.index.references[uuid] as TaggedPoint | undefined;
        p && points.push(p);
      });
  }

  return {
    points,
    group,
    dispatch: props.dispatch
  };
}

@connect(mapStateToProps)
export class GroupDetail extends React.Component<GroupDetailProps, State> {

  state: State = { icons: {} };

  update = ({ currentTarget }: React.SyntheticEvent<HTMLInputElement>) => {
    console.log(currentTarget.value);
  };

  findIcon = (plant: TaggedPlant) => {
    const svg = this.state.icons[plant.uuid];
    if (svg) {
      return svgToUrl(svg);
    } else {
      cachedCrop(plant.body.openfarm_slug)
        .then(x => {
          this.setState({
            icons: {
              ...this.state.icons,
              [plant.uuid]: x.svg_icon
            }
          });
        });
      return DEFAULT_ICON;
    }
  }

  get name() {
    const { group } = this.props;
    return group ? group.body.name : "Group Not found";
  }

  get icons() {
    return this
      .props
      .points
      .map(point => {
        const { body } = point;
        switch (body.pointer_type) {
          case "GenericPointer":
            return <i key={point.uuid} className="fa fa-dot-circle-o" />;
          case "ToolSlot":
            return <i key={point.uuid} className="fa fa-leaf" />;
          case "Plant":
            const p = point as TaggedPlant;
            const icon = this.findIcon(p);
            const plantUUID = point.uuid;
            return <span
              onMouseEnter={() => {
                this.props.dispatch({
                  type: Actions.TOGGLE_HOVERED_PLANT,
                  payload: { plantUUID, icon }
                });
              }}
              onMouseLeave={() => {
                this.props.dispatch({
                  type: Actions.TOGGLE_HOVERED_PLANT,
                  payload: { plantUUID: undefined, icon }
                });
              }}
              key={plantUUID}
              onClick={() => this.removePoint(body.id || 0)}>
              <img
                src={icon}
                alt={p.body.name}
                width={32}
                height={32} />
            </span>;
        }
      });
  }

  removePoint = (pointId: number) => {
    const { group } = this.props;
    if (group) {
      type Body = (typeof group)["body"];
      const nextGroup: Body = { ...group.body };
      nextGroup.point_ids = nextGroup.point_ids.filter(x => x !== pointId);
      this.props.dispatch(overwrite(group, nextGroup));
    }
  }

  saveGroup = () => {
    const { group } = this.props;
    group && this.props.dispatch(save(group.uuid));
  }

  hasGroup = (group: TaggedPointGroup) => {
    const isSaved = group.specialStatus === SpecialStatus.SAVED;
    return <DesignerPanel panelName={"groups"} panelColor={"blue"}>
      <DesignerPanelHeader
        panelName={Panel.Groups}
        panelColor={"blue"}
        title={t("Edit Group")}
        backTo={isSaved ? "/app/designer/groups" : undefined}>
        <a
          className="right-button"
          title={t("Save Changes to Group")}
          onClick={this.saveGroup}>
          {t("Save")}{isSaved ? "" : "*"}
        </a>
      </DesignerPanelHeader>
      <DesignerPanelContent
        panelName={"groups"}>
        <h5>{t("GROUP NAME")}</h5>
        <input defaultValue={this.name} />
        <h5>{t("GROUP MEMBERS ({{count}})", { count: this.icons.length })}</h5>
        <div>
          {this.icons}
        </div>
        <DeleteButton
          dispatch={this.props.dispatch}
          uuid={group.uuid}
          onDestroy={history.back}>
          {t("DELETE GROUP")}
        </DeleteButton>
      </DesignerPanelContent>
    </DesignerPanel>;
  }

  render() {
    const { group } = this.props;
    if (group) {
      return this.hasGroup(group);
    } else {
      push("/app/designer/groups");
      return <div>loading...</div>;
    }
  }
}
