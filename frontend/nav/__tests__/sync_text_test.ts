import { SyncStatus } from "farmbot";
import { syncText } from "../sync_text";

describe("syncText()", () => {
  it("shows synced for demo accounts", () => {
    localStorage.setItem("myBotIs", "online");
    expect(syncText("syncing")).toEqual("Synced");
    localStorage.setItem("myBotIs", "");
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
