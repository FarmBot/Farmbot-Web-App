import { manifestInfo, manifestInfoPending } from "../generate_manifest_info";
import { fakeFarmwareManifestV2 } from "../../__test_support__/fake_farmwares";

describe("manifestInfo()", () => {
  it("generates info for v2 manifests", () => {
    const manifest = fakeFarmwareManifestV2();
    manifest.package = "My Farmware";
    const info = manifestInfo(manifest);
    expect(info).toEqual(expect.objectContaining({
      name: manifest.package,
      installation_pending: false,
      meta: expect.objectContaining({ version: "0.0.0" })
    }));
  });
});

describe("manifestInfoPending()", () => {
  it("generates info for Farmware pending installation", () => {
    const info = manifestInfoPending("my farmware", "https://");
    expect(info).toEqual(expect.objectContaining({
      name: "my farmware",
      installation_pending: true,
      meta: expect.objectContaining({ version: "" })
    }));
  });
});
