import { ResourceIndex } from "../../../resources/interfaces";
import { DropDownItem } from "../../../ui/fb_select";
import { selectAllPoints } from "../../../resources/selectors";
import { TaggedPoint, TaggedPlantPointer } from "farmbot";
import { GenericPointer } from "farmbot/dist/resources/api_resources";

const value = 0; // Not used in headings.

const PLANT_HEADER: DropDownItem = {
  headingId: "Plant",
  label: "Plants",
  value,
  heading: true
};

const POINT_HEADER: DropDownItem = {
  headingId: "GenericPointer",
  label: "Points",
  value,
  heading: true
};

export const TOP_HALF = [
  { headingId: "Device", label: "Device", value, heading: true, },
  { headingId: "Device", label: "Tool Mount", value }
];

const isRelevant = (x: TaggedPoint) => {
  const saved = !!x.body.id;
  const notToolSlot = x.body.pointer_type !== "ToolSlot";
  return saved && notToolSlot;
};

const pointer2ddi = (i: GenericPointer): DropDownItem => {
  const { x, y, z, name } = i;
  return {
    value: i.id as number,
    label: `${name} (${x}, ${y}, ${z})`,
    headingId: "GenericPointer"
  };
};

export const plant2ddi = (i: TaggedPlantPointer["body"]): DropDownItem => {
  const { x, y, z, name, id } = i;
  const n = name || i.openfarm_slug || `Plant ${id}`;
  return {
    value: i.id as number,
    label: `${n} (${x}, ${y}, ${z})`,
    headingId: "Plant"
  };
};

const pointList =
  (input: TaggedPoint[]): DropDownItem[] => {
    const points: DropDownItem[] = [POINT_HEADER];
    const plants: DropDownItem[] = [PLANT_HEADER];
    input
      .map(x => x.body)
      .forEach(body => {
        switch (body.pointer_type) {
          case "GenericPointer": return points.push(pointer2ddi(body));
          case "Plant": return plants.push(plant2ddi(body));
        }
      });
    return [...plants, ...points];
  };

export const resourceList = (r: ResourceIndex): DropDownItem[] => {
  return [...TOP_HALF, ...pointList(selectAllPoints(r).filter(isRelevant))];
};
