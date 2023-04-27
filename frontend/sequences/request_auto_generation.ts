import axios from "axios";
import { API } from "../api";
import { toastErrors } from "../toast_errors";

export interface RequestAutoGenerationProps {
  prompt?: string;
  sequenceId?: number;
  contextKey: string;
  onSuccess(data: string): void;
  onError(): void;
}

export const requestAutoGeneration = (props: RequestAutoGenerationProps) => {
  axios.post<string>(API.current.aiPath, {
    prompt: props.prompt,
    sequence_id: props.sequenceId,
    context_key: props.contextKey,
  })
    .then(response => props.onSuccess(response.data))
    .catch(err => {
      props.onError();
      toastErrors({ err });
    });
};

export const PLACEHOLDER_PROMPTS = [
  "Write me code that uses the API to add a grid of points starting at"
  + " coordinates (100,100,0) and going to (200,300,0), spaced apart by"
  + " 100mm in the X and Y and directions.",
  "Move FarmBot over an XY grid of points 150mm apart, starting at"
  + " (0,0,0) and ending at the maximum X and Y coordinates FarmBot"
  + " can reach. At each point, take a photo. Track the percent"
  + " completion with a job.",
  "Move in a 200mm diameter circle centered around a location"
  + " variable named “Plant”, stopping at 10 different points along"
  + " the circle. The Z coordinate value should be 0 for all points. At"
  + " each point, turn on the lights, then take a photo, and then turn"
  + " the lights off. Track the percent completion with a job.",
];
