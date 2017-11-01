import { addGhostImage } from "../add_ghost_image";

describe("addGhostImage()", () => {
  it("modifies DOM elements correctly", () => {
    const dummyElement = document.createElement("div");
    const fake: React.DragEvent<HTMLElement> = {
      currentTarget: {
        cloneNode() {
          return dummyElement;
        }
      }
    } as any;
    const result = addGhostImage(fake);
    expect(result.style.left).toEqual("-30000px");
  });
});
