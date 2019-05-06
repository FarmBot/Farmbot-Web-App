import { API } from "../api";

describe("API", () => {
  type L = typeof location;
  const fakeLocation = (input: Partial<L>) => input as L;
  it("requires initialization", () => {
    expect(() => API.current).toThrow();
    const BASE = "http://localhost:3000";
    API.setBaseUrl(BASE);
    [
      [API.current.pointSearchPath, BASE + "/api/points/search"],
      [API.current.allPointsPath, BASE + "/api/points/?filter=all"],
      [API.current.sensorReadingPath, BASE + "/api/sensor_readings"],
      [API.current.farmwareEnvPath, BASE + "/api/farmware_envs/"],
      [API.current.plantTemplatePath, BASE + "/api/plant_templates/"],
      [API.current.diagnosticDumpsPath, BASE + "/api/diagnostic_dumps/"],
      [API.current.farmwareInstallationPath, BASE + "/api/farmware_installations/"],
      [API.current.globalBulletinPath, BASE + "/api/global_bulletins/"],
      [API.current.accountSeedPath, BASE + "/api/device/seed"],
    ].map(x => expect(x[0]).toEqual(x[1]));
  });

  it("infers the correct port", () => {
    const xmp: [string, L][] = [
      ["3000", fakeLocation({ port: "3808" })],
      ["1234", fakeLocation({ port: "1234" })],
      ["80", fakeLocation({ port: undefined })],
      ["443", fakeLocation({ port: undefined, origin: "https://x.y.z" })],
    ];
    xmp.map(x => expect(API.inferPort(x[1])).toEqual(x[0]));
  });
});
