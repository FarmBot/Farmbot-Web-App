
# POST /api/device

### Request

```
{
  "name": "QQQ",
  "uuid": "157f01ae-db99-4537-87c4-fdcffbb4d933",
  "controller": "api/devices",
  "action": "create"
}
```

### Response

```
{
  "id": 316,
  "name": "QQQ",
  "uuid": "157f01ae-db99-4537-87c4-fdcffbb4d933"
}
```


# POST /api/device

### Request

```
{
  "user_id": "226",
  "name": "Frank",
  "uuid": "123",
  "controller": "api/devices",
  "action": "create"
}
```

### Response

```
{
  "id": 320,
  "name": "Frank",
  "uuid": "123"
}
```


# POST /api/device

### Request

```
{
  "name": "Frank",
  "uuid": "1e498ff8-1405-44e4-8bb9-ba62e73d77f9",
  "controller": "api/devices",
  "action": "update"
}
```

### Response

```
{
  "id": 332,
  "name": "Frank",
  "uuid": "1e498ff8-1405-44e4-8bb9-ba62e73d77f9"
}
```


# PUT /api/device

### Request

```
{
  "id": "334",
  "name": "Miss Allene Moore",
  "uuid": "1",
  "controller": "api/devices",
  "action": "update"
}
```

### Response

```
{
  "id": 308,
  "name": "Miss Allene Moore",
  "uuid": "1"
}
```


# PUT /api/device

### Request

```
{
  "uuid": "1",
  "controller": "api/devices",
  "action": "update"
}
```

### Response

```
{
  "id": 308,
  "name": "cool-leaf-947",
  "uuid": "1"
}
```


# GET /api/device

### Request

```
{
  "controller": "api/devices",
  "action": "show"
}
```

### Response

```
{
  "id": 351,
  "name": "withered-violet-551",
  "uuid": "24e46691-848d-4c0e-95bf-069e48264bc5"
}
```


# GET /api/device

### Request

```
{
  "format": "json",
  "controller": "api/devices",
  "action": "show"
}
```

### Response

```
{
  "id": 353,
  "name": "wendell.ferry",
  "uuid": "c80ae438-9f49-4ddd-a5d3-978af392e546"
}
```



# DELETE /api/device

### Request

```
{
  "id": "360",
  "fromat": "json",
  "controller": "api/devices",
  "action": "destroy"
}
```

### Response

```

```


# GET /api/regimens

### Request

```
{
  "controller": "api/regimens",
  "action": "index"
}
```

### Response

```
[
  {
    "id": 25,
    "name": null,
    "color": null,
    "device_id": 367,
    "regimen_items": [

    ]
  }
]
```


# GET /api/regimens

### Request

```
{
  "controller": "api/regimens",
  "action": "index"
}
```

### Response

```
[

]
```


# DELETE /api/regimens/24

### Request

```
{
  "id": "24",
  "controller": "api/regimens",
  "action": "destroy"
}
```

### Response

```

```



# GET /api/schedules

### Request

```
{
  "controller": "api/schedules",
  "action": "index"
}
```

### Response

```
Too big to display.
```


# POST /api/schedules

### Request

```
{
  "sequence_id": "174",
  "start_time": "2015-02-17T15:16:17.000Z",
  "end_time": "2099-02-17T18:19:20.000Z",
  "repeat": "4",
  "time_unit": "minutely",
  "controller": "api/schedules",
  "action": "create"
}
```

### Response

```
Too big to display.
```



# PATCH /api/schedules/46

### Request

```
{
  "schedule": {
    "repeat": "66"
  },
  "id": "46",
  "controller": "api/schedules",
  "action": "update"
}
```

### Response

```
{
  "id": 46,
  "start_time": "2016-09-01T05:01:00.000Z",
  "end_time": "2016-09-04T00:01:00.000Z",
  "next_time": "2016-09-03T05:01:00.000Z",
  "repeat": 66,
  "time_unit": "daily",
  "sequence_id": 163,
  "sequence_name": "Self-enabling composite help-desk",
  "calendar": [
    "2016-09-01T05:01:00.000Z"
  ]
}
```



# DELETE /api/schedules/48

### Request

```
{
  "id": "48",
  "controller": "api/schedules",
  "action": "destroy"
}
```

### Response

```

```



# GET /api/sequences

### Request

```
{
  "controller": "api/sequences",
  "action": "index"
}
```

### Response

```
[
  {
    "id": 159,
    "name": "Advanced user-facing support",
    "color": "blue",
    "steps": [
      {
        "id": 195,
        "sequence_id": 159,
        "message_type": "single_command",
        "position": 1,
        "command": {
          "action": "MOVE RELATIVE",
          "x": 1,
          "y": 2,
          "z": 3,
          "speed": 100,
          "delay": 0
        }
      }
    ]
  },
  {
    "id": 160,
    "name": "Business-focused background project",
    "color": "pink",
    "steps": [
      {
        "id": 196,
        "sequence_id": 160,
        "message_type": "single_command",
        "position": 1,
        "command": {
          "action": "MOVE RELATIVE",
          "x": 1,
          "y": 2,
          "z": 3,
          "speed": 100,
          "delay": 0
        }
      }
    ]
  }
]
```



# POST /api/sequences

