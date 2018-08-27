import { DropDownItem } from "../../../ui";
import { MarkAsState } from "../mark_as";

export type MarkableKind =
  | "Tool"
  | "Plant";

const KIND_MAP: Record<MarkableKind, MarkableKind> = { // For type safety later.
  Tool: "Tool",
  Plant: "Plant"
};

export const MARAKBLE_DDI_LOOKUP: Record<MarkableKind, DropDownItem> = {
  Tool: { label: "Tool", value: "Tool" },
  Plant: { label: "Plant", value: "Plant" },
};

export const MARK_AS_OBJECTS: DropDownItem[] =
  Object.values(MARAKBLE_DDI_LOOKUP);

export const MARK_AS_ACTIONS: Record<MarkableKind, DropDownItem[]> = {
  Tool: [
    { label: "Mounted", value: "mounted" },
    { label: "Dismounted", value: "dismounted" },
  ],
  Plant: [
    { label: "Planned", value: "planned" },
    { label: "Planted", value: "planted" },
    { label: "Harvested", value: "harvested" },
    { label: "Removed", value: "removed" }
  ]
};

const MARKABLE_KINDS = Object.keys(KIND_MAP);
// this.state.markableKind ? MARAKBLE_DDI_LOOKUP[this.state.markableKind] : undefined
export const selectedMarkableObject =
  (x: string | undefined): DropDownItem | undefined => {
    return isMarkableKind(x) ? MARAKBLE_DDI_LOOKUP[x] : undefined;
  };

export const isMarkableKind = (x: unknown): x is MarkableKind => {
  return (x && typeof (x) == "string" && MARKABLE_KINDS.includes(x));
};

type StateSetter = (s: MarkAsState) => void;

export const setObjectKind = (cb: StateSetter) => (d: DropDownItem) => {
  const { value } = d;
  cb({ markableKind: isMarkableKind(value) ? value : undefined });
};
