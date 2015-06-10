
# GET /api/devices

### Request

```
{
  "format": "json",
  "controller": "api/devices",
  "action": "index"
}
```

### Response

```
[
  {
    "_id": "557829b2766f6c350d200000",
    "name": "makayla_yost",
    "uuid": "7b1ebadd-aa1f-4e07-9829-f81f7ebc5108",
    "token": "qj5UVWLDFa4m_WbNi6f61g"
  }
]
```



# POST /api/devices

### Request

```
{
  "user_id": "557829b5766f6c350d7b0000",
  "name": "Frank",
  "uuid": "123",
  "token": "321",
  "controller": "api/devices",
  "action": "create"
}
```

### Response

```
{
  "_id": "557829b5766f6c350d7d0000",
  "name": "Frank",
  "uuid": "123",
  "token": "321"
}
```


# DELETE /api/devices/557829b2766f6c350d220000

### Request

```
{
  "fromat": "json",
  "id": "557829b2766f6c350d220000",
  "controller": "api/devices",
  "action": "destroy"
}
```

### Response

```
 
```


# PUT /api/devices/557829b5766f6c350d800000

### Request

```
{
  "name": "Dr. Amina Rau",
  "id": "557829b5766f6c350d800000",
  "controller": "api/devices",
  "action": "update"
}
```

### Response

```
{
  "_id": "557829b5766f6c350d800000",
  "name": "Dr. Amina Rau",
  "uuid": "7b1ebadd-aa1f-4e07-9829-f81f7ebc5108",
  "token": "qj5UVWLDFa4m_WbNi6f61g"
}
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
[

]
```



# POST /api/schedules

### Request

```
{
  "sequence_id": "557829b5766f6c350d980000",
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



# PATCH /api/schedules/557829b5766f6c350d6f0000

### Request

```
{
  "schedule": {
    "repeat": "66"
  },
  "id": "557829b5766f6c350d6f0000",
  "controller": "api/schedules",
  "action": "update"
}
```

### Response

```
{
  "_id": "557829b5766f6c350d6f0000",
  "start_time": "2015-06-09T05:01:00.000Z",
  "end_time": "2015-06-12T00:01:00.000Z",
  "next_time": "2015-06-11T05:01:00.000Z",
  "repeat": 66,
  "time_unit": "daily",
  "sequence_id": "557829b5766f6c350d720000",
  "sequence_name": "Reactive systemic project",
  "calendar": [
    "2015-06-09T05:01:00.000Z"
  ]
}
```



# DELETE /api/schedules/557829b6766f6c350dad0000

### Request

```
{
  "id": "557829b6766f6c350dad0000",
  "controller": "api/schedules",
  "action": "destroy"
}
```

### Response

```
 
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
  "_id": "557829b2766f6c350d250000",
  "name": "Scare Birds",
  "color": "purple"
}
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
    "_id": "557829b2766f6c350d640000",
    "name": "Multi-tiered responsive strategy",
    "color": "pink"
  },
  {
    "_id": "557829b2766f6c350d660000",
    "name": "Reduced asymmetric budgetary management",
    "color": "purple"
  }
]
```


# GET /api/sequences/557829b1766f6c350d060000/steps/557829b1766f6c350d070000

### Request

```
{
  "sequence_id": "557829b1766f6c350d060000",
  "id": "557829b1766f6c350d070000",
  "controller": "api/steps",
  "action": "show"
}
```

### Response

```
{
  "_id": "557829b1766f6c350d070000",
  "message_type": "single_command",
  "command": {
    "action": "MOVE RELATIVE",
    "x": 1,
    "y": 2,
    "z": 3,
    "speed": 100,
    "delay": 0
  },
  "sequence_id": "557829b1766f6c350d060000",
  "position": 1
}
```


# GET /api/sequences/557829b2766f6c350d120000

### Request

```
{
  "id": "557829b2766f6c350d120000",
  "controller": "api/sequences",
  "action": "show"
}
```

### Response

```
{
  "_id": "557829b2766f6c350d120000",
  "name": "Advanced neutral frame",
  "color": "blue"
}
```


# GET /api/sequences/557829b2766f6c350d370000/steps

### Request

```
{
  "sequence_id": "557829b2766f6c350d370000",
  "controller": "api/steps",
  "action": "index"
}
```

### Response

```
[
  {
    "_id": "557829b2766f6c350d380000",
    "message_type": "single_command",
    "command": {
      "action": "MOVE RELATIVE",
      "x": 1,
      "y": 2,
      "z": 3,
      "speed": 100,
      "delay": 0
    },
    "sequence_id": "557829b2766f6c350d370000",
    "position": 1
  }
]
```


# DELETE /api/sequences/557829b2766f6c350d400000

### Request

```
{
  "id": "557829b2766f6c350d400000",
  "controller": "api/sequences",
  "action": "destroy"
}
```

### Response

```
 
```




# DELETE /api/sequences/557829b2766f6c350d510000/steps/557829b2766f6c350d520000

### Request

```
{
  "sequence_id": "557829b2766f6c350d510000",
  "id": "557829b2766f6c350d520000",
  "controller": "api/steps",
  "action": "destroy"
}
```

### Response

```
 
```



# PATCH /api/sequences/557829b2766f6c350d600000/steps/557829b2766f6c350d610000

### Request

```
{
  "step": {
    "message_type": "read_status"
  },
  "id": "557829b2766f6c350d610000",
  "sequence_id": "557829b2766f6c350d600000",
  "controller": "api/steps",
  "action": "update"
}
```

### Response

```
{
  "_id": "557829b2766f6c350d610000",
  "message_type": "read_status",
  "command": {
    "action": "MOVE RELATIVE",
    "x": 1,
    "y": 2,
    "z": 3,
    "speed": 100,
    "delay": 0
  },
  "sequence_id": "557829b2766f6c350d600000",
  "position": 1
}
```


# POST /api/sequences/557829b5766f6c350d910000/steps

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
  "sequence_id": "557829b5766f6c350d910000",
  "controller": "api/steps",
  "action": "create"
}
```

### Response

```
{
  "_id": "557829b5766f6c350d930000",
  "message_type": "move_relative",
  "command": {
    "action": "MOVE RELATIVE",
    "x": "1",
    "y": "2",
    "z": "3",
    "speed": "100",
    "delay": "0"
  },
  "sequence_id": "557829b5766f6c350d910000",
  "position": 1
}
```


# PATCH /api/sequences/557829b6766f6c350d9f0000

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
  "id": "557829b6766f6c350d9f0000",
  "controller": "api/sequences",
  "action": "update"
}
```

### Response

```
{
  "_id": "557829b6766f6c350d9f0000",
  "name": "Scare Birds",
  "color": "orange"
}
```

