import * as React from "react";
import axios from "axios";
import { connect } from "react-redux";
import { Everything } from "./interfaces";
import { API } from "./api";
import { ResourceIndex } from "./resources/interfaces";
import { joinKindAndId } from "./resources/reducer";
import { SpecialStatus } from "farmbot";

type RelevantResource =
  | "tools"; // We only care about "tools" for the sake of demonstration.

type SyncInfoTuple = [number, string];
type SyncObject = Record<RelevantResource, SyncInfoTuple[]>;

const STYLE: React.CSSProperties = { border: "1px solid black" };
const getSyncObject = () => axios
  .get<SyncObject>(API.current.syncPatch)
  .then(x => x.data);

interface ReconciliationResult {
  mustGet: number[],
  mustPost: string[],
  mustPut: number[],
  mustDelete: number[],
  mustMerge: string[],
}

export function reconcileTools(_remote: SyncObject, local: ResourceIndex) {

  const output: ReconciliationResult = {
    mustGet: [],
    mustPost: [],   // Significantly smaller
    mustPut: [],    // Significantly smaller
    mustDelete: [], // FBOS don't need this.
    mustMerge: [
      /** Flip out if local and remote copy are dirty- that's a merge conflict. */
    ]
  };

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
            throw new Error("Your data sync layer is broke.");
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
