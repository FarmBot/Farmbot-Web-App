import { greaterThan, lessThan, mcuParamValidator } from "../update_interceptor";

describe("greaterThan() and lessThan()", () => {
  it("checks that a value is `greater than` another", () => {
    const params = {
      movement_min_spd_x: 23
    };
    const comparison = greaterThan("movement_min_spd_x");
    expect(comparison("movement_max_spd_x", 25, params)).toBe(true);
    params.movement_min_spd_x = 25;
    expect(comparison("movement_max_spd_x", 25, params)).toBe(false);
    params.movement_min_spd_x = 26;
    expect(comparison("movement_max_spd_x", 25, params)).toBe(false);
  });

  it("checks that a value is `less than` another", () => {
    const params = {
      movement_min_spd_x: 23
    };

    const comparison = lessThan("movement_min_spd_x");
    expect(comparison("movement_max_spd_x", 25, params)).toBe(false);
    params.movement_min_spd_x = 25;
    expect(comparison("movement_max_spd_x", 25, params)).toBe(false);
    params.movement_min_spd_x = 26;
    expect(comparison("movement_max_spd_x", 25, params)).toBe(true);
  });
});

describe("mcuParamValidator()", () => {
  it("stops a bad value for movement_max_spd_y", () => {
    const state = {
      movement_min_spd_y: 20,
      movement_max_spd_y: 40
    };
    const validate = mcuParamValidator("movement_max_spd_y", 15, state);
    const ok = jest.fn();
    const no = jest.fn();
    validate(ok, no);
    expect(no).toHaveBeenCalled();
    expect(ok).not.toHaveBeenCalled();
  });

  it("allows a permissible value for movement_max_spd_y", () => {
    const state = {
      movement_min_spd_y: 20,
      movement_max_spd_y: 40,
    };
    const validate = mcuParamValidator("movement_max_spd_y", 55, state);
    const ok = jest.fn();
    const no = jest.fn();
    validate(ok, no);
    expect(ok).toHaveBeenCalled();
    expect(no).not.toHaveBeenCalled();
  });

  it("builds a validator for movement_min_spd_x", () => {

  });
});
