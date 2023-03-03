import React from "react";
import { FormattedPlantInfo } from "./map_state_to_props";
import { push } from "../history";
import { BlurableInput, Row, Col, Help } from "../ui";
import {
  PlantStage, TaggedCurve, TaggedFarmwareEnv, TaggedGenericPointer,
  TaggedPlantPointer, Xyz,
} from "farmbot";
import moment, { Moment } from "moment";
import { Link } from "../link";
import { DesignerPanelContent } from "../farm_designer/designer_panel";
import { parseIntInput } from "../util";
import { isUndefined, startCase } from "lodash";
import { t } from "../i18next_wrapper";
import { MovementState, TimeSettings } from "../interfaces";
import { EditPlantStatus } from "./edit_plant_status";
import {
  getZAtLocation,
} from "../farm_designer/map/layers/points/interpolation_map";
import { Path } from "../internal_urls";
import { Actions } from "../constants";
import { daysOldText } from "./plant_inventory_item";
import { GoToThisLocationButton } from "../farm_designer/move_to";
import { BotPosition, SourceFbosConfig } from "../devices/interfaces";
import { AllCurveInfo, CURVE_KEY_LOOKUP } from "./curve_info";
import { BotSize } from "../farm_designer/map/interfaces";
import { UpdatePlant } from "./plant_info";
import { DevSettings } from "../settings/dev/dev_support";

export interface PlantPanelProps {
  info: FormattedPlantInfo;
  onDestroy(uuid: string): void;
  updatePlant: UpdatePlant;
  inSavedGarden: boolean;
  dispatch: Function;
  timeSettings?: TimeSettings;
  soilHeightPoints: TaggedGenericPointer[];
  farmwareEnvs: TaggedFarmwareEnv[];
  botOnline: boolean;
  defaultAxes: string;
  arduinoBusy: boolean;
  currentBotLocation: BotPosition;
  movementState: MovementState;
  sourceFbosConfig: SourceFbosConfig;
  botSize: BotSize;
  curves: TaggedCurve[];
  plants: TaggedPlantPointer[];
}

interface EditPlantProperty {
  uuid: string;
  updatePlant: UpdatePlant;
}

export interface EditPlantStatusProps extends EditPlantProperty {
  plantStatus: PlantStage;
}

export interface EditDatePlantedProps extends EditPlantProperty {
  datePlanted: Moment;
  timeSettings: TimeSettings;
}

export const EditDatePlanted = (props: EditDatePlantedProps) => {
  const { datePlanted, updatePlant, uuid, timeSettings } = props;
  return <BlurableInput
    type="date"
    value={datePlanted.utcOffset(timeSettings.utcOffset).format("YYYY-MM-DD")}
    onCommit={e => updatePlant(uuid, {
      planted_at: moment(e.currentTarget.value)
        .utcOffset(timeSettings.utcOffset).toISOString()
    })} />;
};

export interface EditPlantLocationProps extends EditPlantProperty {
  plantLocation: Record<Xyz, number>;
  soilHeightPoints: TaggedGenericPointer[];
  farmwareEnvs: TaggedFarmwareEnv[];
}

export const EditPlantLocation = (props: EditPlantLocationProps) => {
  const { plantLocation, updatePlant, uuid } = props;
  const soilZ = getZAtLocation({
    x: plantLocation.x,
    y: plantLocation.y,
    points: props.soilHeightPoints,
    farmwareEnvs: props.farmwareEnvs,
  });
  return <Row>
    {["x", "y", "z"].map((axis: Xyz) =>
      <Col xs={4} key={axis}>
        <label style={{ marginTop: 0 }}>{t("{{axis}} (mm)", { axis })}</label>
        {axis == "z" && !isUndefined(soilZ) &&
          <Help text={`${t("soil height at plant location")}: ${soilZ}mm`} />}
        <BlurableInput
          type="number"
          value={plantLocation[axis]}
          min={axis == "z" ? undefined : 0}
          onCommit={e => updatePlant(uuid, {
            [axis]: parseIntInput(e.currentTarget.value)
          })} />
      </Col>)}
  </Row>;
};

export interface EditPlantRadiusProps extends EditPlantProperty {
  radius: number;
}

export const EditPlantRadius = (props: EditPlantRadiusProps) =>
  <Row>
    <Col xs={6}>
      <label style={{ marginTop: 0 }}>{t("radius (mm)")}</label>
      <BlurableInput
        type="number"
        name="radius"
        value={props.radius}
        min={0}
        onCommit={e => props.updatePlant(props.uuid, {
          radius: parseIntInput(e.currentTarget.value)
        })} />
    </Col>
  </Row>;

export interface EditPlantDepthProps extends EditPlantProperty {
  depth: number;
}