### Request

```
{
  "name": "Scare Birds",
  "steps": [
    {
      "message_type": "move_relative",
      "command": {
        "action": "MOVE RELATIVE",
        "x": "1",
        "y": "2",
        "z": "3",
        "speed": "100",
        "delay": "0"
      }
    }
  ],
  "controller": "api/sequences",
  "action": "create"
}
```

### Response

```
{
  "id": 169,
  "name": "Scare Birds",
  "color": "gray",
  "steps": [
    {
      "id": 205,
      "sequence_id": 169,
      "message_type": "move_relative",
      "position": 987,
      "command": {
        "action": "MOVE RELATIVE",
        "x": "1",
        "y": "2",
        "z": "3",
        "speed": "100",
        "delay": "0"
      }
    }
  ]
}
```


# POST /api/sequences/146/steps

### Request

```
{
  "name": "Scare Birds",
  "message_type": "move_relative",
  "command": {
    "action": "MOVE RELATIVE",
    "x": "1",
    "y": "2",
    "z": "3",
    "speed": "100",
    "delay": "0"
  },
  "sequence_id": "146",
  "controller": "api/steps",
  "action": "create"
}
```

### Response

```
{
  "id": 177,
  "message_type": "move_relative",
  "command": {
    "action": "MOVE RELATIVE",
    "x": "1",
    "y": "2",
    "z": "3",
    "speed": "100",
    "delay": "0"
  },
  "sequence_id": 146,
  "position": 1
}
```



# DELETE /api/sequences/149

### Request

```
{
  "id": "149",
  "controller": "api/sequences",
  "action": "destroy"
}
```

### Response

```

```


# PATCH /api/sequences/152/steps/185

### Request

```
{
  "step": {
    "message_type": "read_status"
  },
  "id": "185",
  "sequence_id": "152",
  "controller": "api/steps",
  "action": "update"
}
```

### Response

```
{
  "id": 185,
  "message_type": "read_status",
  "command": {
    "action": "MOVE RELATIVE",
    "x": 1,
    "y": 2,
    "z": 3,
    "speed": 100,
    "delay": 0
  },
  "sequence_id": 152,
  "position": 1
}
```



# DELETE /api/sequences/154/steps/188

### Request

```
{
  "sequence_id": "154",
  "id": "188",
  "controller": "api/steps",
  "action": "destroy"
}
```

### Response

```

```



# PATCH /api/sequences/158

### Request

```
{
  "sequence": {
    "name": "Scare Birds",
    "steps": [
      {
        "message_type": "move_relative",
        "command": {
          "action": "MOVE RELATIVE",
          "x": "1",
          "y": "2",
          "z": "3",
          "speed": "100",
          "delay": "0"
        }
      }
    ]
  },
  "id": "158",
  "controller": "api/sequences",
  "action": "update"
}
```

### Response

```
{
  "id": 158,
  "name": "Scare Birds",
  "color": "orange",
  "steps": [
    {
      "id": 194,
      "sequence_id": 158,
      "message_type": "single_command",
      "position": 1,
      "command": {
        "action": "MOVE RELATIVE",
        "x": 1,
        "y": 2,
        "z": 3,
        "speed": 100,
        "delay": 0
      }
    }
  ]
}
```


# GET /api/sequences/162

### Request

```
{
  "id": "162",
  "controller": "api/sequences",
  "action": "show"
}
```

### Response

```
{
  "id": 162,
  "name": "Multi-tiered national moratorium",
  "color": "purple",
  "steps": [
    {
      "id": 198,
      "sequence_id": 162,
      "message_type": "single_command",
      "position": 1,
      "command": {
        "action": "MOVE RELATIVE",
        "x": 1,
        "y": 2,
        "z": 3,
        "speed": 100,
        "delay": 0
      }
    }
  ]
}
```


# GET /api/sequences/165/steps

### Request

```
{
  "sequence_id": "165",
  "controller": "api/steps",
  "action": "index"
}
```

### Response

```
[
  {
    "id": 201,
    "message_type": "single_command",
    "command": {
      "action": "MOVE RELATIVE",
      "x": 1,
      "y": 2,
      "z": 3,
      "speed": 100,
      "delay": 0
    },
    "sequence_id": 165,
    "position": 1
  }
]
```


# GET /api/sequences/168/steps/204

### Request

```
{
  "sequence_id": "168",
  "id": "204",
  "controller": "api/steps",
  "action": "show"
}
```

### Response

```
{
  "id": 204,
  "message_type": "single_command",
  "command": {
    "action": "MOVE RELATIVE",
    "x": 1,
    "y": 2,
    "z": 3,
    "speed": 100,
    "delay": 0
  },
  "sequence_id": 168,
  "position": 1
}
```


# POST /api/tokens

### Request

```
{
  "user": {
    "email": "lyla@dickens.io",
    "password": "password"
  },
  "controller": "api/tokens",
  "action": "create"
}
```

### Response

```
Too big to display.
```


# POST /api/users

### Request

```
{
  "password_confirmation": "Password123",
  "password": "Password123",
  "email": "merle_ullrich@bosco.biz",
  "name": "Frank",
  "controller": "api/users",
  "action": "create"
}
```

### Response

```
Too big to display.
```


