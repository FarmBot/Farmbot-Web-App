# Devices 1 and 2 are just some SkyNet devices I registered. Go nuts.
window.device1 =
  type: "farmbot"
  uuid: "713c69b1-e36a-11e3-93f8-f3e7e8d1cce9"
  token: "0waw1l97lbwc23xrh0oem7d8rbai3sor"
  protocol: "websocket"

window.device2 =
  type: "farmbot"
  uuid: "77d51a61-e36a-11e3-93f8-f3e7e8d1cce9"
  token: "00r57sfqx8orms4i6m28ldac6su7hkt9"
  protocol: "websocket"

window.fake_message1 =
  devices: device2.uuid
  payload:
    message_type: 'single_command'
    time_stamp: new Date()
    command:
      action: 'MOVE RELATIVE'
      x: 100
      y: 0
      z: 0
      speed: 100
      amount: null
      delay: 0

window.fake_message2 =
  devices: device1.uuid
  payload:
    message_type: 'single_command'
    time_stamp: new Date()
    command:
      action: 'MOVE RELATIVE'
      x: 100
      y: 0
      z: 0
      speed: 100   # Not sure about this one.
      amount: null # Is this for "DOSE WATER"?
      delay: 0

window.start_skynet = ->
  device = prompt 'Which device are you using? 1 or 2'
  device = eval("device#{device}")
  window.conn = skynet.createConnection(device)
  conn.on "ready", (data) ->
          console.log "Ready"
          conn.on "message", (data) ->
            console.log data
          conn.status (data) ->
            console.log data