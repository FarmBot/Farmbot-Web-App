import * as React from "react";
import { connect } from "react-redux";
import { Everything } from "../../interfaces";
import { TaggedPointGroup, TaggedPoint } from "farmbot";
import { findByKindAndId } from "../../resources/selectors";
import { betterCompact } from "../../util/util";
import { push, getPathArray } from "../../history";
import { ResourceIndex } from "../../resources/interfaces";
import { GroupDetailActive } from "./group_detail_active";
import { TaggedPlant } from "../map/interfaces";

interface GroupDetailProps {
  dispatch: Function;
  group: TaggedPointGroup | undefined;
  plants: TaggedPlant[];
}

export function fetchGroupFromUrl(index: ResourceIndex) {
  if (!getPathArray().includes("groups")) { return; }
  /** TODO: Write better selectors. */
  const groupId = parseInt(getPathArray().pop() || "?", 10);
  let group: TaggedPointGroup | undefined;
  try {
    group = findByKindAndId<TaggedPointGroup>(index, "PointGroup", groupId);
  } catch (error) {
    group = undefined;
  }
  return group;
}

function mapStateToProps(props: Everything): GroupDetailProps {
  const plants: TaggedPlant[] = [];
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
        if (p) {
          if (p.kind === "Point") {
            if (p.body.pointer_type == "Plant") {
              plants.push(p as TaggedPlant); // Sorry.
            }
          }
        }
      });
  }

  return { plants, group, dispatch: props.dispatch };
}

export class RawGroupDetail extends React.Component<GroupDetailProps, {}> {

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
export const GroupDetail = connect(mapStateToProps)(RawGroupDetail);
