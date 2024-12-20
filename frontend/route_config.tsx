import React from "react";
import { Path } from "./internal_urls";
import { Navigate, RouteObject } from "react-router";

const FarmEvents = React.lazy(() => import("./farm_events/farm_events"));
const AddFarmEvent = React.lazy(() => import("./farm_events/add_farm_event"));
const EditFarmEvent = React.lazy(() => import("./farm_events/edit_farm_event"));
const Plants = React.lazy(() => import("./plants/plant_inventory"));
const LocationInfo = React.lazy(() => import("./farm_designer/location_info"));
const SavedGardens = React.lazy(() => import("./saved_gardens/saved_gardens"));
const SelectPlants = React.lazy(() => import("./plants/select_plants"));
const Points = React.lazy(() => import("./points/point_inventory"));
const CreatePoints = React.lazy(() => import("./points/create_points"));
const EditPoint = React.lazy(() => import("./points/point_info"));
const Curves = React.lazy(() => import("./curves/curves_inventory"));
const EditCurve = React.lazy(() => import("./curves/edit_curve"));
const CropCatalog = React.lazy(() => import("./plants/crop_catalog"));
const AddPlant = React.lazy(() => import("./plants/add_plant"));
const CropInfo = React.lazy(() => import("./plants/crop_info"));
const PlantInfo = React.lazy(() => import("./plants/plant_info"));
const AddGarden = React.lazy(() => import("./saved_gardens/garden_add"));
const EditGarden = React.lazy(() => import("./saved_gardens/garden_edit"));
const DesignerControls = React.lazy(() => import("./controls/controls"));
const SetupWizard = React.lazy(() => import("./wizard/index"));
const DesignerSensors = React.lazy(() => import("./sensors/sensors"));
const DesignerPhotos = React.lazy(() => import("./photos/photos"));
const DesignerFarmwareList = React.lazy(() => import("./farmware/panel/list"));
const DesignerFarmwareAdd = React.lazy(() => import("./farmware/panel/add"));
const DesignerFarmwareInfo = React.lazy(() => import("./farmware/panel/info"));
const DesignerSequenceList = React.lazy(() => import("./sequences/panel/list"));
const DesignerSequenceEditor = React.lazy(() => import("./sequences/panel/editor"));
const DesignerSequencePreview = React.lazy(() => import("./sequences/panel/preview"));
const DesignerRegimenList = React.lazy(() => import("./regimens/list/list"));
const DesignerRegimenScheduler = React.lazy(() => import("./regimens/bulk_scheduler/scheduler"));
const DesignerRegimenEditor = React.lazy(() => import("./regimens/editor/editor"));
const MessagesPanel = React.lazy(() => import("./messages/messages"));
const SoftwareDocsPanel = React.lazy(() => import("./help/documentation/software"));
const DeveloperDocsPanel = React.lazy(() => import("./help/documentation/developer"));
const GenesisDocsPanel = React.lazy(() => import("./help/documentation/genesis"));
const ExpressDocsPanel = React.lazy(() => import("./help/documentation/express"));
const MetaDocsPanel = React.lazy(() => import("./help/documentation/meta"));
const EducationDocsPanel = React.lazy(() => import("./help/documentation/education"));
const ToursPanel = React.lazy(() => import("./help/tours/panel"));
const SupportPanel = React.lazy(() => import("./help/support"));
const JobsPanel = React.lazy(() => import("./devices/jobs"));
const DesignerSettings = React.lazy(() => import("./settings"));
const Tools = React.lazy(() => import("./tools"));
const AddTool = React.lazy(() => import("./tools/add_tool"));
const EditTool = React.lazy(() => import("./tools/edit_tool"));
const AddToolSlot = React.lazy(() => import("./tools/add_tool_slot"));
const EditToolSlot = React.lazy(() => import("./tools/edit_tool_slot"));
const GroupListPanel = React.lazy(() => import("./point_groups/group_list_panel"));
const GroupDetail = React.lazy(() => import("./point_groups/group_detail"));
const Weeds = React.lazy(() => import("./weeds/weeds_inventory"));
const EditWeed = React.lazy(() => import("./weeds/weeds_edit"));
const Zones = React.lazy(() => import("./zones/zones_inventory"));
const AddZone = React.lazy(() => import("./zones/add_zone"));
const EditZone = React.lazy(() => import("./zones/edit_zone"));
const Logs = React.lazy(() => import("./logs"));
const Sequences = React.lazy(() => import("./sequences/sequences"));
const FarmDesigner = React.lazy(() => import("./farm_designer"));
const FourOhFour = React.lazy(() => import("./404"));

