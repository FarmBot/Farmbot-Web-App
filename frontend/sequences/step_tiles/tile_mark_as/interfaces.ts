import { ResourceIndex, UUID } from "../../../resources/interfaces";
import { Resource, Identifier, Nothing, Pair, Point } from "farmbot";
import { KnownField } from "./field_selection";

export type ResourceArg = Resource | Identifier | Point;
export type MaybeResourceArg = ResourceArg | Nothing;

export type UpdateResourceValue = Pair["args"]["value"];

export interface FieldAndValue {
  field: string | undefined;
  value: UpdateResourceValue | undefined;
}

export interface MarkAsState {
  resource: MaybeResourceArg;
  fieldsAndValues: FieldAndValue[];
  viewRaw?: boolean;
}

export interface GetSelectedValueProps {
  resource: MaybeResourceArg;
  field: KnownField.plant_stage
  | KnownField.mounted_tool_id
  | KnownField.planted_at
  | undefined;
  value: UpdateResourceValue | undefined;
  resourceIndex: ResourceIndex;
}

interface SelectionPropsBase {
  resource: MaybeResourceArg;
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
  disabled?: boolean;
}

export interface CustomFieldSelectionProps extends SelectionPropsBase {
  field: string;
  update: UpdateFieldOrValue;
}

export interface CustomFieldWarningProps {
  resource: MaybeResourceArg;
  field: string | undefined;
  update: UpdateFieldOrValue;
}

interface ValueSelectionPropsBase extends SelectionPropsBase {
  value: UpdateResourceValue | undefined;
  update: UpdateFieldOrValue;
  add: UpdateFieldOrValue;
  commitSelection(): void;
}

export interface ValueSelectionProps extends ValueSelectionPropsBase {
  field: string | undefined;
  disabled?: boolean;
}

export interface KnownValueSelectionProps extends ValueSelectionPropsBase {
  field: KnownField.plant_stage
  | KnownField.mounted_tool_id
  | KnownField.planted_at
  | undefined;
  disabled?: boolean;
}
