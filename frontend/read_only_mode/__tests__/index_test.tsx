import { buildResourceIndex } from "../../__test_support__/resource_index_builder";
import { appIsReadonly } from "..";
import { fakeWebAppConfig } from "../../__test_support__/fake_state/resources";

describe("appIsReadonly", () => {
  it("handles undefined resource indexes", () => {
    const result = appIsReadonly(buildResourceIndex([]).index);
    expect(result).toBe(true);
  });

  it("returns true when user_interface_read_only_mode == true", () => {
    const conf = fakeWebAppConfig();
    conf.body.user_interface_read_only_mode = true;
    const result =
      appIsReadonly(buildResourceIndex([conf]).index);
    expect(result).toBe(true);
  });

  it("returns false when user_interface_read_only_mode == false", () => {
    const conf = fakeWebAppConfig();
    conf.body.user_interface_read_only_mode = false;
    const result =
      appIsReadonly(buildResourceIndex([conf]).index);
    expect(result).toBe(false);
  });
});

// describe("readOnlyInterceptor", () => {
//   it("resolves the config when app is not read-only", () => {

//   });
// });
