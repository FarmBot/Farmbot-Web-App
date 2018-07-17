# Support Table

Not all resources support the experimental resource API.

|Resource               |Delete?  |Upsert?  |
|-----------------------|---------|---------|
| FarmEvent             |No       |No       |
| FarmwareInstallations |No       |No       |
| Image                 |No       |No       |
| Log                   |No       |No       |
| Peripheral            |No       |No       |
| PinBinding            |No       |No       |
| PlantTemplate         |No       |No       |
| Point                 |No       |No       |
| Regimen               |No       |No       |
| SavedGarden           |No       |No       |
| SensorReading         |No       |No       |
| Sensor                |No       |No       |
| Sequence              |No       |No       |
| WebcamFeed            |No       |No       |

# Step 1: Send the Update

Send an AMQP message in the format of:

```
bot/device_<id>/resources_v0/<action>/<resource type>/<resource_id or 0>/<Transaction UUID>
```

Example:

```
bot.device_3.resources_v0.destroy.Sequence.2.123-456
```

# Step 2(A): Get a Result

# Step 2(B): Get a Result
