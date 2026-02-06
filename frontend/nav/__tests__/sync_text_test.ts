import { SyncStatus } from "farmbot";
import { syncText } from "../sync_text";
import * as mustBeOnline from "../../devices/must_be_online";

let forceOnlineSpy: jest.SpyInstance;

describe("syncText()", () => {
  beforeEach(() => {
    forceOnlineSpy = jest.spyOn(mustBeOnline, "forceOnline")
      .mockImplementation(() => false);
    localStorage.removeItem("myBotIs");
  });

  afterEach(() => {
    forceOnlineSpy.mockRestore();
    localStorage.removeItem("myBotIs");
  });

  it("shows synced for demo accounts", () => {
    forceOnlineSpy.mockImplementation(() => true);
    expect(syncText("syncing")).toEqual("Synced");
  });

  it.each<[SyncStatus, string]>([
    ["syncing", "Syncing..."],
    ["sync_now", "Syncing..."],
    ["synced", "Synced"],
    ["booting", "Sync unknown"],
    ["unknown", "Sync unknown"],
    ["maintenance", "Sync unknown"],
    ["sync_error", "Sync error"],
    ["new" as SyncStatus, "new"],
    ["" as SyncStatus, "Sync unknown"],
  ])("renders sync status: %s", (input, expected) => {
    expect(syncText(input)).toEqual(expected);
  });
});
