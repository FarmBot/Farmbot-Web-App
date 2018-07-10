# Support Table

Not all resources support the experimental resource API.

|Resource                |Delete?  |Upsert?  |
|------------------------|---------|---------|
| DeviceConfig           |No       |No       |
| DiagnosticDump         |No       |No       |
| FarmEvent              |No       |No       |
| FarmwareInstallations  |No       |No       |
| Image                  |No       |No       |
| Log                    |No       |No       |
| Peripheral             |No       |No       |
| PinBinding             |No       |No       |
| PlantTemplate          |No       |No       |
| Point                  |No       |No       |
| Regimen                |No       |No       |
| SavedGarden            |No       |No       |
| SensorReading          |No       |No       |
| Sensor                 |No       |No       |
| Sequence               |No       |No       |
| Tool                   |No       |No       |
| WebcamFeed             |No       |No       |

# Delete

Delete multiple resources by sending an MQTT message to `bot/deivce_x/resources/delete`:

The JSON follows the format of:

```
[
  {
    "kind": "delete",
    "uuid": "any_unique_string",
    "args": {
      "resource_type": "SEE_RESOURCE_COLUMN_IN_TABLE_ABOVE",
      "resource_id": 123
    }
  }
]
```
