import { ResourceIndex } from "../../../resources/interfaces";
import { DropDownItem } from "../../../ui/fb_select";
import { selectAllPoints } from "../../../resources/selectors";
import { TaggedPoint, TaggedPlantPointer } from "farmbot";
import { GenericPointer } from "farmbot/dist/resources/api_resources";
import { POINT_HEADER, PLANT_HEADER, TOP_HALF } from "./constants";

/** Filter function to remove resources we don't care about,
 * such as ToolSlots and unsaved (Plant|Point)'s */
const isRelevant = (x: TaggedPoint) => {
  const saved = !!x.body.id;
  const notToolSlot = x.body.pointer_type !== "ToolSlot";
  return saved && notToolSlot;
};

/** Format DropDownItem["label"] as "Name (1, 2, 3)" */
const labelStr =
  (n: string, x: number, y: number, z: number) => `${n} (${x}, ${y}, ${z})`;

/** Convert a GenericPointer to a DropDownItem that is formatted appropriately
 * for the "Mark As.." step. */
export const pointer2ddi = (i: GenericPointer): DropDownItem => {
  const { x, y, z, name } = i;
  return {
    value: i.id as number,
    label: labelStr(name, x, y, z),
    headingId: "GenericPointer"
  };
};

/** Convert a PlantPointer to a DropDownItem appropriately formatted for the
 * "Mark As.." step. */
export const plant2ddi = (i: TaggedPlantPointer["body"]): DropDownItem => {
  const { x, y, z, name, id } = i;

  return {
    value: id as number,
    label: labelStr(name, x, y, z),
    headingId: "Plant"
  };
};

/** GIVEN: mixed list of *SAVED* point types (ToolSlot, Plant, Pointer)
 * RETURNS: list of DropDownItems with proper headers and `headerId`s */
const pointList =
  (input: TaggedPoint[]): DropDownItem[] => {
    const genericPoints: DropDownItem[] = [POINT_HEADER];
    const plants: DropDownItem[] = [PLANT_HEADER];
    input
      .map(x => x.body)
      .forEach(body => {
        switch (body.pointer_type) {
          case "GenericPointer": return genericPoints.push(pointer2ddi(body));
          case "Plant": return plants.push(plant2ddi(body));
        }
      });
    return [...plants, ...genericPoints];
  };

/** Creates a formatted DropDownItem list for the "Resource" (left hand) side of
 * the "Mark As" step. */
export const resourceList = (r: ResourceIndex): DropDownItem[] => {
  return [...TOP_HALF, ...pointList(selectAllPoints(r).filter(isRelevant))];
};
