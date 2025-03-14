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
import { Collapse } from "@blueprintjs/core";

export class PlantGrid extends React.Component<PlantGridProps, PlantGridState> {
  state: PlantGridState = {
    grid: this.initGridState,
    gridId: uuid(),
    status: "clean",
    offsetPacking: false,
    cameraView: false,
    previous: "",
    autoPreview: true,
    isOpen: true,
  };

  get initGridState() {
    const spread = (this.props.spread || DEFAULT_PLANT_RADIUS) * 10;
    const gridStart = this.props.designer?.gridStart || { x: 100, y: 100 };
    return {
      startX: gridStart.x,
      startY: gridStart.y,
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
    ["startX", "startY"].includes(key) &&
      this.props.dispatch({
        type: Actions.SET_GRID_START,
        payload: { x: grid.startX, y: grid.startY },
      });
    this.setState({ grid }, this.performPreview());
  };

  onUseCurrentPosition = (position: Record<"x" | "y", number>) => {
    const grid = { ...this.state.grid, startX: position.x, startY: position.y };
    this.setState({ grid }, this.performPreview());
  };

  getKey = () => JSON.stringify({
    itemName: this.props.itemName,
    grid: this.state.grid,
    offsetPacking: this.state.offsetPacking,
    radius: this.props.radius || this.props.designer?.cropRadius,
    z: this.props.z,
    meta: this.props.meta,
    plantStage: this.props.designer?.cropStage,
    plantedAt: this.props.designer?.cropPlantedAt,
    waterCurveId: this.props.designer?.cropWaterCurveId,
    spreadCurveId: this.props.designer?.cropSpreadCurveId,
    heightCurveId: this.props.designer?.cropHeightCurveId,
  });

  get outdated() { return this.getKey() != this.state.previous; }
  get dirty() { return this.state.status === "dirty"; }

  componentDidUpdate = () => {
    if (this.dirty && this.outdated) {
      this.performPreview()();
    }
  };

  componentWillUnmount() {
    this.dirty &&
      this.props.dispatch(stashGrid(this.state.gridId));
    this.props.dispatch(showCameraViewPoints(undefined));
  }

  performPreview = (force = false) => () => {
    if (!this.state.autoPreview && !force) { return; }
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
      designer: this.props.designer,
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
        }, this.props.close);
      });

  Buttons = () => {
    switch (this.state.status) {
      case "clean":
        return <div className={"preview-grid-button"}>
          <a className={"preview-button fb-button clear invert"}
            title={t("Preview")}
            onClick={this.performPreview(true)}>
            {t("Preview")}
          </a>
        </div>;
      case "dirty":
        return <div className={"save-or-cancel-grid-button"}>
          <a className={"cancel-button fb-button clear invert"}
            title={t("Cancel")}
            onClick={this.revertPreview({ setStatus: true })}>
            {t("Cancel")}
          </a>
          {this.outdated && this.dirty
            ? <a className={"update-button fb-button clear invert"}
              title={t("Update preview")}
              onClick={this.performPreview(true)}>
              {t("Update preview")}
            </a>
            : <a className={"save-button fb-button clear invert"}
              title={t("Save")}
              onClick={this.saveGrid}>
              {t("Save")}
            </a>}
        </div>;
    }
  };

  render() {
    return <div className={"grid-and-row-planting"}>
      {this.props.collapsible &&
        <i className={`fa fa-chevron-${this.state.isOpen ? "up" : "down"}`}
          onClick={() => this.setState({ isOpen: !this.state.isOpen })} />}
      <h3>{t("Add Grid or Row")}</h3>
      <Collapse isOpen={this.props.collapsible ? this.state.isOpen : true}>
        <GridInput
          key={JSON.stringify(this.state.grid)}
          itemType={this.props.openfarm_slug ? "plants" : "points"}
          xy_swap={this.props.xy_swap}
          disabled={this.dirty}
          grid={this.state.grid}
          botPosition={this.props.botPosition}
          onChange={this.onChange}
          onUseCurrentPosition={this.onUseCurrentPosition}
          preview={this.performPreview()} />
        <HexPackingToggle value={this.state.offsetPacking}
          toggle={() => this.setState({
            offsetPacking: !this.state.offsetPacking,
            grid: {
              ...this.state.grid,
              spacingH: !this.state.offsetPacking
                ? round(0.866 * this.state.grid.spacingV)
                : this.state.grid.spacingH,
            },
          }, this.performPreview())} />
        {!this.props.openfarm_slug &&
          <ToggleCameraViewArea value={this.state.cameraView}
            toggle={() => {
              this.props.dispatch(showCameraViewPoints(
                this.state.cameraView ? undefined : this.state.gridId));
              this.setState({ cameraView: !this.state.cameraView },
                this.performPreview());
            }} />}
        <div className={"row grid-exp-1"}>
          <label>{t("auto-update preview")}</label>
          <ToggleButton
            toggleValue={this.state.autoPreview}
            toggleAction={() => {
              const enabled = this.state.autoPreview;
              if (!enabled) { this.performPreview(true); }
              this.setState({ autoPreview: !enabled });
            }}
            title={t("automatically update preview")} />
        </div>
        <this.Buttons />
      </Collapse>
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
  <div className={"row grid-exp-1"}>
    <label className="packing-method">{t("hexagonal packing")}</label>
    <ToggleButton
      toggleValue={props.value}
      toggleAction={props.toggle}
      title={t("toggle packing method")}
      customText={{ textFalse: t("off"), textTrue: t("on") }} />
  </div>;

const ToggleCameraViewArea = (props: ToggleProps) =>
  <div className={"row grid-exp-1"}>
    <label>{t("camera view area")}</label>
    <ToggleButton
      toggleValue={props.value}
      toggleAction={props.toggle}
      title={t("show camera view area")}
      customText={{ textFalse: t("off"), textTrue: t("on") }} />
  </div>;
