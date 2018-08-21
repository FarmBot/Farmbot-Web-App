module Resources
  DEVICE_REGEX = /device_\d*/
  ACTIONS      = [ DESTROY = "destroy", SAVE = "save" ]

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
    "Sensor"                => Sensor,
    "SensorReading"         => SensorReading,
    "Sequence"              => Sequence,
    "Tool"                  => Tool,
    "WebcamFeed"            => WebcamFeed,
  }
end # Resources
