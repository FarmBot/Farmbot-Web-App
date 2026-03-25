import React from "react";
import { fireEvent, render } from "@testing-library/react";
import {
  RawEditWeed as EditWeed,
  EditWeedProps,
  mapStateToProps,
} from "../weeds_edit";
import {
  fakeWebAppConfig,
  fakeWeed,
} from "../../__test_support__/fake_state/resources";
import { fakeState } from "../../__test_support__/fake_state";
import {
  buildResourceIndex,
} from "../../__test_support__/resource_index_builder";
import { Actions } from "../../constants";
import { DesignerPanelHeader } from "../../farm_designer/designer_panel";
import * as crud from "../../api/crud";
import * as popover from "../../ui/popover";
import { fakeMovementState } from "../../__test_support__/fake_bot_data";
import { Path } from "../../internal_urls";
import {
  actRenderer,
  createRenderer,
  unmountRenderer,
} from "../../__test_support__/test_renderer";

beforeEach(() => {
  jest.clearAllMocks();
  jest.useRealTimers();
  jest.spyOn(crud, "save").mockImplementation(jest.fn());
  jest.spyOn(crud, "edit").mockImplementation(jest.fn());
  jest.spyOn(crud, "destroy").mockImplementation(jest.fn());
  jest.spyOn(popover, "Popover").mockImplementation(
    jest.fn(({ target, content }: {
      target: React.ReactElement;
      content: React.ReactElement;
    }) => <div>{target}{content}</div>) as never);
});

describe("<EditWeed />", () => {
  const fakeProps = (): EditWeedProps => ({
    dispatch: jest.fn(),
    findPoint: () => undefined,
    botOnline: true,
    defaultAxes: "XY",
    arduinoBusy: false,
    currentBotLocation: { x: 10, y: 20, z: 30 },
    movementState: fakeMovementState(),
  });

  it("redirects", () => {
    location.pathname = Path.mock(Path.weeds("nope"));
    const { container } = render(<EditWeed {...fakeProps()} />);
    expect(container.textContent).toContain("Redirecting...");
    expect(mockNavigate).toHaveBeenCalledWith(Path.weeds());
  });

  it("doesn't redirect", () => {
    location.pathname = Path.mock(Path.logs());
    const { container } = render(<EditWeed {...fakeProps()} />);
    expect(container.textContent).toContain("Redirecting...");
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it("renders", () => {
    location.pathname = Path.mock(Path.weeds(1));
    const p = fakeProps();
    const weed = fakeWeed();
    weed.body.name = "weed 1";
    weed.body.id = 1;
    p.findPoint = () => weed;
    const { container } = render(<EditWeed {...p} />);
    expect(container.textContent?.toLowerCase()).toContain("weed 1");
  });

  it("goes back", () => {
    location.pathname = Path.mock(Path.weeds(1));
    const p = fakeProps();
    const weed = fakeWeed();
    weed.body.id = 1;
    p.findPoint = () => weed;
    const wrapper = createRenderer(<EditWeed {...p} />);
    actRenderer(() => {
      wrapper.root.findByType(DesignerPanelHeader).props.onBack();
    });
    expect(p.dispatch).toHaveBeenCalledWith({
      type: Actions.TOGGLE_HOVERED_POINT,
      payload: undefined,
    });
    unmountRenderer(wrapper);
  });

  it("changes color", () => {
    location.pathname = Path.mock(Path.weeds(1));
    const p = fakeProps();
    p.findPoint = fakeWeed;
    const { container } = render(<EditWeed {...p} />);
    fireEvent.click(container.querySelector(".color-picker-item-wrapper") as Element);
    expect(crud.edit).toHaveBeenCalledWith(expect.any(Object), {
      meta: { color: "blue" },
    });
  });

  it("deletes weed", () => {
    location.pathname = Path.mock(Path.weeds(1));
    const p = fakeProps();
    const weed = fakeWeed();
    p.findPoint = () => weed;
    const { container } = render(<EditWeed {...p} />);
    fireEvent.click(container.querySelector(".fa-trash") as Element);
    expect(crud.destroy).toHaveBeenCalledWith(weed.uuid);
  });

  it("saves", () => {
    location.pathname = Path.mock(Path.weeds(1));
    const p = fakeProps();
    const weed = fakeWeed();
    weed.body.id = 1;
    p.findPoint = () => weed;
    const wrapper = createRenderer(<EditWeed {...p} />);
    actRenderer(() => {
      wrapper.root.findByType(DesignerPanelHeader).props.onSave();
    });
    expect(crud.save).toHaveBeenCalledWith(weed.uuid);
    unmountRenderer(wrapper);
  });

  it("doesn't save", () => {
    location.pathname = Path.mock(Path.logs());
    const p = fakeProps();
    const weed = fakeWeed();
    weed.body.id = 1;
    p.findPoint = () => weed;
    const wrapper = createRenderer(<EditWeed {...p} />);
    actRenderer(() => {
      wrapper.root.findByType(DesignerPanelHeader).props.onSave();
    });
    expect(crud.save).not.toHaveBeenCalled();
    unmountRenderer(wrapper);
  });
});

describe("mapStateToProps()", () => {
  it("returns props", () => {
    const state = fakeState();
    const weed = fakeWeed();
    const config = fakeWebAppConfig();
    config.body.id = 1;
    config.body.go_button_axes = "X";
    weed.body.id = 1;
    state.resources = buildResourceIndex([weed, config]);
    const props = mapStateToProps(state);
    expect(props.findPoint(1)).toEqual(weed);
    expect(["X", "XY"]).toContain(props.defaultAxes);
  });
});
