
export interface Tool {
  kind: "tool";
  args: {
    tool_id: number;
  };
  comment?: string | undefined;
  body?: (undefined)[] | undefined;
}

export interface Coordinate {
  kind: "coordinate";
  args: {
    x: number;
    y: number;
    z: number;
  };
  comment?: string | undefined;
  body?: (undefined)[] | undefined;
}

export interface MoveAbsolute {
  kind: "move_absolute";
  args: {
    location: Tool
           | Coordinate;
    speed: number;
    offset: Coordinate;
  };
  comment?: string | undefined;
  body?: (undefined)[] | undefined;
}

export interface MoveRelative {
  kind: "move_relative";
  args: {
    x: number;
    y: number;
    z: number;
    speed: number;
  };
  comment?: string | undefined;
  body?: (undefined)[] | undefined;
}

export interface WritePin {
  kind: "write_pin";
  args: {
    pin_number: number;
    pin_value: number;
    pin_mode: number;
  };
  comment?: string | undefined;
  body?: (undefined)[] | undefined;
}

export interface ReadPin {
  kind: "read_pin";
  args: {
    pin_number: number;
    data_label: string;
    pin_mode: number;
  };
  comment?: string | undefined;
  body?: (undefined)[] | undefined;
}

export interface Channel {
  kind: "channel";
  args: {
    channel_name: string;
  };
  comment?: string | undefined;
  body?: (undefined)[] | undefined;
}

export interface Wait {
  kind: "wait";
  args: {
    milliseconds: number;
  };
  comment?: string | undefined;
  body?: (undefined)[] | undefined;
}

export interface SendMessage {
  kind: "send_message";
  args: {
    message: string;
    message_type: string;
  };
  comment?: string | undefined;
  body?: (Channel)[] | undefined;
}

export interface Execute {
  kind: "execute";
  args: {
    sub_sequence_id: number;
  };
  comment?: string | undefined;
  body?: (undefined)[] | undefined;
}

export interface IfStatement {
  kind: "if_statement";
  args: {
    lhs: string;
    op: string;
    rhs: number;
    sub_sequence_id: number;
  };
  comment?: string | undefined;
  body?: (undefined)[] | undefined;
}

export interface Sequence {
  kind: "sequence";
  args: {
    version: number;
  };
  comment?: string | undefined;
  body?: (MoveAbsolute
           | MoveRelative
           | WritePin
           | ReadPin
           | Wait
           | SendMessage
           | Execute
           | IfStatement)[] | undefined;
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