export const EditPlantDepth = (props: EditPlantDepthProps) =>
  <Row>
    <Col xs={6}>
      <label style={{ marginTop: 0 }}>{t("depth (mm)")}</label>
      <BlurableInput
        type="number"
        name="depth"
        value={props.depth}
        min={0}
        onCommit={e => props.updatePlant(props.uuid, {
          depth: parseIntInput(e.currentTarget.value)
        })} />
    </Col>
  </Row>;

interface DeleteButtonsProps {
  destroy(): void;
}

const DeleteButtons = (props: DeleteButtonsProps) =>
  <div className={"plant-delete-buttons"}>
    <div className={"plant-delete-button-label"}>
      <label>
        {t("Delete this plant")}
      </label>
    </div>
    <button
      className="fb-button red no-float"
      title={t("Delete")}
      onClick={props.destroy}>
      {t("Delete")}
    </button>
    <button
      className="fb-button gray no-float"
      style={{ marginRight: "10px" }}
      title={t("Delete multiple")}
      onClick={() => push(Path.plants("select"))}>
      {t("Delete multiple")}
    </button>
  </div>;

interface ListItemProps {
  name?: string;
  children: React.ReactChild | React.ReactChild[];
}

export const ListItem = (props: ListItemProps) =>
  <li>
    {props.name &&
      <label>
        {props.name}
      </label>}
    <div className={"plant-info-field-data"}>
      {props.children}
    </div>
  </li>;

export function PlantPanel(props: PlantPanelProps) {
  const {
    info, onDestroy, updatePlant, dispatch, inSavedGarden, timeSettings
  } = props;
  const { slug, plantedAt, daysOld, uuid, plantStatus } = info;
  const { x, y, z } = info;
  const destroy = () => onDestroy(uuid);
  const commonProps = { uuid, updatePlant };
  return <DesignerPanelContent panelName={"plants"}>
    <ul>
      <ListItem name={t("Plant Type")}>
        <Link
          title={t("View crop info")}
          to={Path.cropSearch(slug)}>
          {startCase(slug)}
        </Link>
        <i className={"fa fa-pencil"}
          onClick={() => {
            dispatch({ type: Actions.SET_PLANT_TYPE_CHANGE_ID, payload: info.id });
            dispatch({ type: Actions.SET_SLUG_BULK, payload: undefined });
            push(Path.cropSearch());
          }} />
      </ListItem>
      {(timeSettings && !inSavedGarden) &&
        <Row>
          <Col xs={7}>
            <ListItem name={t("Started")}>
              <EditDatePlanted {...commonProps}
                datePlanted={plantedAt}
                timeSettings={timeSettings} />
            </ListItem>
          </Col>
          <Col xs={5}>
            <ListItem name={t("Age")}>
              {daysOldText(daysOld)}
            </ListItem>
          </Col>
        </Row>}
      <ListItem>
        <EditPlantLocation {...commonProps}
          plantLocation={{ x, y, z }}
          soilHeightPoints={props.soilHeightPoints}
          farmwareEnvs={props.farmwareEnvs} />
      </ListItem>
      <GoToThisLocationButton
        dispatch={props.dispatch}
        locationCoordinate={{ x, y, z }}
        botOnline={props.botOnline}
        arduinoBusy={props.arduinoBusy}
        currentBotLocation={props.currentBotLocation}
        movementState={props.movementState}
        defaultAxes={props.defaultAxes} />
      <ListItem>
        <EditPlantRadius {...commonProps} radius={info.radius} />
      </ListItem>
      {!isUndefined(info.depth) && <ListItem>
        <EditPlantDepth {...commonProps} depth={info.depth} />
      </ListItem>}
      <ListItem name={t("Status")}>
        {(!inSavedGarden)
          ? <EditPlantStatus {...commonProps} plantStatus={plantStatus} />
          : t(startCase(plantStatus))}
      </ListItem>
      {DevSettings.futureFeaturesEnabled() && info.uuid.startsWith("Point") &&
        <AllCurveInfo
          dispatch={props.dispatch}
          sourceFbosConfig={props.sourceFbosConfig}
          botSize={props.botSize}
          farmwareEnvs={props.farmwareEnvs}
          soilHeightPoints={props.soilHeightPoints}
          curves={props.curves}
          plants={props.plants}
          plant={info}
          findCurve={curveType => props.curves.filter(curve =>
            curve.body.id == info[CURVE_KEY_LOOKUP[curveType
            ] as keyof FormattedPlantInfo])[0]}
          onChange={(id, curveType) =>
            updatePlant(info.uuid, { [CURVE_KEY_LOOKUP[curveType]]: id }, true)} />}
      {Object.entries(info.meta || {}).map(([key, value]) => {
        switch (key) {
          case "gridId":
            return <div key={key} className={`meta-${key}-not-displayed`} />;
          default:
            return <ListItem key={key} name={key}>{value || ""}</ListItem>;
        }
      })}
    </ul>
    <DeleteButtons destroy={destroy} />
  </DesignerPanelContent>;
}
