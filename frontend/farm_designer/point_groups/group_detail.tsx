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
import { TaggedPointGroup, TaggedPoint } from "farmbot";
import { findByKindAndId } from "../../resources/selectors";
import { betterCompact } from "../../util/util";

interface GroupDetailProps {
  dispatch: Function;
  group: TaggedPointGroup | undefined;
  points: TaggedPoint[];
}

interface State {
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
            return <i className="fa fa-dot-circle-o" />;
          case "ToolSlot":
            return <i className="fa fa-wrench" />;
          case "Plant":
            return <i className="fa fa-leaf" />;
        }
      });
  }
  render() {
    return <DesignerPanel panelName={"groups"} panelColor={"gray"}>
      <DesignerPanelHeader
        panelName={Panel.Groups}
        panelColor={"green"}
        title={t("Edit Group")}
        backTo={"/app/designer/plants"}
        onBack={() => { throw new Error("TODO: Make back btn"); }}>
      </DesignerPanelHeader>
      <DesignerPanelContent
        panelName={"groups"}>
        <h1>{this.name}</h1>
        <p>Items:</p>
        {this.icons}

      </DesignerPanelContent>
    </DesignerPanel>;
  }
}
