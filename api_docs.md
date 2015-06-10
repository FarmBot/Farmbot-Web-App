
# GET /api/devices

### Request

```
{"format"=>"json", "controller"=>"api/devices", "action"=>"index"}
```

### Response

```
[
  {
    "_id": "557828fa766f6c33e41e0000",
    "name": "orval.schumm",
    "uuid": "24f8a32f-975a-47b4-be52-c4e4be9d5596",
    "token": "iZD3dj_kl7YG5OQt7Qeg3w"
  }
]
```



# POST /api/devices

### Request

```
{"user_id"=>"557828ff766f6c33e49e0000", "name"=>"Frank", "uuid"=>"123", "token"=>"321", "controller"=>"api/devices", "action"=>"create"}
```

### Response

```
{
  "_id": "557828ff766f6c33e4a00000",
  "name": "Frank",
  "uuid": "123",
  "token": "321"
}
```


# PUT /api/devices/557828fc766f6c33e4810000

### Request

```
{"name"=>"Dimitri Altenwerth", "id"=>"557828fc766f6c33e4810000", "controller"=>"api/devices", "action"=>"update"}
```

### Response

```
{
  "_id": "557828fc766f6c33e4810000",
  "name": "Dimitri Altenwerth",
  "uuid": "24f8a32f-975a-47b4-be52-c4e4be9d5596",
  "token": "iZD3dj_kl7YG5OQt7Qeg3w"
}
```


# DELETE /api/devices/557828ff766f6c33e49d0000

### Request

```
{"fromat"=>"json", "id"=>"557828ff766f6c33e49d0000", "controller"=>"api/devices", "action"=>"destroy"}
```

### Response

```
 
```


# POST /api/schedules

### Request

```
{"sequence_id"=>"557828fa766f6c33e40a0000", "start_time"=>"2015-02-17T15:16:17.000Z", "end_time"=>"2099-02-17T18:19:20.000Z", "repeat"=>"4", "time_unit"=>"minutely", "controller"=>"api/schedules", "action"=>"create"}
```

### Response

```
Too big to display.
```



# GET /api/schedules

### Request

```
{"controller"=>"api/schedules", "action"=>"index"}
```

### Response

```
[

]
```




# GET /api/schedules

### Request

```
{"controller"=>"api/schedules", "action"=>"index"}
```

### Response

```
Too big to display.
```


# DELETE /api/schedules/557828fb766f6c33e4210000

### Request

```
{"id"=>"557828fb766f6c33e4210000", "controller"=>"api/schedules", "action"=>"destroy"}
```

### Response

```
 
```



# PATCH /api/schedules/557828ff766f6c33e4900000

### Request

```
{"schedule"=>{"repeat"=>"66"}, "id"=>"557828ff766f6c33e4900000", "controller"=>"api/schedules", "action"=>"update"}
```

### Response

```
{
  "_id": "557828ff766f6c33e4900000",
  "start_time": "2015-06-09T05:01:00.000Z",
  "end_time": "2015-06-12T00:01:00.000Z",
  "next_time": "2015-06-11T05:01:00.000Z",
  "repeat": 66,
  "time_unit": "daily",
  "sequence_id": "557828ff766f6c33e4930000",
  "sequence_name": "Fully-configurable methodical hardware",
  "calendar": [
    "2015-06-09T05:01:00.000Z"
  ]
}
```



# GET /api/sequences

### Request

```
{"controller"=>"api/sequences", "action"=>"index"}
```

### Response

```
[
  {
    "_id": "557828fb766f6c33e43c0000",
    "name": "Decentralized content-based hub",
    "color": "gray"
  },
  {
    "_id": "557828fb766f6c33e43e0000",
    "name": "Innovative zero tolerance superstructure",
    "color": "pink"
  }
]
```


# POST /api/sequences

### Request

```
{"name"=>"Scare Birds", "steps"=>[{"message_type"=>"move_relative", "command"=>{"action"=>"MOVE RELATIVE", "x"=>"1", "y"=>"2", "z"=>"3", "speed"=>"100", "delay"=>"0"}}], "controller"=>"api/sequences", "action"=>"create"}
```

### Response

```
{
  "_id": "557828fc766f6c33e46e0000",
  "name": "Scare Birds",
  "color": "yellow"
}
```



