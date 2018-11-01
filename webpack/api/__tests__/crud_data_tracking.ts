jest.mock("../maybe_start_tracking", () => {
  return { maybeStartTracking: jest.fn() };
});

const mockBody: Partial<TaggedUser["body"]> = { id: 23 };
jest.mock("axios", () => {
  return {
    default: {
      delete: () => Promise.resolve({}),
      post: () => Promise.resolve({ data: mockBody }),
      put: () => Promise.resolve({ data: mockBody })
    }
  };
});

jest.mock("../../resources/reducer_support", () => ({
  findByUuid: () => arrayUnwrap(newTaggedResource("User", { id: 23 })),
  // tslint:disable-next-line:no-any
  afterEach: (s: any) => s,
  joinKindAndId: jest.fn(),
  mutateSpecialStatus: jest.fn(),
}));

import { destroy, saveAll, initSave } from "../crud";
import { buildResourceIndex } from "../../__test_support__/resource_index_builder";
import { createStore, applyMiddleware } from "redux";
import { resourceReducer } from "../../resources/reducer";
import thunk from "redux-thunk";
import { ReduxAction } from "../../redux/interfaces";
import { maybeStartTracking } from "../maybe_start_tracking";
import { API } from "../api";
import { betterCompact } from "../../util";
import { SpecialStatus, TaggedUser } from "farmbot";
import * as _ from "lodash";
import { newTaggedResource } from "../../sync/actions";
import { arrayUnwrap } from "../../resources/util";

describe("AJAX data tracking", () => {
  API.setBaseUrl("http://blah.whatever.party");
  const initialState = { resources: buildResourceIndex() };
  const wrappedReducer =
    (state: typeof initialState, action: ReduxAction<void>) => {
      return { resources: resourceReducer(state.resources, action) };
    };

  const store = createStore(wrappedReducer, initialState, applyMiddleware(thunk));
  const resources = () =>
    betterCompact(Object.values(store.getState().resources.index.references));

  it("sets consistency when calling destroy()", () => {
    const uuid = Object.keys(store.getState().resources.index.byKind.Tool)[0];
    // tslint:disable-next-line:no-any
    store.dispatch(destroy(uuid) as any);
    expect(maybeStartTracking).toHaveBeenCalled();
  });

  it("sets consistency when calling saveAll()", () => {
    const r = resources().map(x => {
      x.specialStatus = SpecialStatus.DIRTY;
      return x;
    });
    // tslint:disable-next-line:no-any
    store.dispatch(saveAll(r) as any);
    expect(maybeStartTracking).toHaveBeenCalled();
    const list = (maybeStartTracking as jest.Mock).mock.calls;
    const uuids: string[] =
      _.uniq(list.map((x: string[]) => x[0]));
    expect(uuids.length).toEqual(r.length);
  });

  it("sets consistency when calling initSave()", () => {
    // tslint:disable-next-line:no-any
    const action: any = initSave("User", {
      name: "tester123",
      email: "test@test.com"
    });
    store.dispatch(action);
    expect(maybeStartTracking).toHaveBeenCalled();
  });
});
