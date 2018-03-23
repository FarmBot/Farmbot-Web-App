jest.mock("farmbot-toastr", () => ({ info: jest.fn() }));

import { createReminderFn } from "../upgrade_reminder";
import { info } from "farmbot-toastr";

describe("createReminderFn", () => {
  it("reminds the user as-needed, but never more than once", () => {
    jest.resetAllMocks();
    const ding = createReminderFn();

    expect(info).toHaveBeenCalledTimes(0);

    ding("6.3.2");
    expect(info).toHaveBeenCalledTimes(0);

    ding("6.3.1");
    expect(info).toHaveBeenCalledTimes(0);

    ding("6.3.0");
    expect(info).toHaveBeenCalledTimes(1);

    ding("6.3.0");
    expect(info).toHaveBeenCalledTimes(1);

    ding("1.3.0");
    expect(info).toHaveBeenCalledTimes(2);
  });
});