export const CHILD_ROUTES: RouteObject[] = [
  { path: Path.farmEvents(), element: <FarmEvents /> },
  { path: Path.farmEvents("add"), element: <AddFarmEvent /> },
  { path: Path.farmEvents(":farm_event_id"), element: <EditFarmEvent /> },
  { path: Path.plants(), element: <Plants /> },
  { path: Path.location(), element: <LocationInfo /> },
  { path: Path.plants("gardens"), element: <SavedGardens /> },
  { path: Path.plants("select"), element: <SelectPlants /> },
  { path: Path.points(), element: <Points /> },
  { path: Path.points("add"), element: <CreatePoints /> },
  { path: Path.points(":point_id"), element: <EditPoint /> },
  { path: Path.curves(), element: <Curves /> },
  { path: Path.curves(":curve_id"), element: <EditCurve /> },
  { path: Path.cropSearch(), element: <CropCatalog /> },
  { path: Path.cropSearch(":crop/add"), element: <AddPlant /> },
  { path: Path.cropSearch(":crop"), element: <CropInfo /> },
  { path: Path.plants(":plant_id"), element: <PlantInfo /> },
  { path: Path.savedGardens(), element: <SavedGardens /> },
  { path: Path.plantTemplates(), element: <Plants /> },
  { path: Path.plantTemplates(":plant_template_id"), element: <PlantInfo /> },
  { path: Path.savedGardens("add"), element: <AddGarden /> },
  { path: Path.savedGardens(":saved_garden_id"), element: <EditGarden /> },
  { path: Path.controls(), element: <DesignerControls /> },
  { path: Path.setup(), element: <SetupWizard /> },
  { path: Path.designer("sensors"), element: <DesignerSensors /> },
  { path: Path.photos(), element: <DesignerPhotos /> },
  { path: Path.farmware(), element: <DesignerFarmwareList /> },
  { path: Path.farmware("add"), element: <DesignerFarmwareAdd /> },
  { path: Path.farmware(":farmware_name"), element: <DesignerFarmwareInfo /> },
  { path: Path.designerSequences(), element: <DesignerSequenceList /> },
  { path: Path.designerSequences(":sequence_name"), element: <DesignerSequenceEditor /> },
  { path: Path.regimens(), element: <DesignerRegimenList /> },
  { path: Path.regimens("scheduler"), element: <DesignerRegimenScheduler /> },
  { path: Path.regimens(":regimen_name"), element: <DesignerRegimenEditor /> },
  { path: Path.messages(), element: <MessagesPanel /> },
  { path: Path.help(), element: <SoftwareDocsPanel /> },
  { path: Path.developer(), element: <DeveloperDocsPanel /> },
  { path: Path.designer("genesis"), element: <GenesisDocsPanel /> },
  { path: Path.designer("express"), element: <ExpressDocsPanel /> },
  { path: Path.designer("business"), element: <MetaDocsPanel /> },
  { path: Path.designer("education"), element: <EducationDocsPanel /> },
  { path: Path.tours(), element: <ToursPanel /> },
  { path: Path.support(), element: <SupportPanel /> },
  { path: Path.designer("jobs"), element: <JobsPanel /> },
  { path: Path.settings(), element: <DesignerSettings /> },
  { path: Path.tools(), element: <Tools /> },
  { path: Path.tools("add"), element: <AddTool /> },
  { path: Path.tools(":tool_id"), element: <EditTool /> },
  { path: Path.toolSlots("add"), element: <AddToolSlot /> },
  { path: Path.toolSlots(":tool_id"), element: <EditToolSlot /> },
  { path: Path.groups(), element: <GroupListPanel /> },
  { path: Path.groups(":group_id"), element: <GroupDetail /> },
  { path: Path.weeds(), element: <Weeds /> },
  { path: Path.weeds("add"), element: <CreatePoints /> },
  { path: Path.weeds(":point_id"), element: <EditWeed /> },
  { path: Path.zones(), element: <Zones /> },
  { path: Path.zones("add"), element: <AddZone /> },
  { path: Path.zones(":zone_id"), element: <EditZone /> },
  { path: "*", element: <FourOhFour /> },
];

export const ROUTE_DATA: RouteObject[] = [
  { path: Path.app("controls"), element: <Navigate to={Path.controls()} /> },
  { path: Path.app("messages"), element: <Navigate to={Path.messages()} /> },
  { path: Path.logs(), element: <Logs /> },
  { path: Path.sequencePage(":sequence_name"), element: <Sequences /> },
  {
    path: Path.sequenceVersion(), element: <FarmDesigner />,
    children: [{ path: "", element: <DesignerSequencePreview /> }],
  },
  {
    path: Path.sequenceVersion(":sequence_version_id"), element: <FarmDesigner />,
    children: [{ path: "", element: <DesignerSequencePreview /> }],
  },
  {
    path: Path.designer(), element: <FarmDesigner />,
    children: CHILD_ROUTES,
  },
  { path: "*", element: <FourOhFour /> },
];
