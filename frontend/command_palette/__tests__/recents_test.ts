import { Command } from "../interfaces";
import {
  clearRecentCommands, COMMAND_PALETTE_RECENTS, orderCommandsWithRecents,
  readRecentCommandIds, readRecentCommands, recordRecentCommand,
} from "../recents";

const command = (id: string): Command => ({
  id,
  name: id,
  englishName: id,
  group: "navigation",
  execute: jest.fn(),
});

describe("command palette recents", () => {
  it("stores the 10 most recent executions without deduplication", () => {
    ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "j"]
      .map(id => recordRecentCommand(id));
    expect(readRecentCommandIds())
      .toEqual(["j", "l", "k", "j", "i", "h", "g", "f", "e", "d"]);
    const commands = [
      "a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l",
    ].map(command);
    expect(orderCommandsWithRecents(commands).map(result => result.id))
      .toEqual([
        "j", "l", "k", "j", "i", "h", "g", "f", "e", "d",
        "a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l",
      ]);
  });

  it("stores action and input details on the recent command", () => {
    recordRecentCommand("move", "custom", { xDistance: "42.5" });
    expect(readRecentCommands()[0]).toEqual({
      id: "move",
      actionId: "custom",
      values: { xDistance: "42.5" },
    });
    expect(orderCommandsWithRecents([command("move")])[0]
      ?.recentExecution).toEqual({
      actionId: "custom",
      values: { xDistance: "42.5" },
    });
  });

  it("ranks priority commands after recents", () => {
    recordRecentCommand("other");
    const commands = [
      command("other"),
      { ...command("unlock"), priority: 1 },
      { ...command("estop"), priority: 2 },
    ];
    expect(orderCommandsWithRecents(commands).map(result => result.id))
      .toEqual(["other", "estop", "unlock", "other"]);
  });

  it("clears recent commands", () => {
    recordRecentCommand("move");
    clearRecentCommands();
    expect(readRecentCommands()).toEqual([]);
    expect(localStorage.getItem(COMMAND_PALETTE_RECENTS)).toBeFalsy();
  });

  it("ignores invalid storage and stale commands", () => {
    localStorage.setItem(COMMAND_PALETTE_RECENTS, "{");
    expect(readRecentCommandIds()).toEqual([]);
    localStorage.setItem(COMMAND_PALETTE_RECENTS,
      JSON.stringify(["missing", "b"]));
    expect(orderCommandsWithRecents([command("a"), command("b")])
      .map(result => result.id)).toEqual(["b", "a", "b"]);
    localStorage.setItem(COMMAND_PALETTE_RECENTS, JSON.stringify([
      { id: "a", actionId: "run", values: { value: "1", invalid: 2 } },
      { id: 2 }, false,
    ]));
    expect(readRecentCommands()).toEqual([{
      id: "a", actionId: "run", values: { value: "1" },
    }]);
  });
});
