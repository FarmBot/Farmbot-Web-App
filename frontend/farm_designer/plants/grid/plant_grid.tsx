import React from "react";
import { BlurableInput } from "../../../ui";
import {
  EMPTY_PLANT_GRID,
  PlantGridKey,
  plantGridKeys,
  PlantGridProps,
  PlantGridState
} from "./constants";

export class PlantGrid extends React.Component<PlantGridProps, PlantGridState> {
  state: PlantGridState = EMPTY_PLANT_GRID;

  onchange = (key: PlantGridKey) =>
    (x: React.ChangeEvent<HTMLInputElement>) => this.setState({
      ...this.state,
      grid: {
        ...this.state.grid,
        [key]: parseInt(x.currentTarget.value, 10)
      }
    });

  performPreview = () => {
    this.setState({ status: "dirty" });
  }

  revertPreview = () => {
    this.setState(EMPTY_PLANT_GRID);
  }

  saveGrid = () => {
    alert("TODO");
    this.revertPreview();
  }

  inputs = () => {
    return plantGridKeys.map(key => {
      return <div key={key}>
        {key}
        <BlurableInput
          value={this.state.grid[key]}
          onCommit={this.onchange(key)} />
      </div>;
    });
  }

  buttons = () => {
    switch (this.state.status) {
      case "clean":
        return <div>
          <button onClick={this.performPreview}>
            Preview
          </button>
        </div>;
      case "dirty":
        return <div>
          <button onClick={this.saveGrid}>
            Save
          </button>
          <button onClick={this.revertPreview}>
            Clear
          </button>
        </div>;
    }
  }

  render() {
    return <div>
      <hr />
      {this.inputs()}
      {this.buttons()}
    </div>;
  }
}
