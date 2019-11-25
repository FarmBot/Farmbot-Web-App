jest.mock("../history", () => ({ push: jest.fn() }));
const mockSyncThunk = jest.fn();
jest.mock("../devices/actions", () => ({ sync: () => mockSyncThunk }));
jest.mock("../farm_designer/map/actions", () => ({ unselectPlant: jest.fn() }));

import { HotKeys } from "../hotkeys";
import { betterCompact } from "../util";
import { push } from "../history";
import { sync } from "../devices/actions";
import { unselectPlant } from "../farm_designer/map/actions";

describe("hotkeys", () => {
  it("has key bindings", () => {
    const dispatch = jest.fn();
    const e = {} as KeyboardEvent;
    const comp = new HotKeys({ dispatch });
    const hmm = comp.hotkeys(dispatch, "whatever");
    const fns = betterCompact(hmm.map(item => item.onKeyDown));
    expect(fns.length).toBe(7);

    fns[0](e);
    expect(dispatch).toHaveBeenCalledWith(sync());

    fns[1](e);
    expect(push).toHaveBeenCalledWith("/app/designer");

    fns[2](e);
    expect(push).toHaveBeenCalledWith("/app/messages");

    fns[3](e);
    expect(push).toHaveBeenCalledWith("/app/designer/plants/crop_search");

    fns[4](e);
    expect(push).toHaveBeenCalledWith("/app/designer/events/add");

    fns[5](e);
    expect(push).toHaveBeenCalledWith("/app/designer/plants");
    expect(dispatch).toHaveBeenCalledWith(unselectPlant(dispatch));

    comp.toggle = jest.fn(() => () => { });
    fns[6](e);
    expect(comp.toggle).toHaveBeenCalledWith("guideOpen");
  });
});
