import React from "react";
import {
  PlantGridKey,
  PlantGridProps,
  PlantGridState,
} from "./interfaces";
import { initPlantGrid } from "./generate_grid";
import { init } from "../../api/crud";
import { uuid } from "farmbot";
import { saveGrid, stashGrid } from "./thunks";
import { error, success } from "../../toast/toast";
import { t } from "../../i18next_wrapper";
import { GridInput } from "./grid_input";
import { DEFAULT_PLANT_RADIUS } from "../../farm_designer/plant";
import { ToggleButton } from "../../ui";
import { Actions } from "../../constants";
import { round } from "lodash";

export class PlantGrid extends React.Component<PlantGridProps, PlantGridState> {
  state: PlantGridState = {
    grid: this.initGridState,
    gridId: uuid(),
    status: "clean",
    offsetPacking: false,
    cameraView: false,
    previous: "",
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
    this.setState({ grid }, this.performPreview);
  };

  onUseCurrentPosition = (position: Record<"x" | "y", number>) => {
    const grid = { ...this.state.grid, startX: position.x, startY: position.y };
    this.setState({ grid }, this.performPreview);
  };

  getKey = () => JSON.stringify({
    itemName: this.props.itemName,
    offsetPacking: this.state.offsetPacking,
    radius: this.props.radius,
    z: this.props.z,
    meta: this.props.meta,
  });

  componentDidUpdate = () => {
    if (this.state.status === "dirty" && this.getKey() != this.state.previous) {
      this.performPreview();
    }
  };

  componentWillUnmount() {
    (this.state.status === "dirty") &&
      this.props.dispatch(stashGrid(this.state.gridId));
    this.props.dispatch(showCameraViewPoints(undefined));
  }

  performPreview = () => {
    this.revertPreview({ setStatus: false })();
    if (this.plantCount > 100) {
      error(t("Please make a grid with less than 100 {{ itemType }}",
        { itemType: this.props.openfarm_slug ? t("plants") : t("points") }));
      return;
    }

    const plants = initPlantGrid({
      grid: this.state.grid,
      openfarm_slug: this.props.openfarm_slug,
      itemName: this.props.itemName,
      gridId: this.state.gridId,
      offsetPacking: this.state.offsetPacking,
      radius: this.props.radius,
      z: this.props.z,
      meta: this.props.meta,
    });
    plants.map(p => this.props.dispatch(init("Point", p)));
    this.setState({ status: "dirty", previous: this.getKey() });
  };

  revertPreview = ({ setStatus }: { setStatus: boolean }) => () =>
    this.props.dispatch(stashGrid(this.state.gridId))
      .then(() => setStatus && this.setState({ status: "clean" }));

  saveGrid = () =>
    this.props.dispatch(saveGrid(this.state.gridId))
      .then(() => {
        success(t("{{ count }} {{ pointType }} added.", {
          count: this.plantCount,
          pointType: this.props.openfarm_slug ? t("plants") : t("points")
        }));
        this.setState({
          grid: this.initGridState,
          gridId: uuid(),
          status: "clean",
        });
        this.props.close?.();
      });

  Buttons = () => {
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
  };

  render() {
    return <div className={"grid-and-row-planting"}>
      <hr />
      <h3>
        {this.props.openfarm_slug ? t("Grid and Row Planting") : t("Grid")}
      </h3>
      <GridInput
        key={JSON.stringify(this.state.grid)}
        itemType={this.props.openfarm_slug ? "plants" : "points"}
        xy_swap={this.props.xy_swap}
        disabled={this.state.status === "dirty"}
        grid={this.state.grid}
        botPosition={this.props.botPosition}
        onChange={this.onChange}
        onUseCurrentPosition={this.onUseCurrentPosition}
        preview={this.performPreview} />
      <HexPackingToggle value={this.state.offsetPacking}
        toggle={() => this.setState({
          offsetPacking: !this.state.offsetPacking,
          grid: {
            ...this.state.grid,
            spacingH: !this.state.offsetPacking
              ? round(0.866 * this.state.grid.spacingV)
              : this.state.grid.spacingH,
          },
        }, this.performPreview)} />
      {!this.props.openfarm_slug &&
        <ToggleCameraViewArea value={this.state.cameraView}
          toggle={() => {
            this.props.dispatch(showCameraViewPoints(
              this.state.cameraView ? undefined : this.state.gridId));
            this.setState({ cameraView: !this.state.cameraView },
              this.performPreview);
          }} />}
      <this.Buttons />
    </div>;
  }
}

const showCameraViewPoints = (gridId: string | undefined) => ({
  type: Actions.SHOW_CAMERA_VIEW_POINTS,
  payload: gridId,
});

interface ToggleProps {
  value: boolean;
  toggle(): void;
}

const HexPackingToggle = (props: ToggleProps) =>
  <div className={"grid-planting-toggle"}>
    <label className="packing-method">{t("hexagonal packing")}</label>
    <ToggleButton
      toggleValue={props.value}
      toggleAction={props.toggle}
      title={t("toggle packing method")}
      customText={{ textFalse: t("off"), textTrue: t("on") }} />
  </div>;

const ToggleCameraViewArea = (props: ToggleProps) =>
  <div className={"grid-planting-toggle"}>
    <label>{t("camera view area")}</label>
    <ToggleButton
      toggleValue={props.value}
      toggleAction={props.toggle}
      title={t("show camera view area")}
      customText={{ textFalse: t("off"), textTrue: t("on") }} />
  </div>;
