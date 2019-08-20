import * as React from "react";
import { connect } from "react-redux";
import { Everything } from "../../interfaces";
import { TaggedPointGroup, TaggedPoint } from "farmbot";
import { findByKindAndId } from "../../resources/selectors";
import { betterCompact } from "../../util/util";
import { push } from "../../history";
import { ResourceIndex } from "../../resources/interfaces";
import { GroupDetailActive } from "./group_detail_active";

interface GroupDetailProps {
  dispatch: Function;
  group: TaggedPointGroup | undefined;
  points: TaggedPoint[];
}

export function fetchGroupFromUrl(index: ResourceIndex) {
  /** TODO: Write better selectors. */
  const groupId = parseInt(location.pathname.split("/").pop() || "?", 10);
  let group: TaggedPointGroup | undefined;
  try {
    group =
      findByKindAndId<TaggedPointGroup>(index, "PointGroup", groupId);
  } catch (error) {
    group = undefined;
  }
  return group;
}

function mapStateToProps(props: Everything): GroupDetailProps {
  const points: TaggedPoint[] = [];
  const group = fetchGroupFromUrl(props.resources.index);
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
export class GroupDetail extends React.Component<GroupDetailProps, {}> {

  render() {
    const { group } = this.props;
    if (group) {
      return <GroupDetailActive {...this.props} group={group} />;
    } else {
      push("/app/designer/groups");
      return <div>loading...</div>;
    }
  }
}
