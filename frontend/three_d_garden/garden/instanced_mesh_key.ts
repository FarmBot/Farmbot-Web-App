import { ThreeDGardenPlant } from "./plants";

export const instancedMeshKey = (plants: ThreeDGardenPlant[]) =>
  plants.map(plant =>
    [
      plant.id ?? "new",
      plant.icon,
      plant.x,
      plant.y,
      plant.size,
      plant.spread,
    ].join(":"))
    .join("|");
