import { manifestInfo, manifestInfoPending } from "../generate_manifest_info";
import {
  fakeFarmwareManifestV1, fakeFarmwareManifestV2
} from "../../__test_support__/fake_farmwares";

describe("manifestInfo()", () => {
  it("generates info for v1 manifests", () => {
    const manifest = fakeFarmwareManifestV1();
    manifest.name = "My Farmware";
    const info = manifestInfo(manifest);
    expect(info).toEqual(expect.objectContaining({
      name: manifest.name,
      installation_pending: false,
      meta: expect.objectContaining({ version: "0.0.0" })
    }));
  });

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

  it("doesn't display version string", () => {
    const manifest = fakeFarmwareManifestV1();
    manifest.name = "My Farmware";
    manifest.meta.min_os_version_major = "";
    const info = manifestInfo(manifest);
    expect(info).toEqual(expect.objectContaining({
      name: manifest.name,
      installation_pending: false,
      meta: expect.objectContaining({ fbos_version: "" })
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
