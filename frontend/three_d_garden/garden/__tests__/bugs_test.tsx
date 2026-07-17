import React from "react";
import { Image } from "@react-three/drei";
import { Mesh as ThreeMesh } from "three";
import {
  actRenderer, createRenderer, unmountRenderer,
} from "../../../__test_support__/test_renderer";
import {
  keepBugAboveSoil, ThreeDBugAttack, ThreeDBugs,
} from "../bugs";
import {
  EggKeys, getEggStatus, setEggStatus,
} from "../../../farm_designer/map/easter_eggs/status";
import { BugsButton } from
  "../../../farm_designer/map/easter_eggs/bugs";
import { FilePath } from "../../../internal_urls";

beforeEach(() => {
  jest.clearAllMocks();
  localStorage.clear();
});

describe("<ThreeDBugs />", () => {
  it("only renders when enabled", () => {
    const hidden = createRenderer(<ThreeDBugs size={[1000, 600]} />);
    expect(hidden.root.findAllByProps({ name: "bugs" })).toHaveLength(0);
    unmountRenderer(hidden);

    setEggStatus(EggKeys.BRING_ON_THE_BUGS, "true");
    const visible = createRenderer(<ThreeDBugs size={[1000, 600]} />);
    expect(visible.root.findAllByProps({ name: "bugs" })).toHaveLength(1);
    unmountRenderer(visible);
  });

  it("responds immediately to the bugs button", () => {
    const wrapper = createRenderer(<>
      <BugsButton />
      <ThreeDBugs size={[1000, 600]} />
    </>);
    expect(wrapper.root.findAllByProps({ name: "bugs" })).toHaveLength(0);
    actRenderer(() => wrapper.root.findByType("button").props.onClick());
    expect(wrapper.root.findAllByProps({ name: "bugs" })).toHaveLength(1);
    actRenderer(() => wrapper.root.findByType("button").props.onClick());
    expect(wrapper.root.findAllByProps({ name: "bugs" })).toHaveLength(0);
    unmountRenderer(wrapper);
  });

  it("renders bugs on the soil", () => {
    setEggStatus(EggKeys.BRING_ON_THE_BUGS, "true");
    const wrapper = createRenderer(<ThreeDBugs size={[1000, 600]} />);
    const bugs = wrapper.root.findAllByType(Image);
    expect(bugs).toHaveLength(10);
    bugs.map(bug => {
      expect(bug.props.url).toContain(FilePath.bug());
      expect(bug.props.position[0]).toBeGreaterThanOrEqual(-500);
      expect(bug.props.position[0]).toBeLessThanOrEqual(500);
      expect(bug.props.position[1]).toBeGreaterThanOrEqual(-300);
      expect(bug.props.position[1]).toBeLessThanOrEqual(300);
      expect(bug.props.position[2]).toEqual(1);
      expect(bug.props.scale[0]).toEqual(bug.props.scale[1]);
      expect(bug.props.frustumCulled).toEqual(false);
      expect(bug.props.grayscale).toEqual(0);
      expect(bug.props.opacity).toEqual(1);
    });
    unmountRenderer(wrapper);
  });

  it("keeps bugs above the soil without disabling occlusion", () => {
    const mesh = {
      material: { depthTest: true, depthWrite: true },
    } as ThreeMesh;
    keepBugAboveSoil(mesh);
    expect(mesh.material).toEqual(expect.objectContaining({
      depthTest: true,
      depthWrite: true,
      polygonOffset: true,
      polygonOffsetFactor: -4,
      polygonOffsetUnits: -4,
    }));
    // eslint-disable-next-line no-null/no-null
    keepBugAboveSoil(null);
  });

  it("damages, moves, and kills bugs", () => {
    setEggStatus(EggKeys.BRING_ON_THE_BUGS, "true");
    const wrapper = createRenderer(<ThreeDBugs size={[1000, 600]} />);
    const attack = wrapper.root.findByType(ThreeDBugAttack)
      .instance as ThreeDBugAttack;
    actRenderer(() => attack.setState(state => ({
      ...state,
      bugs: state.bugs.map((bug, index) =>
        index == 0 ? { ...bug, r: 101 } : bug),
    })));
    const getBug = (id: number) => wrapper.root.findAllByType(Image)
      .filter(bug => bug.props.name == `bug-${id}`)[0];
    const stopPropagation = jest.fn();
    getBug(0).props.onPointerDown({ stopPropagation });
    getBug(0).props.onPointerUp({ stopPropagation });
    actRenderer(() => getBug(0).props.onClick({ stopPropagation }));
    expect(stopPropagation).toHaveBeenCalledTimes(3);
    expect(attack.state.bugs[0]).toEqual(expect.objectContaining({
      alive: true,
      hp: 50,
    }));
    attack.state.bugs.map((bug, index) => {
      expect(bug.x).toBeGreaterThanOrEqual(0);
      expect(bug.x).toBeLessThanOrEqual(1000);
      expect(bug.y).toBeGreaterThanOrEqual(0);
      expect(bug.y).toBeLessThanOrEqual(600);
      if (index > 0) {
        actRenderer(() => attack.onClick(index));
        actRenderer(() => attack.onClick(index));
      }
    });
    expect(getEggStatus(EggKeys.BUGS_ARE_STILL_ALIVE)).toEqual("");
    actRenderer(() => attack.onClick(0));
    expect(getEggStatus(EggKeys.BUGS_ARE_STILL_ALIVE)).toEqual("false");
    expect(getEggStatus(EggKeys.LAST_BUG_TIME)).toMatch(/^\d+$/);
    const deadBug = getBug(0);
    expect(deadBug.props.grayscale).toEqual(1);
    expect(deadBug.props.opacity).toEqual(0.5);
    unmountRenderer(wrapper);
  });
});
