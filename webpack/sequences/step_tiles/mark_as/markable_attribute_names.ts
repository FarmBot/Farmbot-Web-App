export type MarkableAction =
  | "discarded_at"
  | "plant_stage"
  | "current_tool_id";

const markableActions: MarkableAction[] = [
  "discarded_at",
  "plant_stage",
  "current_tool_id",
];

export const isMarkableAction = (x: unknown): x is MarkableAction => {
  const y: string[] = markableActions;
  return (typeof x === "string") && y.includes(x);
};
