import React from "react";
import {
  PlantGridKey,
  PlantGridProps,
  PlantGridState,
} from "./interfaces";
import { initPlantGrid } from "./generate_grid";
import { init } from "../../../api/crud";
import { uuid } from "farmbot";
import { saveGrid, stashGrid } from "./thunks";
import { error, success } from "../../../toast/toast";
import { t } from "../../../i18next_wrapper";
import { GridInput } from "./grid_input";
import { DEFAULT_PLANT_RADIUS } from "../../plant";
import { ToggleButton } from "../../../controls/toggle_button";

export class PlantGrid extends React.Component<PlantGridProps, PlantGridState> {
  state: PlantGridState = {
    grid: this.initGridState,
    gridId: uuid(),
    status: "clean",
    offsetPacking: false,
  };

  get initGridState() {
    const spread = (this.props.spread || DEFAULT_PLANT_RADIUS) * 10;
    return {
      startX: 100,
      startY: 100,
      spacingH: spread,
      spacingV: spread,
      numPlantsH: 2,
      numPlantsV: 3,
    };
  }

  get plantCount() {
    const { numPlantsH, numPlantsV } = this.state.grid;
    return numPlantsH * numPlantsV;
  }

  onChange = (key: PlantGridKey, val: number) => {
    const grid = { ...this.state.grid, [key]: val };
    this.setState({ grid });
  };

  onUseCurrentPosition = (position: Record<"x" | "y", number>) => {
    const grid = { ...this.state.grid, startX: position.x, startY: position.y };
    this.setState({ grid }, this.performPreview);
  };

  confirmUnsaved = () => {
    const prompt = t("You have unsaved changes. Would you like to save them?");
    const action = confirm(prompt) ?
      saveGrid(this.state.gridId) : stashGrid(this.state.gridId);
    this.props.dispatch(action);
  }

  componentWillUnmount() {
    (this.state.status === "dirty") && this.confirmUnsaved();
  }

  performPreview = () => {
    this.revertPreview({ setStatus: false })();
    if (this.plantCount > 100) {
      error(t("Please make a grid with less than 100 plants"));
      return;
    }

    const plants = initPlantGrid({
      grid: this.state.grid,
      openfarm_slug: this.props.openfarm_slug,
      cropName: this.props.cropName,
      gridId: this.state.gridId,
      offsetPacking: this.state.offsetPacking,
    });
    plants.map(p => this.props.dispatch(init("Point", p)));
    this.setState({ status: "dirty" });
  }

  revertPreview = ({ setStatus }: { setStatus: boolean }) => () =>
    this.props.dispatch(stashGrid(this.state.gridId))
      .then(() => setStatus && this.setState({ status: "clean" }));

  saveGrid = () =>
    this.props.dispatch(saveGrid(this.state.gridId))
      .then(() => {
        success(t("{{ count }} plants added.", { count: this.plantCount }));
        this.setState({
          grid: this.initGridState,
          gridId: uuid(),
          status: "clean",
        });
      });

  buttons = () => {
    switch (this.state.status) {
      case "clean":
        return <div className={"preview-grid-button"}>
          <a className={"preview-button"}
            title={t("Preview")}
            onClick={this.performPreview}>
            {t("Preview")}
          </a>
        </div>;
      case "dirty":
        return <div className={"save-or-cancel-grid-button"}>
          <a className={"cancel-button"}
            title={t("Cancel")}
            onClick={this.revertPreview({ setStatus: true })}>
            {t("Cancel")}
          </a>
          <a className={"save-button"}
            title={t("Save")}
            onClick={this.saveGrid}>
            {t("Save")}
          </a>
        </div>;
    }
  }

  render() {
    return <div className={"grid-and-row-planting"}>
      <hr />
      <h3>
        {t("Grid and Row Planting")}
      </h3>
      <GridInput
        xy_swap={this.props.xy_swap}
        disabled={this.state.status === "dirty"}
        grid={this.state.grid}
        botPosition={this.props.botPosition}
        onChange={this.onChange}
        onUseCurrentPosition={this.onUseCurrentPosition}
        preview={this.performPreview} />
      <label className="packing-method">{t("hexagonal packing")}</label>
      <ToggleButton
        toggleValue={this.state.offsetPacking}
        toggleAction={() => {
          this.setState({ offsetPacking: !this.state.offsetPacking },
            this.performPreview);
        }}
        title={t("toggle packing method")}
        customText={{ textFalse: t("off"), textTrue: t("on") }} />
      {this.buttons()}
    </div>;
  }
}
