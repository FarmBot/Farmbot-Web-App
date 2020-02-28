import * as React from "react";
import { FormattedPlantInfo } from "./map_state_to_props";
import { round } from "../map/util";
import { history } from "../../history";
import { BlurableInput, Row, Col } from "../../ui";
import { PlantOptions } from "../interfaces";
import { PlantStage } from "farmbot";
import { Moment } from "moment";
import moment from "moment";
import { Actions } from "../../constants";
import { Link } from "../../link";
import { DesignerPanelContent } from "../designer_panel";
import { parseIntInput } from "../../util";
import { startCase } from "lodash";
import { t } from "../../i18next_wrapper";
import { TimeSettings } from "../../interfaces";
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
  xyLocation: Record<"x" | "y", number>;
}

export const EditPlantLocation = (props: EditPlantLocationProps) => {
  const { xyLocation, updatePlant, uuid } = props;
  return <Row>
    {["x", "y"].map((axis: "x" | "y") =>
      <Col xs={6} key={axis}>
        <label style={{ marginTop: 0 }}>{t("{{axis}} (mm)", { axis })}</label>
        <BlurableInput
          type="number"
          value={xyLocation[axis]}
          min={0}
          onCommit={e => updatePlant(uuid, {
            [axis]: round(parseIntInput(e.currentTarget.value))
          })} />
      </Col>)}
  </Row>;
};

const chooseLocation = (to: Record<"x" | "y", number | undefined>) =>
  (dispatch: Function): Promise<void> => {
    dispatch({
      type: Actions.CHOOSE_LOCATION,
      payload: { x: to.x, y: to.y, z: undefined }
    });
    return Promise.resolve();
  };

interface MoveToPlantProps {
  x: number;
  y: number;
  dispatch: Function;
}

const MoveToPlant = (props: MoveToPlantProps) =>
  <button className="fb-button gray no-float"
    style={{ marginTop: "1rem" }}
    title={t("Move to this plant")}
    onClick={() => props.dispatch(chooseLocation({ x: props.x, y: props.y }))
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
  name: string;
  children: React.ReactChild;
}

export const ListItem = (props: ListItemProps) =>
  <li>
    <p>
      {props.name}
    </p>
    <div className={"plant-info-field-data"}>
      {props.children}
    </div>
  </li>;

export function PlantPanel(props: PlantPanelProps) {
  const {
    info, onDestroy, updatePlant, dispatch, inSavedGarden, timeSettings
  } = props;
  const { slug, plantedAt, daysOld, uuid, plantStatus } = info;
  const { x, y } = info;
  const destroy = () => onDestroy(uuid);
  return <DesignerPanelContent panelName={"plants"}>
    <label>
      {t("Plant Info")}
    </label>
    <ul>
      <ListItem name={t("Plant Type")}>
        <Link
          title={t("View crop info")}
          to={`/app/designer/plants/crop_search/` + slug}>
          {startCase(slug)}
        </Link>
      </ListItem>
      {(timeSettings && !inSavedGarden) &&
        <Row>
          <Col xs={7}>
            <ListItem name={t("Started")}>
              <EditDatePlanted
                uuid={uuid}
                datePlanted={plantedAt}
                timeSettings={timeSettings}
                updatePlant={updatePlant} />
            </ListItem>
          </Col>
          <Col xs={5}>
            <ListItem name={t("Age")}>
              {`${daysOld} ${t("days old")}`}
            </ListItem>
          </Col>
        </Row>}
      <ListItem name={t("Location")}>
        <EditPlantLocation uuid={uuid}
          xyLocation={{ x, y }}
          updatePlant={updatePlant} />
      </ListItem>
      <MoveToPlant x={x} y={y} dispatch={dispatch} />
      <ListItem name={t("Status")}>
        {(!inSavedGarden)
          ? <EditPlantStatus
            uuid={uuid}
            plantStatus={plantStatus}
            updatePlant={updatePlant} />
          : t(startCase(plantStatus))}
      </ListItem>
    </ul>
    <DeleteButtons destroy={destroy} />
  </DesignerPanelContent>;
}
