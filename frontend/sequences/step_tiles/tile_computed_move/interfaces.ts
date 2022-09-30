import {
  Identifier, Point, Tool, TaggedSequence, Move, Xyz, AxisOverwrite,
} from "farmbot";
import { ResourceIndex, UUID } from "../../../resources/interfaces";
import { BotPosition } from "../../../devices/interfaces";

export type LocationNode = Identifier | Point | Tool;

export interface ComputedMoveState {
  locationSelection: LocSelection | undefined;
  location: LocationNode | undefined;
  more: boolean;
  selection: Record<Xyz, AxisSelection | undefined>;
  overwrite: Record<Xyz, number | string | undefined>;
  offset: Record<Xyz, number | string | undefined>;
  variance: Record<Xyz, number | undefined>;
  speed: Record<Xyz, number | string | undefined>;
  safeZ: boolean;
  viewRaw?: boolean;
}

type AxisStateKey = keyof Pick<ComputedMoveState,
  "selection" | "overwrite" | "offset" | "variance" | "speed">;

export type CommitMoveField = (field: AxisStateKey, axis: Xyz) =>
  (e: React.SyntheticEvent<HTMLInputElement>) => void;

export interface MoveStepInputProps {
  field: AxisStateKey;
  axis: Xyz;
  value: string | number | undefined;
  onCommit: CommitMoveField;
  setValue(value?: string | number): void;
  min?: number;
  max?: number;
  onClear?: () => void;
  disabled?: boolean;
  defaultValue?: number;
}

export enum AxisSelection {
  custom = "custom",
  disable = "current_location",
  soil_height = "soil_height",
  safe_height = "safe_height",
  lua = "lua",
  none = "",
}

export enum LocSelection {
  custom = "custom",
  offset = "offset",
  point = "point",
  tool = "tool",
  identifier = "identifier",
  none = "",
}

export interface LocationSelectionProps {
  locationNode: LocationNode | undefined;
  locationSelection: LocSelection | undefined;
  resources: ResourceIndex;
  onChange(x: {
    locationNode: LocationNode | undefined,
    locationSelection: LocSelection | undefined,
  }): void;
  sequence: TaggedSequence;
  sequenceUuid: UUID;
}

export interface SafeZCheckboxProps {
  checked: boolean;
  onChange(): void;
}

interface InputRowBase {
  disabledAxes: Record<Xyz, boolean>;
  onCommit: CommitMoveField;
}

export interface VarianceInputRowProps extends InputRowBase {
  variance: Record<Xyz, number | undefined>;
}

export type SetAxisState =
  (field: AxisStateKey, axis: Xyz, defaultValue: number) =>
    (value: string | number | undefined) => void;

export interface OffsetInputRowProps extends InputRowBase {
  offset: Record<Xyz, number | string | undefined>;
  setAxisState: SetAxisState;
}

export interface SpeedInputRowProps extends InputRowBase {
  speed: Record<Xyz, number | string | undefined>;
  setAxisState: SetAxisState;
}

export interface OverwriteInputRowProps extends InputRowBase {
  selection: Record<Xyz, AxisSelection | undefined>;
  overwrite: Record<Xyz, number | string | undefined>;
  locationSelection: LocSelection | undefined;
  setAxisState: SetAxisState;
  setAxisOverwriteState(axis: Xyz, value: AxisSelection): void;
}

export interface ComputeCoordinateProps {
  step: Move;
  botPosition: BotPosition;
  resourceIndex: ResourceIndex;
  sequenceUuid: UUID | undefined;
}

export interface ComputeOverwriteProps {
  axis: Xyz;
  operand: AxisOverwrite["args"]["axis_operand"];
  botPosition: BotPosition;
  resourceIndex: ResourceIndex;
  sequenceUuid: UUID | undefined;
}

export interface FetchSpecialValueProps {
  axis: Xyz;
  label: string;
  botPosition: BotPosition;
  resources: ResourceIndex;
}

export interface ComputeAddProps {
  axis: Xyz;
  operand: AxisOverwrite["args"]["axis_operand"];
}
