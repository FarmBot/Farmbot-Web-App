import React from "react";

export type CommandGroup =
  | "recent"
  | "navigation"
  | "controls"
  | "farmbot"
  | "map"
  | "resources"
  | "settings";

export interface CommandInputField {
  key: string;
  label: string;
  type?: "boolean" | "number" | "text";
  placeholder?: string;
  min?: number;
  max?: number;
  step?: number;
  initialValue?: string;
  options?: {
    label: string;
    value: string;
  }[];
}

export interface CommandInput {
  fields: CommandInputField[];
  table?: boolean;
  validate?(values: Record<string, string>): string | undefined;
}

export interface CommandAction {
  id: string;
  name: string;
  englishName: string;
  href?: string;
  aliases?: string[];
  unavailable?: string;
  input?: CommandInput;
  execute(values?: Record<string, string>): unknown;
}

export interface RecentCommandExecution {
  actionId?: string;
  values?: Record<string, string>;
}

export interface CommandHelp {
  text: string;
  enableMarkdown?: boolean;
}

export interface Command {
  id: string;
  instanceId?: string;
  priority?: number;
  searchPriority?: number;
  name: string;
  englishName: string;
  aliases?: string[];
  group: CommandGroup;
  icon?: string;
  iconStack?: {
    base: string;
    overlay: string;
  };
  imageIcon?: string;
  imageIconClass?: string;
  themeAwareImageIcon?: boolean;
  unavailable?: string;
  help?: CommandHelp;
  execute(values?: Record<string, string>): unknown;
  actions?: CommandAction[];
  actionTable?: boolean;
  recordRecent?: boolean;
  recentExecution?: RecentCommandExecution;
  toggleValue?: boolean;
  accessory?(execute: () => void, toggleValue?: boolean): React.ReactNode;
}

export interface ScoredCommand {
  command: Command;
  score: number;
}
