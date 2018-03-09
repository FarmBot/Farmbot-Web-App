import { TaggedImage } from "../../resources/tagged_resources";

export interface Image {
  id: number;
  device_id: number;
  attachment_processed_at: string | undefined;
  updated_at: string;
  created_at: string;
  attachment_url: string;
  meta: {
    x: number | undefined;
    y: number | undefined;
    z: number | undefined;
    name?: string;
  };
}

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
}
