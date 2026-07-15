import { Command } from "../interfaces";
import { normalizeCommandText, scoreCommand, searchCommands } from "../search";

const command = (update: Partial<Command> = {}): Command => ({
  id: "test",
  name: "Prendre une photo",
  englishName: "Take photo",
  aliases: ["capture image", "snapshot"],
  group: "farmbot",
  execute: jest.fn(),
  ...update,
});

describe("command palette search", () => {
  it("normalizes case, punctuation, and accents", () => {
    expect(normalizeCommandText("  Ají: +X! ")).toEqual("aji +x");
  });

  it("preserves non-Latin letters", () => {
    expect(normalizeCommandText("设置相机！")).toEqual("设置相机");
    expect(normalizeCommandText("Открыть карту")).toEqual("открыть карту");
  });

  it("searches localized and English text simultaneously", () => {
    expect(scoreCommand(command(), "prendre")).toBeGreaterThan(0);
    expect(scoreCommand(command(), "take photo")).toEqual(1000);
    expect(scoreCommand(command(), "snapshot")).toBeGreaterThan(0);
  });

  it("searches non-Latin localized command names", () => {
    const localized = command({ name: "打开地图", englishName: "Open map" });
    expect(scoreCommand(localized, "地图")).toBeGreaterThan(0);
    expect(scoreCommand(localized, "open map")).toEqual(1000);
  });

  it("ranks names before aliases and omits misses", () => {
    const nameMatch = command({ id: "name", englishName: "Camera" });
    const aliasMatch = command({ id: "alias", aliases: ["camera"] });
    const miss = command({ id: "miss", name: "Water", englishName: "Water",
      aliases: [] });
    expect(searchCommands([aliasMatch, miss, nameMatch], "camera")
      .map(result => result.id)).toEqual(["name", "alias"]);
  });

  it("uses command priority to rank equally relevant results", () => {
    const result = searchCommands([
      command({ id: "other", name: "Other", englishName: "Other",
        aliases: ["safety"] }),
      command({ id: "unlock", name: "Unlock", englishName: "Unlock",
        aliases: ["safety"], priority: 1 }),
      command({ id: "estop", name: "E-stop", englishName: "E-stop",
        aliases: ["safety"], priority: 2, unavailable: "offline" }),
    ], "safety");
    expect(result.map(command => command.id))
      .toEqual(["estop", "unlock", "other"]);
  });

  it("ranks shorter names before longer equally relevant names", () => {
    const result = searchCommands([
      command({ id: "long", name: "Open garden map",
        englishName: "Open garden map" }),
      command({ id: "short", name: "Open map", englishName: "Open map" }),
    ], "open");
    expect(result.map(command => command.id)).toEqual(["short", "long"]);
  });

  it("supports compact subsequences and rejects scattered matches", () => {
    const broccoli = command({
      name: "Broccoli",
      englishName: "Broccoli",
      aliases: [],
    });
    const scattered = command({
      name: "Set Disable Emergency Unlock Confirmation off",
      englishName: "Set Disable Emergency Unlock Confirmation off",
      aliases: [],
    });
    expect(scoreCommand(command(), "photo")).toEqual(800);
    expect(scoreCommand(command(), "tkpht")).toEqual(200);
    expect(scoreCommand(broccoli, "brocli")).toEqual(200);
    expect(scoreCommand(scattered, "brocco")).toEqual(0);
    expect(scoreCommand(command(), "zzzz")).toEqual(0);
  });

  it("filters actions without splitting a multi-action command", () => {
    const sequence = command({
      name: "Water Plants",
      englishName: "Water Plants",
      aliases: ["sequence"],
      actions: [
        {
          id: "run", name: "Run", englishName: "Run",
          aliases: ["start"], execute: jest.fn(),
        },
        {
          id: "preview", name: "Preview", englishName: "Preview",
          execute: jest.fn(),
        },
      ],
    });
    expect(searchCommands([sequence], "Water Plants")[0].actions
      ?.map(action => action.id)).toEqual(["run", "preview"]);
    const filtered = searchCommands([sequence], "Water Plants Preview");
    expect(filtered).toHaveLength(1);
    expect(filtered[0].name).toEqual("Water Plants");
    expect(filtered[0].actions?.map(action => action.id)).toEqual(["preview"]);
    expect(searchCommands([sequence], "start")[0].actions
      ?.map(action => action.id)).toEqual(["run"]);
  });
});
