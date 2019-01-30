import { TaggedImage, JobProgress } from "farmbot";

export interface ImageFlipperProps {
  onFlip(uuid: string | undefined): void;
  images: TaggedImage[];
  currentImage: TaggedImage | undefined;
}

export interface ImageFlipperState {
  isLoaded: boolean;
  disablePrev: boolean;
  disableNext: boolean;
}

export interface PhotosProps {
  dispatch: Function;
  images: TaggedImage[];
  currentImage: TaggedImage | undefined;
  timeOffset: number;
  imageJobs: JobProgress[];
}
