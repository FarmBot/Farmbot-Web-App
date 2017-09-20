import { TaggedWebcamFeed } from "../../resources/tagged_resources";

export interface WebcamPanelProps {
  onToggle(): void;
  feeds: TaggedWebcamFeed[];
  init(): void;
  edit(tr: TaggedWebcamFeed, changes: Partial<typeof tr.body>): void;
  save(tr: TaggedWebcamFeed): void;
  destroy(tr: TaggedWebcamFeed): void;
}
