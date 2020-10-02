jest.mock("../../devices/actions", () => ({ badVersion: jest.fn() }));

import { badVersion } from "../../devices/actions";
import { info } from "../../toast/toast";

describe("createReminderFn", () => {
  it("reminds the user as-needed, but never more than once", async () => {
    jest.resetAllMocks();
    expect(globalConfig).toBeDefined();
    const oldEOLVersion = globalConfig.FBOS_END_OF_LIFE_VERSION;
    globalConfig.FBOS_END_OF_LIFE_VERSION = "6.3.1";
    const oldMinVersion = globalConfig.MINIMUM_FBOS_VERSION;
    globalConfig.MINIMUM_FBOS_VERSION = "4.0.0";

    const { createReminderFn } = await import("../upgrade_reminder");
    const ding = createReminderFn();
    expect(info).toHaveBeenCalledTimes(0);

    ding("1.0.0");
    expect(badVersion).toHaveBeenCalledWith({ noDismiss: false });
    expect(info).toHaveBeenCalledTimes(0);

    ding("6.3.2");
    expect(info).toHaveBeenCalledTimes(0);

    ding("6.3.1");
    expect(info).toHaveBeenCalledTimes(0);

    ding("6.3.0");
    expect(info).toHaveBeenCalledTimes(1);

    ding("6.3.0");
    expect(info).toHaveBeenCalledTimes(1);

    ding("5.3.0");
    expect(info).toHaveBeenCalledTimes(2);
    globalConfig.FBOS_END_OF_LIFE_VERSION = oldEOLVersion;
    globalConfig.MINIMUM_FBOS_VERSION = oldMinVersion;
  });
});
