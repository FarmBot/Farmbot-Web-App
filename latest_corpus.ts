
interface PinMode {
  pin_mode: number;
}

interface SubSequenceId {
  sub_sequence_id: number;
}

interface Lhs {
  lhs: string;
}

interface Op {
  op: string;
}

interface ChannelName {
  channel_name: string;
}

interface MessageType {
  message_type: string;
}

interface ToolId {
  tool_id: number;
}

interface Version {
  version: number;
}

interface X {
  x: number;
}

interface Y {
  y: number;
}

interface Z {
  z: number;
}

interface Speed {
  speed: number;
}

interface PinNumber {
  pin_number: number;
}

interface PinValue {
  pin_value: number;
}

interface Milliseconds {
  milliseconds: number;
}

interface Rhs {
  rhs: number;
}

interface DataLabel {
  data_label: string;
}

interface Message {
  message: string;
}

interface Location {
  location: Tool
  | Coordinate;
}

interface Offset {
  offset: Coordinate;
}

interface ToolArgs extends ToolId { }

type ToolBodyNode = undefined;

export interface Tool {
  kind: "tool";
  args: ToolArgs;
  body: ToolBodyNode[] | undefined;
}

interface CoordinateArgs extends X, Y, Z { }

type CoordinateBodyNode = undefined;

export interface Coordinate {
  kind: "coordinate";
  args: CoordinateArgs;
  body: CoordinateBodyNode[] | undefined;
}

interface MoveAbsoluteArgs extends Location, Speed, Offset { }

type MoveAbsoluteBodyNode = undefined;

export interface MoveAbsolute {
  kind: "move_absolute";
  args: MoveAbsoluteArgs;
  body: MoveAbsoluteBodyNode[] | undefined;
}

interface MoveRelativeArgs extends X, Y, Z, Speed { }

type MoveRelativeBodyNode = undefined;

export interface MoveRelative {
  kind: "move_relative";
  args: MoveRelativeArgs;
  body: MoveRelativeBodyNode[] | undefined;
}

interface WritePinArgs extends PinNumber, PinValue, PinMode { }

type WritePinBodyNode = undefined;

export interface WritePin {
  kind: "write_pin";
  args: WritePinArgs;
  body: WritePinBodyNode[] | undefined;
}

interface ReadPinArgs extends PinNumber, DataLabel, PinMode { }

type ReadPinBodyNode = undefined;

export interface ReadPin {
  kind: "read_pin";
  args: ReadPinArgs;
  body: ReadPinBodyNode[] | undefined;
}

interface ChannelArgs extends ChannelName { }

type ChannelBodyNode = undefined;

export interface Channel {
  kind: "channel";
  args: ChannelArgs;
  body: ChannelBodyNode[] | undefined;
}

interface WaitArgs extends Milliseconds { }

type WaitBodyNode = undefined;

export interface Wait {
  kind: "wait";
  args: WaitArgs;
  body: WaitBodyNode[] | undefined;
}

interface SendMessageArgs extends Message, MessageType { }

type SendMessageBodyNode = Channel;

export interface SendMessage {
  kind: "send_message";
  args: SendMessageArgs;
  body: SendMessageBodyNode[] | undefined;
}

interface ExecuteArgs extends SubSequenceId { }

type ExecuteBodyNode = undefined;

export interface Execute {
  kind: "execute";
  args: ExecuteArgs;
  body: ExecuteBodyNode[] | undefined;
}

interface IfStatementArgs extends Lhs, Op, Rhs, SubSequenceId { }

type IfStatementBodyNode = undefined;

export interface IfStatement {
  kind: "if_statement";
  args: IfStatementArgs;
  body: IfStatementBodyNode[] | undefined;
}

interface SequenceArgs extends Version { }

type SequenceBodyNode = MoveAbsolute
  | MoveRelative
  | WritePin
  | ReadPin
  | Wait
  | SendMessage
  | Execute
  | IfStatement;

export interface Sequence {
  kind: "sequence";
  args: SequenceArgs;
  body: SequenceBodyNode[] | undefined;
}

 export type CeleryNode = Tool
  | Coordinate
  | MoveAbsolute
  | MoveRelative
  | WritePin
  | ReadPin
  | Channel
  | Wait
  | SendMessage
  | Execute
  | IfStatement
  | Sequence;
