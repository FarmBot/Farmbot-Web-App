import { DesignerState, DrawnPointPayl } from "../farm_designer/interfaces";
import { HelpState } from "../help/reducer";
import { RunButtonMenuOpen } from "../sequences/interfaces";

export const fakeDesignerState = (): DesignerState => ({
  selectedPoints: undefined,
  selectionPointType: undefined,
  hoveredPlant: {
    plantUUID: undefined,
  },
  hoveredPoint: undefined,
  hoveredPlantListItem: undefined,
  hoveredToolSlot: undefined,
  hoveredSensorReading: undefined,
  hoveredImage: undefined,
  hoveredSpread: undefined,
  cropSearchQuery: "",
  companionIndex: undefined,
  plantTypeChangeId: undefined,
  bulkPlantSlug: undefined,
  chosenLocation: { x: undefined, y: undefined, z: undefined },
  drawnPoint: undefined,
  openedSavedGarden: undefined,
  tryGroupSortType: undefined,
  editGroupAreaInMap: false,
  visualizedSequence: undefined,
  hoveredSequenceStep: undefined,
  hiddenImages: [],
  shownImages: [],
  hideUnShownImages: false,
  alwaysHighlightImage: false,
  showPhotoImages: true,
  showCalibrationImages: true,
  showDetectionImages: true,
  showHeightImages: true,
  hoveredMapImage: undefined,
  cameraViewGridId: undefined,
  gridIds: [],
  gridStart: { x: 100, y: 100 },
  soilHeightLabels: false,
  profileOpen: false,
  profileAxis: "x",
  profilePosition: { x: undefined, y: undefined },
  profileWidth: 100,
  profileFollowBot: false,
  cropWaterCurveId: undefined,
  cropSpreadCurveId: undefined,
  cropHeightCurveId: undefined,
  cropStage: undefined,
  cropPlantedAt: undefined,
  cropRadius: undefined,
  distanceIndicator: "",
  panelOpen: true,
  threeDTopDownView: false,
  threeDExaggeratedZ: false,
  threeDTime: undefined,
});

export const fakeHelpState = (): HelpState => ({
  currentTour: undefined,
  currentTourStep: undefined,
});

export const fakeMenuOpenState = (): RunButtonMenuOpen => ({
  component: undefined,
  uuid: undefined,
});

export const fakeDrawnPoint = (): DrawnPointPayl => ({
  name: "Fake Point",
  cx: 10,
  cy: 20,
  r: 30,
  color: "green",
  z: 0,
  at_soil_level: false,
});
