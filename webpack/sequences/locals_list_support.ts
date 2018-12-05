import {
  TaggedSequence,
  ScopeDeclaration,
} from "farmbot";
import { ResourceIndex, VariableNameSet } from "../resources/interfaces";
import { SequenceMeta } from "../resources/sequence_meta";

type OnChange = (data_type: ScopeDeclaration) => void;

export interface LocalsListProps {
  variableData: VariableNameSet;
  sequence: TaggedSequence;
  resources: ResourceIndex;
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
