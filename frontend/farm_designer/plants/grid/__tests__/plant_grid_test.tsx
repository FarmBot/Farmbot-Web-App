jest.mock("../thunks", () => ({
  saveGrid: jest.fn(() => "SAVE_GRID_MOCK"),
  stashGrid: jest.fn(() => "STASH_GRID_MOCK")
}));

import * as React from "react";
import { mount } from "enzyme";
import { PlantGrid } from "../plant_grid";
import { saveGrid, stashGrid } from "../thunks";
import { error } from "../../../../toast/toast";

describe("PlantGrid", () => {
  function fakeProps() {
    return {
      xy_swap: true,
      openfarm_slug: "beets",
      cropName: "Beets",
      dispatch: jest.fn(() => Promise.resolve({})),
    };
  }

  it("renders", () => {
    const p = fakeProps();
    const el = mount<PlantGrid>(<PlantGrid {...p} />);
    // Upon load, there should be one button.
    const previewButton = el.find("a.clear-button");
    expect(previewButton.text()).toContain("Preview");
    previewButton.simulate("click");

    // After clicking PREVIEW, there should be two buttons.
    const saveAndCancelBtns = el.find("a.clear-button");
    const cancel = saveAndCancelBtns.at(0);
    const save = saveAndCancelBtns.at(1);
    expect(cancel.text()).toContain("Cancel");
    expect(save.text()).toContain("Save");
    expect(el.state().status).toEqual("dirty");
  });

  it("saves a grid", async () => {
    const props = fakeProps();
    const pg = mount<PlantGrid>(<PlantGrid {...props} />).instance();
    await pg.saveGrid();
    expect(saveGrid).toHaveBeenCalledWith(pg.state.gridId);
  });

  it("stashes a grid", async () => {
    const props = fakeProps();
    const pg = mount<PlantGrid>(<PlantGrid {...props} />).instance();
    await pg.revertPreview();
    expect(stashGrid).toHaveBeenCalledWith(pg.state.gridId);
  });

  it("prevents creation of grids with > 100 plants", () => {
    const props = fakeProps();
    const pg = mount<PlantGrid>(<PlantGrid {...props} />).instance();
    pg.setState({
      ...pg.state,
      grid: {
        ...pg.state.grid,
        numPlantsH: 10,
        numPlantsV: 11
      }
    });
    pg.performPreview();
    expect(error).toHaveBeenCalledWith("Please make a grid with less than 100 plants");
  });

  it("discards unsaved changes", async () => {
    window.confirm = jest.fn(() => false);
    const props = fakeProps();
    const pg = mount<PlantGrid>(<PlantGrid {...props} />).instance();
    pg.setState({ ...pg.state, status: "dirty" });
    pg.componentWillUnmount();
    expect(pg.props.dispatch).toHaveBeenCalledWith("STASH_GRID_MOCK");
  });

  it("keeps unsaved changes", () => {
    window.confirm = jest.fn(() => true);
    const props = fakeProps();
    const pg = mount<PlantGrid>(<PlantGrid {...props} />).instance();
    pg.setState({ ...pg.state, status: "dirty" });
    pg.componentWillUnmount();
    expect(pg.props.dispatch).toHaveBeenCalledWith("SAVE_GRID_MOCK");
  });

  it("handles data changes", () => {
    const props = fakeProps();
    const pg = mount<PlantGrid>(<PlantGrid {...props} />).instance();
    pg.onchange("numPlantsH", 6);
    expect(pg.state.grid.numPlantsH).toEqual(6);
  });
});
