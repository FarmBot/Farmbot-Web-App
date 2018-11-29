import {
  TaggedSequence,
  Vector3,
} from "farmbot";
import { ResourceIndex, VariableNameSet } from "../resources/interfaces";
import { SequenceMeta } from "../resources/sequence_meta";

type OnChange = (data_type: Vector3) => void;

export interface LocalsListProps {
  variableData: VariableNameSet;
  deprecatedSequence: TaggedSequence;
  deprecatedResources: ResourceIndex;
  dispatch: Function;
}

export interface ParentVariableFormProps {
  parent: SequenceMeta;
  sequence: TaggedSequence;
  resources: ResourceIndex;
  onChange: OnChange;
}

export const PARENT =
  ({ value: "parent", label: "Parent", headingId: "parameter" });

export const extractParent =
  (i: ResourceIndex, uuid: string): SequenceMeta | undefined => {
    return (i.sequenceMetas[uuid] || {}).parent;
  };
