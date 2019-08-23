import * as React from "react";
import { FormattedPlantInfo } from "./map_state_to_props";
import { round } from "../map/util";
import { history } from "../../history";
import { FBSelect, DropDownItem, BlurableInput, Row, Col } from "../../ui";
import { PlantOptions } from "../interfaces";
import { PlantStage } from "farmbot";
import { Moment } from "moment";
import moment from "moment";
import { Actions } from "../../constants";
import { Link } from "../../link";
import { DesignerPanelContent } from "./designer_panel";
import { parseIntInput } from "../../util";
import { startCase } from "lodash";
import { t } from "../../i18next_wrapper";
import { TimeSettings } from "../../interfaces";

export interface PlantPanelProps {
  info: FormattedPlantInfo;
  onDestroy(uuid: string): void;
  updatePlant(uuid: string, update: PlantOptions): void;
  inSavedGarden: boolean;
  dispatch: Function;
  timeSettings?: TimeSettings;
}

export const PLANT_STAGES: DropDownItem[] = [
  { value: "planned", label: t("Planned") },
  { value: "planted", label: t("Planted") },
  { value: "sprouted", label: t("Sprouted") },
  { value: "harvested", label: t("Harvested") },
];

export const PLANT_STAGES_DDI = {
  [PLANT_STAGES[0].value]: {
    label: PLANT_STAGES[0].label,
    value: PLANT_STAGES[0].value
  },
  [PLANT_STAGES[1].value]: {
    label: PLANT_STAGES[1].label,
    value: PLANT_STAGES[1].value
  },
  [PLANT_STAGES[2].value]: {
    label: PLANT_STAGES[2].label,
    value: PLANT_STAGES[2].value
  },
  [PLANT_STAGES[3].value]: {
    label: PLANT_STAGES[3].label,
    value: PLANT_STAGES[3].value
  },
};

interface EditPlantProperty {
  uuid: string;
  updatePlant(uuid: string, update: PlantOptions): void;
}

export interface EditPlantStatusProps extends EditPlantProperty {
  plantStatus: PlantStage;
}

export function EditPlantStatus(props: EditPlantStatusProps) {
  const { plantStatus, updatePlant, uuid } = props;
  return <FBSelect
    list={PLANT_STAGES}
    selectedItem={PLANT_STAGES_DDI[plantStatus]}
    onChange={e => {
      const plant_stage = e.value as PlantStage;
      const update: PlantOptions = { plant_stage };
      switch (plant_stage) {
        case "planned":
          update.planted_at = undefined;
          break;
        case "planted":
          update.planted_at = moment().toISOString();
      }
      updatePlant(uuid, update);
    }} />;
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
  location: Record<"x" | "y", number>;
}

export const EditPlantLocation = (props: EditPlantLocationProps) => {
  const { location, updatePlant, uuid } = props;
  return <Row>
    {["x", "y"].map((axis: "x" | "y") =>
      <Col xs={6} key={axis}>
        <label style={{ marginTop: 0 }}>{t("{{axis}} (mm)", { axis })}</label>
        <BlurableInput
          type="number"
          value={location[axis]}
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
    onClick={() => props.dispatch(chooseLocation({ x: props.x, y: props.y }))
      .then(() => history.push("/app/designer/move_to"))}>
    {t("Move FarmBot to this plant")}
  </button>;

interface DeleteButtonsProps {
  destroy(): void;
}

const DeleteButtons = (props: DeleteButtonsProps) =>
  <div>
    <div>
      <label>
        {t("Delete this plant")}
      </label>
    </div>
    <button
      className="fb-button red no-float"
      onClick={props.destroy}>
      {t("Delete")}
    </button>
    <button
      className="fb-button gray no-float"
      style={{ marginRight: "10px" }}
      onClick={() => history.push("/app/designer/plants/select")} >
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
    <div>
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
          location={{ x, y }}
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
