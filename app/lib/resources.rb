module Resources
  DEVICE_REGEX = /device_\d*/
  ACTIONS      = [
    DESTROY = "destroy"
  ]
  RESOURCES    = { # Because I don't trust Kernel.const_get
    "FarmEvent"             => FarmEvent,
    "FarmwareInstallations" => FarmwareInstallation,
    "Image"                 => Image,
    "Log"                   => Log,
    "Peripheral"            => Peripheral,
    "PinBinding"            => PinBinding,
    "PlantTemplate"         => PlantTemplate,
    "Point"                 => Point,
    "Regimen"               => Regimen,
    "SavedGarden"           => SavedGarden,
    "SensorReading"         => SensorReading,
    "Sensor"                => Sensor,
    "Sequence"              => Sequence,
    "Tool"                  => Tool,
    "WebcamFeed"            => WebcamFeed,
  }
end # Resources
