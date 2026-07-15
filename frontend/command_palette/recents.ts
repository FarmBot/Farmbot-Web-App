import { Command, RecentCommandExecution } from "./interfaces";

export const COMMAND_PALETTE_RECENTS = "farmbot.commandPalette.recents";
export const MAX_RECENT_COMMANDS = 10;

export interface RecentCommand extends RecentCommandExecution {
  id: string;
}

const recentValues = (value: unknown) => {
  if (!value || typeof value != "object" || Array.isArray(value)) {
    return undefined;
  }
  const entries = Object.entries(value)
    .filter((entry): entry is [string, string] => typeof entry[1] == "string");
  return entries.length ? Object.fromEntries(entries) : undefined;
};

const recentCommand = (item: unknown): RecentCommand | undefined => {
  if (typeof item == "string") { return { id: item }; }
  if (!item || typeof item != "object" || Array.isArray(item)) {
    return undefined;
  }
  const stored = item as Record<string, unknown>;
  if (typeof stored.id != "string") { return undefined; }
  const values = recentValues(stored.values);
  return {
    id: stored.id,
    ...(typeof stored.actionId == "string"
      ? { actionId: stored.actionId }
      : {}),
    ...(values ? { values } : {}),
  };
};

export const readRecentCommands = (): RecentCommand[] => {
  try {
    const value = JSON.parse(localStorage.getItem(COMMAND_PALETTE_RECENTS) || "[]");
    return Array.isArray(value)
      ? value.map(recentCommand)
        .filter((item): item is RecentCommand => !!item)
        .slice(0, MAX_RECENT_COMMANDS)
      : [];
  } catch {
    return [];
  }
};

export const readRecentCommandIds = () =>
  readRecentCommands().map(command => command.id);

export const clearRecentCommands = () =>
  localStorage.removeItem(COMMAND_PALETTE_RECENTS);

export const recordRecentCommand = (
  id: string,
  actionId?: string,
  values?: Record<string, string>,
) => {
  const recent: RecentCommand = {
    id,
    ...(actionId ? { actionId } : {}),
    ...(values ? { values } : {}),
  };
  const next = [
    recent,
    ...readRecentCommands(),
  ].slice(0, MAX_RECENT_COMMANDS);
  localStorage.setItem(COMMAND_PALETTE_RECENTS, JSON.stringify(next));
};

export const orderCommandsWithRecents = (commands: Command[]) => {
  const lookup = new Map(commands.map(command => [command.id, command]));
  const recent: Command[] = readRecentCommands()
    .flatMap((item, index) => {
      const command = lookup.get(item.id);
      if (!command) { return []; }
      return [{
        ...command,
        instanceId: `recent:${index}:${item.id}`,
        recentExecution: {
          ...(item.actionId ? { actionId: item.actionId } : {}),
          ...(item.values ? { values: item.values } : {}),
        },
      }];
    });
  const prioritized = commands
    .map((command, index) => ({ command, index }))
    .sort((a, b) => (b.command.priority || 0) - (a.command.priority || 0)
      || a.index - b.index)
    .map(item => item.command);
  return [...recent, ...prioritized];
};
