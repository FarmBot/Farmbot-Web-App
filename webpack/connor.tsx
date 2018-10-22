import * as React from "react";
import axios from "axios";
import { connect } from "react-redux";
import { Everything } from "./interfaces";
import { API } from "./api";
import { ResourceIndex } from "./resources/interfaces";
import { joinKindAndId } from "./resources/reducer";
import { SpecialStatus } from "farmbot";

type RelevantResource =
  // | "device"
  // | "diagnostic_dumps"
  // | "farm_events"
  // | "farmware_envs"
  // | "farmware_installations"
  // | "fbos_config"
  // | "firmware_config"
  // | "peripherals"
  // | "pin_bindings"
  // | "points"
  // | "regimens"
  // | "sensor_readings"
  // | "sensors"
  // | "sequences"
  | "tools";

type SyncInfoTuple = [number, string];
type SyncObject = Record<RelevantResource, SyncInfoTuple[]>;

const STYLE: React.CSSProperties = { border: "1px solid black" };
const getSyncObject = () => axios
  .get<SyncObject>(API.current.syncPatch)
  .then(x => x.data);

interface ReconciliationResult {
  /** IDs that can't be found in local index. */
  mustGet: number[],
  mustPost: string[],
  mustPut: number[],
  mustDelete: number[],
  mustMerge: string[],
}

export function reconcileTools(_remote: SyncObject, local: ResourceIndex) {

  const output: ReconciliationResult = {
    mustGet: [],
    mustPost: [],
    mustPut: [],
    mustDelete: [
      // Ids that exist locally, but not in sync object
    ],
    /** Updated locally and on remote - user or application must intervene. */
    mustMerge: [
      // Tools where status == "dirty" and `updated_at` does not match
      // remote version
    ]
    // Not show: `mustDelete` (we don't have Tombstone records on the FE)
  };

  // const toolList = _local.byKind.Tool;
  // toolList.map(uuid => {
  //   const tool = _local.references[uuid];
  //   if (tool && tool.kind == "Tool") {

  //   } else {
  //     throw new Error("Impossible");
  //   }
  // });

  _remote.tools.map(([id, _updated_at]) => {
    const uuid = local.byKindAndId[joinKindAndId("Tool", id)];
    if (uuid) {
      const tool = local.references[uuid];
      if (tool && tool.kind === "Tool") {
        const local_id = tool.body.id;
        if (local_id) {
          if (tool.specialStatus === SpecialStatus.DIRTY) {
            output.mustPut.push(local_id);
          } else {
            debugger;
          }
        } else {
          output.mustPost.push(uuid);
        }
      }
    } else {
      output.mustGet.push(id);
    }
  });
  return output;
}

@connect(state => state)
export class Connor extends React.Component<Everything, {}> {

  render() {
    return <div>
      <br />
      <br />
      <br />
      <br />
      <br />
      <br />
      <br />
      <br />
      <table style={STYLE}>
        <tbody>
          <tr style={STYLE}>
            <td>
              <button onClick={getSyncObject}>Fetch Sync Object</button>
            </td>
          </tr>
        </tbody>
      </table>
      WIP!
    </div>;
  }
}
