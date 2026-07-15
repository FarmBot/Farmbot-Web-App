import {
  anchorStargazingOrbit, loadStargazingCamera, parseStargazingCamera,
  saveStargazingCamera,
  STARGAZING_CAMERA_SESSION_KEY,
} from "../stargazing_camera";

describe("stargazing camera session", () => {
  beforeEach(() => sessionStorage.clear());

  it("saves and loads the camera for the browser session", () => {
    const camera = {
      position: [1, 2, 3] as [number, number, number],
      target: [4, 5, 6] as [number, number, number],
    };
    saveStargazingCamera(camera);
    expect(loadStargazingCamera()).toEqual(camera);
  });

  it("ignores invalid session data", () => {
    expect(parseStargazingCamera({
      position: [1, 2, Infinity],
      target: [4, 5, 6],
    })).toBeUndefined();
    sessionStorage.setItem(STARGAZING_CAMERA_SESSION_KEY, "not json");
    expect(loadStargazingCamera()).toBeUndefined();
  });

  it("orbits the view around a fixed telescope eyepiece", () => {
    expect(anchorStargazingOrbit({
      position: [100, 200, 300],
      target: [50, 250, 400],
    }, [10, 20, 30])).toEqual({
      position: [10, 20, 30],
      target: [-40, 70, 130],
    });
  });
});
