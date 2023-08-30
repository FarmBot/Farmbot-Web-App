import { API } from "../api";
import { toastErrors } from "../toast_errors";
import { SequenceBodyItem } from "farmbot";
import { first, noop } from "lodash";
import { store } from "../redux/store";

export interface RequestAutoGenerationProps {
  prompt?: string;
  sequenceId?: number;
  contextKey: string;
  onUpdate(data: string): void;
  onSuccess(data: string): void;
  onError(): void;
}

export const requestAutoGeneration = (props: RequestAutoGenerationProps) => {
  fetch(API.current.aiPath, {
    method: "post",
    headers: {
      Authorization: `Bearer: ${store.getState().auth?.token.encoded}`,
    },
    body: JSON.stringify({
      prompt: props.prompt,
      sequence_id: props.sequenceId,
      context_key: props.contextKey,
    }),
  })
    .then(response => {
      if (response.ok && response.body) {
        const reader = response.body.getReader();
        const decoder = new TextDecoder("utf-8");
        const output = "";
        return readStream({
          reader, decoder, output,
          onUpdate: props.onUpdate,
          onSuccess: props.onSuccess,
        });
      } else {
        props.onError();
        toastErrors({ err: { response: { data: response.statusText } } });
        return Promise.reject(response);
      }
    })
    .catch(noop);
};

interface ReadStreamProps {
  reader: ReadableStreamDefaultReader<Uint8Array>;
  decoder: TextDecoder;
  output: string;
  onUpdate(data: string): void;
  onSuccess(data: string): void;
}

const readStream = (props: ReadStreamProps): Promise<void> | undefined => {
  const { reader, decoder, onUpdate, onSuccess } = props;
  let { output } = props;
  return reader.read()
    .then(({ done, value }) => {
      if (done) {
        onSuccess(extractLuaCode(output));
        reader.cancel();
        return;
      }
      const chunk = decoder.decode(value);
      output += chunk;
      onUpdate(output);
      return readStream({ ...props, output });
    })
    .catch(noop);
};

export const extractLuaCode = (generatedOutput: string) => {
  if (!generatedOutput.includes("```lua")) { return generatedOutput; }
  const luaCode = generatedOutput.split("```lua")[1].split("```")[0].trim();
  return luaCode;
};

export const PLACEHOLDER_PROMPTS = [
  "Write me code that uses the API to add a grid of points starting at"
  + " coordinates (100,100,0) and going to (200,300,0), spaced apart by"
  + " 100mm in the X and Y and directions. The points should be blue and"
  + " have a radius of 25.",
  "Move FarmBot over an XY grid of points starting at (0,0,0) and ending"
  + " at the max X and max Y coordinates of the garden. Grid points should"
  + " have a spacing of 150mm. At each point, take a photo. Track the"
  + " percent completion with a job.",
  "Move in a 200mm diameter circle centered around a location"
  + " variable named \"Plant\", stopping at 10 different points along"
  + " the circle. The Z coordinate value should be 0 for all points. At"
  + " each point, turn on the lights, then take a photo, and then turn"
  + " the lights off. Track the percent completion with a job.",
  "Move FarmBot to the center of the bed (halfway of the max X and max Y)."
  + " Then move in a spiral motion outwards, stopping at points along the"
  + " spiral. Each point should increase in angle by 15 degrees and"
  + " increase in distance from the center by 5mm. Continue until the"
  + " FarmBot reaches a point that is 300mm from the center.",
  "Move FarmBot in a high resolution 10mm grid centered on a location"
  + " variable named \"Plant\". The grid should be 100mm by 100mm, with all"
  + " grid points having a Z value of 0. Take a photo at each grid point.",
];

export const retrievePrompt = (step: SequenceBodyItem): string => {
  if (step.kind != "lua") { return ""; }
  const body = step.body || [];
  const promptPair = first(body.filter(x =>
    x.kind == "pair" && x.args.label == "prompt"));
  return promptPair ? "" + promptPair.args.value : "";
};
