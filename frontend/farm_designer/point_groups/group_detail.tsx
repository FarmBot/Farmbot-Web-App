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
import { svgToUrl } from "../../open_farm/icons";
import { overwrite, save } from "../../api/crud";

interface GroupDetailProps {
  dispatch: Function;
  group: TaggedPointGroup | undefined;
  points: TaggedPoint[];
}

interface State {
}

const FIXME = Object.values<{ svg_icon: string }>(
  JSON.parse(localStorage.getItem("openfarm_icons_with_spread") || "[]")
)[0].svg_icon;

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

  state: State = { searchTerm: "" };

  update = ({ currentTarget }: React.SyntheticEvent<HTMLInputElement>) => {
    console.log(currentTarget.value);
  };

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
            return <span onClick={() => this.removePoint(body.id || 0)}><img
              key={point.uuid}
              src={svgToUrl(FIXME)}
              alt={t("plant icon")}
              width={32}
              height={32} /></span>;
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
    return <DesignerPanel panelName={"groups"} panelColor={"blue"}>
      <DesignerPanelHeader
        panelName={Panel.Groups}
        panelColor={"blue"}
        title={t("Edit Group")}
        backTo={"/app/designer/groups"}>
        <a
          className="right-button"
          title={t("Save Changes to Group")}
          onClick={this.saveGroup}>
          {t("Save")}{group.specialStatus === SpecialStatus.SAVED ? "" : "*"}
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
      return <div>Work in progress...</div>;
    }
  }
}
