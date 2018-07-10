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
    "uuid": "123-456-whatever",
    "args": { "resource_type": "Sensor", "resource_id": 123 }
  },
  {
    "kind": "delete",
    "uuid": "123-456-whatever",
    "args": { "resource_type": "Tool", "resource_id": 456 }
  }
]
```
