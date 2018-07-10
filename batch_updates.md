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

```
{
  "$id": "http://example.com/example.json",
  "type": "array",
  "definitions": {},
  "$schema": "http://json-schema.org/draft-07/schema#",
  "items": {
    "$id": "http://example.com/example.json/items",
    "type": "object",
    "properties": {
      "kind": {
        "$id": "http://example.com/example.json/items/properties/kind",
        "type": "string",
        "title": "The Kind Schema ",
        "default": "",
        "examples": [
          "delete"
        ]
      },
      "uuid": {
        "$id": "http://example.com/example.json/items/properties/uuid",
        "type": "string",
        "title": "The Uuid Schema ",
        "default": "",
        "examples": [
          "123-456-whatever"
        ]
      },
      "args": {
        "$id": "http://example.com/example.json/items/properties/args",
        "type": "object",
        "properties": {
          "resource_type": {
            "$id": "http://example.com/example.json/items/properties/args/properties/resource_type",
            "type": "string",
            "title": "The Resource_type Schema ",
            "default": "",
            "examples": [
              "Sensor"
            ]
          },
          "resource_id": {
            "$id": "http://example.com/example.json/items/properties/args/properties/resource_id",
            "type": "integer",
            "title": "The Resource_id Schema ",
            "default": 0,
            "examples": [
              123
            ]
          }
        }
      }
    }
  }
}
```
