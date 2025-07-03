import { buildResourceIndex } from "../../__test_support__/resource_index_builder";
import {
  fakeSequence, fakeToolSlot,
} from "../../__test_support__/fake_state/resources";
jest.mock("../../redux/store", () => ({
  store: {
    dispatch: jest.fn(),
    getState: () => ({
      resources: buildResourceIndex([fakeToolSlot()]),
      bot: { hardware: { location_data: undefined } },
    }),
  },
}));

import { ParameterApplication, TaggedSequence } from "farmbot";
import { Actions } from "../../constants";
import { store } from "../../redux/store";
import { info } from "../../toast/toast";
import { runDemoSequence } from "../lua_runner";

const code = `
  n = variable("Number")
  print(n)
  api{method = "GET", url = "/api/points"}
  api{method = "POST", url = "/api/points"}
  api{method = "GET", url = "/api/tools"}
  pairs({})
  os.time()
  move_absolute(0, 0, 0)
  wait(1000)
  move_absolute(300, 0, 0)
  move_absolute(350, 0, 0)
  write_pin(8, "digital", 1)
  wait(1000)
  write_pin(8, "digital", 0)
  send_message("info", "msg", "toast")
  send_message("success", "msg", "toast")
  set_job_progress("job", {
    percent = 50,
    status = "working",
    time = os.time() * 1000
  })
  set_job_progress("job", {
    percent = 100,
    status = "Complete",
    time = os.time() * 1000
  })
  `;

describe("runDemoSequence()", () => {
  beforeEach(() => {
    localStorage.setItem("myBotIs", "online");
  });

  it("runs sequence", () => {
    const sequence = fakeSequence();
    sequence.body.body = [{ kind: "lua", args: { lua: code } }];
    sequence.body.id = 1;
    const point = fakeToolSlot();
    const ri = buildResourceIndex([sequence, point]).index;
    const variables: ParameterApplication[] = [{
      kind: "parameter_application",
      args: {
        label: "Number",
        data_value: { kind: "numeric", args: { number: 1 } },
      },
    }];
    console.log = jest.fn();
    console.error = jest.fn();
    jest.useFakeTimers();
    runDemoSequence(ri, sequence.body.id, variables);
    jest.runAllTimers();
    expect(store.dispatch).toHaveBeenCalledWith({
      type: Actions.DEMO_SET_POSITION,
      payload: { x: 0, y: 0, z: 0 },
    });
    expect(store.dispatch).toHaveBeenCalledWith({
      type: Actions.DEMO_SET_POSITION,
      payload: { x: 0, y: 0, z: 0 },
    });
    expect(store.dispatch).toHaveBeenCalledWith({
      type: Actions.DEMO_SET_POSITION,
      payload: { x: 100, y: 0, z: 0 },
    });
    expect(store.dispatch).toHaveBeenCalledWith({
      type: Actions.DEMO_SET_POSITION,
      payload: { x: 200, y: 0, z: 0 },
    });
    expect(store.dispatch).toHaveBeenCalledWith({
      type: Actions.DEMO_SET_POSITION,
      payload: { x: 300, y: 0, z: 0 },
    });
    expect(store.dispatch).toHaveBeenCalledWith({
      type: Actions.DEMO_SET_POSITION,
      payload: { x: 350, y: 0, z: 0 },
    });
    expect(store.dispatch).toHaveBeenCalledWith({
      type: Actions.DEMO_WRITE_PIN,
      payload: { pin: 8, value: 1 },
    });
    expect(store.dispatch).toHaveBeenCalledWith({
      type: Actions.DEMO_WRITE_PIN,
      payload: { pin: 8, value: 0 },
    });
    expect(info).toHaveBeenCalledWith("msg");
    expect(store.dispatch).toHaveBeenCalledWith({
      type: Actions.DEMO_SET_JOB_PROGRESS,
      payload: ["job", {
        unit: "percent",
        percent: 50,
        status: "working",
        type: "",
        file_type: "",
        updated_at: expect.any(Number),
        time: expect.any(Number),
      }],
    });
    expect(store.dispatch).toHaveBeenCalledWith({
      type: Actions.DEMO_SET_JOB_PROGRESS,
      payload: ["job", {
        unit: "percent",
        percent: 100,
        status: "Complete",
        type: "",
        file_type: "",
        updated_at: expect.any(Number),
        time: undefined,
      }],
    });
    expect(console.error).not.toHaveBeenCalled();
  });

  it("handles missing variables", () => {
    const sequence = fakeSequence();
    sequence.body.body = [{ kind: "lua", args: { lua: code } }];
    sequence.body.id = 1;
    const ri = buildResourceIndex([sequence]).index;
    console.log = jest.fn();
    console.error = jest.fn();
    jest.useFakeTimers();
    runDemoSequence(ri, sequence.body.id, undefined);
    jest.runAllTimers();
    expect(info).toHaveBeenCalledWith("msg");
    expect(console.log).toHaveBeenCalled();
    expect(console.error).not.toHaveBeenCalled();
  });

  it("handles missing sequence body", () => {
    const sequence = fakeSequence();
    sequence.body.body = undefined;
    sequence.body.id = 1;
    const ri = buildResourceIndex([sequence]).index;
    if (ri.references[0]) {
      (ri.references[0] as TaggedSequence).body.body = undefined;
    }
    console.log = jest.fn();
    console.error = jest.fn();
    jest.useFakeTimers();
    runDemoSequence(ri, sequence.body.id, undefined);
    jest.runAllTimers();
    expect(console.log).not.toHaveBeenCalled();
    expect(console.error).not.toHaveBeenCalled();
  });

  it("handles load error", () => {
    const sequence = fakeSequence();
    sequence.body.body = [{ kind: "lua", args: { lua: "!" } }];
    sequence.body.id = 1;
    const ri = buildResourceIndex([sequence]).index;
    console.log = jest.fn();
    console.error = jest.fn();
    jest.useFakeTimers();
    runDemoSequence(ri, sequence.body.id, undefined);
    jest.runAllTimers();
    expect(console.log).not.toHaveBeenCalled();
    expect(console.error).toHaveBeenCalledWith(
      "Lua load error:",
      "[string \"!\"]:1: unexpected symbol near '!'",
    );
  });

  it("handles call error", () => {
    const sequence = fakeSequence();
    sequence.body.body = [{ kind: "lua", args: { lua: "return blah + 5" } }];
    sequence.body.id = 1;
    const ri = buildResourceIndex([sequence]).index;
    console.log = jest.fn();
    console.error = jest.fn();
    jest.useFakeTimers();
    runDemoSequence(ri, sequence.body.id, undefined);
    jest.runAllTimers();
    expect(console.log).not.toHaveBeenCalled();
    expect(console.error).toHaveBeenCalledWith(
      "Lua call error:",
      "[string \"return blah + 5\"]:1: attempt to perform arithmetic " +
      "on a nil value (global 'blah')",
    );
  });
});
