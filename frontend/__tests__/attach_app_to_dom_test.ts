import { fakeState } from "../__test_support__/fake_state";
import { attachAppToDom, RootComponent } from "../routes";
import * as utilPage from "../util/page";
import { store } from "../redux/store";
import * as configActions from "../config/actions";
import { DevSettings } from "../settings/dev/dev_support";

describe("attachAppToDom()", () => {
  let originalDispatch: typeof store.dispatch;
  let originalGetState: typeof store.getState;
  let dispatchMock: jest.Mock;
  let attachToRootSpy: jest.SpyInstance;
  let readySpy: jest.SpyInstance;
  let futureFeaturesEnabledSpy: jest.SpyInstance;
  let overriddenFbosVersionSpy: jest.SpyInstance;

  beforeEach(() => {
    dispatchMock = jest.fn();
    originalDispatch = store.dispatch;
    originalGetState = store.getState;
    (store as unknown as { dispatch: jest.Mock }).dispatch = dispatchMock;
    (store as unknown as { getState: typeof fakeState }).getState = fakeState;
    attachToRootSpy = jest.spyOn(utilPage, "attachToRoot")
      .mockImplementation(jest.fn());
    readySpy = jest.spyOn(configActions, "ready")
      .mockReturnValue({ type: "READY" });
    futureFeaturesEnabledSpy = jest.spyOn(DevSettings, "futureFeaturesEnabled")
      .mockReturnValue(false);
    overriddenFbosVersionSpy = jest.spyOn(DevSettings, "overriddenFbosVersion")
      .mockReturnValue(undefined);
  });

  afterEach(() => {
    attachToRootSpy.mockRestore();
    readySpy.mockRestore();
    futureFeaturesEnabledSpy.mockRestore();
    overriddenFbosVersionSpy.mockRestore();
    (store as unknown as { dispatch: typeof store.dispatch }).dispatch =
      originalDispatch;
    (store as unknown as { getState: typeof store.getState }).getState =
      originalGetState;
  });

  it("attaches RootComponent to the DOM", () => {
    attachAppToDom();
    expect(attachToRootSpy).toHaveBeenCalledWith(RootComponent, { store });
    expect(readySpy).toHaveBeenCalled();
    expect(dispatchMock).toHaveBeenCalledWith({ type: "READY" });
  });
});