# POST /api/sequences/557828fb766f6c33e42f0000/steps

### Request

```
{"name"=>"Scare Birds", "message_type"=>"move_relative", "command"=>{"action"=>"MOVE RELATIVE", "x"=>"1", "y"=>"2", "z"=>"3", "speed"=>"100", "delay"=>"0"}, "sequence_id"=>"557828fb766f6c33e42f0000", "controller"=>"api/steps", "action"=>"create"}
```

### Response

```
{
  "_id": "557828fb766f6c33e4310000",
  "message_type": "move_relative",
  "command": {
    "action": "MOVE RELATIVE",
    "x": "1",
    "y": "2",
    "z": "3",
    "speed": "100",
    "delay": "0"
  },
  "sequence_id": "557828fb766f6c33e42f0000",
  "position": 1
}
```


# DELETE /api/sequences/557828fc766f6c33e4590000/steps/557828fc766f6c33e45a0000

### Request

```
{"sequence_id"=>"557828fc766f6c33e4590000", "id"=>"557828fc766f6c33e45a0000", "controller"=>"api/steps", "action"=>"destroy"}
```

### Response

```
 
```




# GET /api/sequences/557828fc766f6c33e46a0000/steps

### Request

```
{"sequence_id"=>"557828fc766f6c33e46a0000", "controller"=>"api/steps", "action"=>"index"}
```

### Response

```
[
  {
    "_id": "557828fc766f6c33e46b0000",
    "message_type": "single_command",
    "command": {
      "action": "MOVE RELATIVE",
      "x": 1,
      "y": 2,
      "z": 3,
      "speed": 100,
      "delay": 0
    },
    "sequence_id": "557828fc766f6c33e46a0000",
    "position": 1
  }
]
```


# PATCH /api/sequences/557828fc766f6c33e4740000/steps/557828fc766f6c33e4750000

### Request

```
{"step"=>{"message_type"=>"read_status"}, "id"=>"557828fc766f6c33e4750000", "sequence_id"=>"557828fc766f6c33e4740000", "controller"=>"api/steps", "action"=>"update"}
```

### Response

```
{
  "_id": "557828fc766f6c33e4750000",
  "message_type": "read_status",
  "command": {
    "action": "MOVE RELATIVE",
    "x": 1,
    "y": 2,
    "z": 3,
    "speed": 100,
    "delay": 0
  },
  "sequence_id": "557828fc766f6c33e4740000",
  "position": 1
}
```


# DELETE /api/sequences/557828fe766f6c33e4840000

### Request

```
{"id"=>"557828fe766f6c33e4840000", "controller"=>"api/sequences", "action"=>"destroy"}
```

### Response

```
 
```



# PATCH /api/sequences/557828ff766f6c33e4ae0000

### Request

```
{"sequence"=>{"name"=>"Scare Birds", "steps"=>[{"message_type"=>"move_relative", "command"=>{"action"=>"MOVE RELATIVE", "x"=>"1", "y"=>"2", "z"=>"3", "speed"=>"100", "delay"=>"0"}}]}, "id"=>"557828ff766f6c33e4ae0000", "controller"=>"api/sequences", "action"=>"update"}
```

### Response

```
{
  "_id": "557828ff766f6c33e4ae0000",
  "name": "Scare Birds",
  "color": "yellow"
}
```


# GET /api/sequences/557828ff766f6c33e4b20000/steps/557828ff766f6c33e4b30000

### Request

```
{"sequence_id"=>"557828ff766f6c33e4b20000", "id"=>"557828ff766f6c33e4b30000", "controller"=>"api/steps", "action"=>"show"}
```

### Response

```
{
  "_id": "557828ff766f6c33e4b30000",
  "message_type": "single_command",
  "command": {
    "action": "MOVE RELATIVE",
    "x": 1,
    "y": 2,
    "z": 3,
    "speed": 100,
    "delay": 0
  },
  "sequence_id": "557828ff766f6c33e4b20000",
  "position": 1
}
```


# GET /api/sequences/557828ff766f6c33e4b60000

### Request

```
{"id"=>"557828ff766f6c33e4b60000", "controller"=>"api/sequences", "action"=>"show"}
```

### Response

```
{
  "_id": "557828ff766f6c33e4b60000",
  "name": "Secured exuding knowledge base",
  "color": "pink"
}
```

