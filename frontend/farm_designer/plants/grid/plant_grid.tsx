import React from "react";
import {
  EMPTY_PLANT_GRID,
  PlantGridKey,
  PlantGridProps,
  PlantGridState
} from "./constants";
import { initPlantGrid } from "./generate_grid";
import { init } from "../../../api/crud";
import { uuid } from "farmbot";
import { saveGrid, stashGrid } from "./thunks";
import { error } from "../../../toast/toast";
import { t } from "../../../i18next_wrapper";
import { GridInput } from "./grid_inputs";

export class PlantGrid extends React.Component<PlantGridProps, PlantGridState> {
  state: PlantGridState = {
    ...EMPTY_PLANT_GRID,
    gridId: uuid()
  };

  onchange = (key: PlantGridKey, val: number) => {
    const grid = { ...this.state.grid, [key]: val };
    this.setState({ grid });
  };

  componentWillUnmount() {
    if (this.state.status === "dirty") { this.revertPreview(); }
  }

  performPreview = () => {
    const { numPlantsH, numPlantsV } = this.state.grid;
    const total = numPlantsH * numPlantsV;
    if (total > 100) {
      error(t("Please make a grid with less than 100 plants"));
      return;
    }

    const plants = initPlantGrid({
      grid: this.state.grid,
      openfarm_slug: this.props.openfarm_slug,
      gridId: this.state.gridId
    });
    plants.map(p => this.props.dispatch(init("Point", p)));
    this.setState({ status: "dirty" });
  }

  revertPreview = () => {
    const p: Promise<{}> = this.props.dispatch(stashGrid(this.state.gridId));
    p.then(() => this.setState({ status: "clean" }));
  }

  saveGrid = () => {
    const p: Promise<{}> = this.props.dispatch(saveGrid(this.state.gridId));
    p.then(() => this.setState(EMPTY_PLANT_GRID));
  }

  inputs = () => {
    return <GridInput
      xy_swap={this.props.xy_swap}
      disabled={this.state.status === "dirty"}
      grid={this.state.grid}
      onChange={this.onchange} />;
  }

  buttons = () => {
    switch (this.state.status) {
      case "clean":
        return <div>
          <a className={"clear-button"} onClick={this.performPreview}>
            Preview
          </a>
        </div>;
      case "dirty":
        return <div>
          <a className={"clear-button"} onClick={this.revertPreview}>
            Cancel
          </a>
          <a className={"clear-button"} onClick={this.saveGrid}>
            Save
          </a>
        </div>;
    }
  }

  render() {
    return <div>
      <hr />
      <h3>
        {t("Grid and Row Planting")}
      </h3>
      {this.inputs()}
      <br />
      {this.buttons()}
    </div>;
  }
}
