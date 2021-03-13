import React from "react";
import { FormattedPlantInfo } from "./map_state_to_props";
import { round } from "../farm_designer/map/util";
import { history } from "../history";
import { BlurableInput, Row, Col } from "../ui";
import { PlantOptions } from "../farm_designer/interfaces";
import { PlantStage, Xyz } from "farmbot";
import moment, { Moment } from "moment";
import { Actions } from "../constants";
import { Link } from "../link";
import { DesignerPanelContent } from "../farm_designer/designer_panel";
import { parseIntInput } from "../util";
import { startCase } from "lodash";
import { t } from "../i18next_wrapper";
import { TimeSettings } from "../interfaces";
import { EditPlantStatus } from "./edit_plant_status";

export interface PlantPanelProps {
  info: FormattedPlantInfo;
  onDestroy(uuid: string): void;
  updatePlant(uuid: string, update: PlantOptions): void;
  inSavedGarden: boolean;
  dispatch: Function;
  timeSettings?: TimeSettings;
}

interface EditPlantProperty {
  uuid: string;
  updatePlant(uuid: string, update: PlantOptions): void;
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
}

export const EditPlantLocation = (props: EditPlantLocationProps) => {
  const { plantLocation, updatePlant, uuid } = props;
  return <Row>
    {["x", "y", "z"].map((axis: Xyz) =>
      <Col xs={4} key={axis}>
        <label style={{ marginTop: 0 }}>{t("{{axis}} (mm)", { axis })}</label>
        <BlurableInput
          type="number"
          value={plantLocation[axis]}
          min={axis == "z" ? undefined : 0}
          onCommit={e => updatePlant(uuid, {
            [axis]: round(parseIntInput(e.currentTarget.value))
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

const chooseLocation = (to: Record<Xyz, number | undefined>) =>
  (dispatch: Function): Promise<void> => {
    dispatch({
      type: Actions.CHOOSE_LOCATION,
      payload: { x: to.x, y: to.y, z: to.z }
    });
    return Promise.resolve();
  };

interface MoveToPlantProps {
  x: number;
  y: number;
  z: number;
  dispatch: Function;
}

const MoveToPlant = (props: MoveToPlantProps) =>
  <button className={"fb-button gray no-float"}
    style={{ marginTop: "1rem" }}
    title={t("Move to this plant")}
    onClick={() =>
      props.dispatch(chooseLocation({ x: props.x, y: props.y, z: props.z }))
        .then(() => history.push("/app/designer/move_to"))}>
    {t("Move FarmBot to this plant")}
  </button>;

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
      onClick={() => history.push("/app/designer/plants/select")}>
      {t("Delete multiple")}
    </button>
  </div>;

interface ListItemProps {
  name?: string;
  children: React.ReactChild;
}

export const ListItem = (props: ListItemProps) =>
  <li>
    {props.name &&
      <p>
        {props.name}
      </p>}
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
    <label>
      {t("Plant Info")}
    </label>
    <ul>
      <ListItem name={t("Plant Type")}>
        <Link
          title={t("View crop info")}
          to={`/app/designer/plants/crop_search/${slug}`}>
          {startCase(slug)}
        </Link>
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
              {`${daysOld} ${t("days old")}`}
            </ListItem>
          </Col>
        </Row>}
      <ListItem name={t("Location")}>
        <EditPlantLocation {...commonProps} plantLocation={{ x, y, z }} />
      </ListItem>
      <MoveToPlant x={x} y={y} z={z} dispatch={dispatch} />
      <ListItem name={t("Size")}>
        <EditPlantRadius {...commonProps} radius={info.radius} />
      </ListItem>
      <ListItem name={t("Status")}>
        {(!inSavedGarden)
          ? <EditPlantStatus {...commonProps} plantStatus={plantStatus} />
          : t(startCase(plantStatus))}
      </ListItem>
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
