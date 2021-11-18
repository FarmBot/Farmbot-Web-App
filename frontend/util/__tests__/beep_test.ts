import { MessageType } from "../../sequences/interfaces";
import { beep } from "../beep";

describe("beep()", () => {
  window.AudioContext = jest.fn(() => ({
    createOscillator: jest.fn(() => ({
      connect: jest.fn(),
      start: jest.fn(),
      stop: jest.fn(),
      frequency: { value: 0 },
    })),
    createGain: jest.fn(() => ({
      connect: jest.fn(),
      gain: { value: 0 },
    })),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  })) as any;

  it("beeps: success", () => {
    const result = beep(MessageType.success);
    expect(result).toEqual({ wave: "sine", freq: 440, vol: 1, duration: 0.2 });
  });

  it("beeps: error", () => {
    const result = beep(MessageType.error);
    expect(result).toEqual({ wave: "square", freq: 220, vol: 1, duration: 0.1 });
  });

  it("beeps: warn", () => {
    const result = beep(MessageType.warn);
    expect(result).toEqual({ wave: "square", freq: 220, vol: 1, duration: 0.1 });
  });
});
