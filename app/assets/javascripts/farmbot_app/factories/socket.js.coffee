angular.module("FarmBot").factory 'socket', ($rootScope) ->
  socket = io.connect 'wss://meshblu.octoblu.com', port: 443
  window.sockett = socket
  {
    on: (eventName, callback) ->
      socket.on eventName, ->
        args = arguments
        $rootScope.$apply -> callback.apply socket, args
    emit: (eventName, data, callback) ->
      socket.emit eventName, data, ->
        args = arguments
        $rootScope.$apply ->
          callback.apply(socket, args) if callback
    connected: -> socket.connected
  }

# io = require('socket.io-client')
# socket = io.connect('wss://meshblu.octoblu.com', port: 443)
# socket.on 'connect', ->
#   socket.on 'identify', (data) ->
#     socket.emit 'identity',
#       uuid: 'ad698900-2546-11e3-87fb-c560cb0ca47b'
#       socketid: data.socketid
#       token: 'zh4p7as90pt1q0k98fzvwmc9rmjkyb9'
#   socket.on 'notReady', (data) ->
#     if data.status == 401
#       console.log 'Device not authenticated with Meshblu'
#   socket.on 'ready', (data) ->
#     if data.status == 201
#       console.log 'Device authenticated with Meshblu'
#   # Send/Receive messages
#   socket.emit 'message', {
#     'devices': [
#       '0d3a53...847b2cc'
#       '11123...44567'
#     ]
#     'payload': 'red': 'on'
#   }, (data) ->
#     console.log data
#   socket.on 'message', (message) ->
#     console.log 'message received', message
#     # { devices: '0d3a53a0-2a0b-11e3-b09c-ff4de847b2cc',
#     # payload: { red: 'on' },
#     # fromUuid: '0d3a53a0-2a0b-11e3-b09c-ff4de847b2cc' }
#   # Sample Meshblu API calls:
#   socket.emit 'status', (data) ->
#     console.log 'status received'
#     console.log data
#     # { meshblu: 'online' }
#   # Subscribe and unsubscribe to a device's messages and events
#   socket.emit 'subscribe', {
#     'uuid': '0d3a53a0-2a0b-11e3-b09c-ff4de847b2cc'
#     'token': 'qirqglm6yb1vpldixflopnux4phtcsor'
#   }, (data) ->
#     console.log data
#     # {"api":"subscribe","socketid":"j3WWX81JwWYzaidRaNA7","fromUuid":"0d3a53a0-2a0b-11e3-b09c-ff4de847b2cc","toUuid":"0d3a53a0-2a0b-11e3-b09c-ff4de847b2cc"}
#   socket.emit 'unsubscribe', { 'uuid': '0d3a53a0-2a0b-11e3-b09c-ff4de847b2cc' }, (data) ->
#     console.log data
#     # {"api":"unsubscribe","socketid":"j3WWX81JwWYzaidRaNA7","uuid":"0d3a53a0-2a0b-11e3-b09c-ff4de847b2cc"}
#   # Register device
#   socket.emit 'register', { 'type': 'drone' }, (data) ->
#     console.log data
#     # {"type":"drone","uuid":"b34cc731-b2f2-11e3-a36b-61e66c96102e","timestamp":"2014-03-24T01:22:01.123Z","token":"3k0t96e6n9mjkyb9ncpx8um4bstc5wmi","channel":"main","online":false,"ipAddress":""}
#   # Update device
#   socket.emit 'update', {
#     'uuid': '0d3a53a0-2a0b-11e3-b09c-ff4de847b2cc'
#     'token': 'qirqglm6yb1vpldixflopnux4phtcsor'
#     'armed': true
#   }, (data) ->
#     console.log data
#     # {"uuid":"0d3a53a0-2a0b-11e3-b09c-ff4de847b2cc","armed":true,"timestamp":"2014-03-24T01:22:01.203Z"}
#   # WhoAmI?
#   socket.emit 'whoami', { 'uuid': '0d3a53a0-2a0b-11e3-b09c-ff4de847b2cc' }, (data) ->
#     console.log data
#     # {"armed":true,"channel":"main","color":"blue","ipAddress":"70.171.192.231","online":true,"protocol":"websocket","socketid":"j3WWX81JwWYzaidRaNA7","uuid":"0d3a53a0-2a0b-11e3-b09c-ff4de847b2cc"}
#   # Local devices
#   socket.emit 'localdevices', (data) ->
#     console.log data
#     # {"devices":[{"drone","uuid":"b34cc731-b2f2-11e3-a36b-61e66c96102e","timestamp":"2014-03-24T01:22:01.123Z","token":"3k0t96e6n9mjkyb9ncpx8um4bstc5wmi","channel":"main","online":false,"ipAddress":"184.98.43.115"}]}
#   # Get Public Key
#   socket.emit 'getPublicKey', '2c29013f-3bdb-413f-9753-a5e0d3fd1482', (error, data) ->
#     console.log data
#     # {"publicKey": ""LS0tLS1CRUdJTiBQVUJMSUMgS0VZLS0tLS0NCk1JR2ZNQTBHQ1NxR1NJYjNEUUVCQVFVQUE0R05BRENCaVFLQmdRQ3FHS3VrTzFEZTd6aFpqNitIMHF0alRrVnh3VENwdktlNGVDWjANCkZQcXJpMGNiMkpaZlhKL0RnWVNGNnZVcHdtSkc4d1ZRWktqZUdjakRPTDVVbHN1dXNGbmNDeldCUTdSS05VU2VzbVFSTVNHa1ZiMS8NCjNqK3NrWjZVdFcrNXUwOWxITnNqNnRRNTFzMVNQckNCa2VkYk5mMFRwMEdiTUpEeVI0ZTlUMDRaWndJREFRQUINCi0tLS0tRU5EIFBVQkxJQyBLRVktLS0tLQ==""}
#   # Claim device
#   socket.emit 'claimdevice', { 'uuid': '76537331-1ce0-11e4-861d-89322229e557' }, (data) ->
#     console.log data
#     # {"results":{"updatedExisting":true,"n":1,"connectionId":232,"err":null,"ok":1}}
#   # My devices
#   socket.emit 'mydevices', {}, (data) ->
#     console.log data
#     # {"devices":[{"drone","uuid":"b34cc731-b2f2-11e3-a36b-61e66c96102e","timestamp":"2014-03-24T01:22:01.123Z","token":"3k0t96e6n9mjkyb9ncpx8um4bstc5wmi","channel":"main","online":false,"ipAddress":"184.98.43.115"}], "eventCode": 403, "fromUuid": "c33e14c0-fd55-11e3-a290-ef9910e207d9", "timestamp": "2014-08-05T23:05:13.834Z"}
#   # Receive last 10 device events
#   socket.emit 'events', {
#     'uuid': '0d3a53a0-2a0b-11e3-b09c-ff4de847b2cc'
#     'token': 'qirqglm6yb1vpldixflopnux4phtcsor'
#   }, (data) ->
#     console.log data
#     # {"events":[{"uuid":"0d3a53a0-2a0b-11e3-b09c-ff4de847b2cc","armed":true,"timestamp":"2014-03-24T01:22:01.203Z","fromUuid":{"armed":true,"channel":"main","color":"blue","ipAddress":"70.171.192.231","online":true,"protocol":"websocket","socketid":"j3WWX81JwWYzaidRaNA7","uuid":"0d3a53a0-2a0b-11e3-b09c-ff4de847b2cc"},"eventCode":401,"id":"532f88b90db905bf09055983"}]}
#   # Store sensor data for device
#   socket.emit 'data', {
#     'uuid': 'f828ef20-29f7-11e3-9604-b360d462c699'
#     'token': 'syep2lu2d0io1or305llz5u9ijrwwmi'
#     'temperature': 55
#   }, (data) ->
#     console.log data
#   # Read sensor data from device (optional params: limit, start, finish)
#   socket.emit 'getdata', {
#     'uuid': 'f828ef20-29f7-11e3-9604-b360d462c699'
#     'token': 'syep2lu2d0io1or305llz5u9ijrwwmi'
#     'limit': 1
#   }, (data) ->
#     console.log data
