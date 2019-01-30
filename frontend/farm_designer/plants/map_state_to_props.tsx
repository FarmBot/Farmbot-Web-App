import moment from "moment";
import { Everything } from "../../interfaces";
import { EditPlantInfoProps } from "../interfaces";
import {
  maybeFindPlantById, maybeFindPlantTemplateById, maybeGetTimeOffset
} from "../../resources/selectors";
import { history } from "../../history";
import { PlantStage } from "farmbot";
import * as _ from "lodash";
import { TaggedPlant } from "../map/interfaces";

export function mapStateToProps(props: Everything): EditPlantInfoProps {
  const openedSavedGarden =
    props.resources.consumers.farm_designer.openedSavedGarden;
  const gardenOpen = !!openedSavedGarden;
  const findPlant = (id: string | undefined) => {
    const num = parseInt(id || "NOPE", 10);
    if (_.isNumber(num) && !_.isNaN(num)) {
      return gardenOpen
        ? maybeFindPlantTemplateById(props.resources.index, num)
        : maybeFindPlantById(props.resources.index, num);
    }
  };

  return {
    openedSavedGarden,
    findPlant,
    push: history.push,
    dispatch: props.dispatch,
    timeOffset: maybeGetTimeOffset(props.resources.index),
  };
}

/**
 * All of the info a user would need to know about a plant, formatted and ready
 * to use by the UI.
 */
export interface FormattedPlantInfo {
  x: number;
  y: number;
  id: number | undefined;
  name: string;
  uuid: string;
  daysOld: number;
  plantedAt: moment.Moment;
  slug: string;
  plantStatus: PlantStage;
}

export function formatPlantInfo(rsrc: TaggedPlant): FormattedPlantInfo {
  const p = rsrc.body;
  const plantedAt = _.get(p, "planted_at", moment())
    ? moment(_.get(p, "planted_at", moment()))
    : moment(_.get(p, "created_at", moment()));
  const currentDay = moment();
  const daysOld = currentDay.diff(plantedAt, "days") + 1;
  return {
    slug: p.openfarm_slug,
    id: p.id,
    name: p.name,
    daysOld,
    x: p.x,
    y: p.y,
    uuid: rsrc.uuid,
    plantedAt,
    plantStatus: _.get(p, "plant_stage", "planned"),
  };
}
