import { ResourceIndex, UUID } from "../../../resources/interfaces";
import {
  UpdateResource, TaggedSequence, Resource, Identifier, Nothing, Pair,
} from "farmbot";
import { KnownField } from "./field_selection";

export interface MarkAsProps {
  currentSequence: TaggedSequence;
  currentStep: UpdateResource;
  dispatch: Function;
  index: number;
  resources: ResourceIndex;
  confirmStepDeletion: boolean;
}

export type UpdateResourceValue = Pair["args"]["value"];

export interface FieldAndValue {
  field: string | undefined;
  value: UpdateResourceValue | undefined;
}

export interface MarkAsState {
  resource: Resource | Identifier | Nothing;
  fieldsAndValues: FieldAndValue[];
}

export interface GetSelectedValueProps {
  resource: Resource | Identifier | Nothing;
  field: KnownField | undefined;
  value: UpdateResourceValue | undefined;
  resourceIndex: ResourceIndex;
}

interface SelectionPropsBase {
  resource: Resource | Identifier | Nothing;
  resources: ResourceIndex;
}

export interface ResourceSelectionProps extends SelectionPropsBase {
  updateResource(resource: Resource | Identifier): void;
  sequenceUuid: UUID;
}

type UpdateFieldOrValue =
  (update: Partial<FieldAndValue>, callback?: () => void) => void;

export interface FieldSelectionProps extends SelectionPropsBase {
  field: string | undefined;
  update: UpdateFieldOrValue;
}

export interface CustomFieldSelectionProps extends SelectionPropsBase {
  field: string;
  update: UpdateFieldOrValue;
}

export interface ValueSelectionProps extends SelectionPropsBase {
  field: string | undefined;
  value: UpdateResourceValue | undefined;
  update: UpdateFieldOrValue;
  add: UpdateFieldOrValue;
  commitSelection(): void;
}
