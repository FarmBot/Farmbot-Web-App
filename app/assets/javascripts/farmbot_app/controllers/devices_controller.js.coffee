# The device settings controller mostly handles MeshBlu configuration options.
# If you're storing things related to a particular device and it's not an action
# it probably belongs in here.
controller = ($scope, Data, Devices) ->
  nope = (e) -> alert 'Doh!'; console.error e
  $scope.logs = Devices.current.logs
  initBot = (data) ->
    $scope.form = data[0] || {}
    Devices.socket.on 'ready',->
      Devices.fetchLogs (d) -> $scope.logs.push(data) for data in (d.data || [])
  Data.findAll('device', {}).catch(nope).then(initBot)
  Data.bindAll 'device', {}, $scope, 'devices'
  $scope.createDevice = -> Data.create('device', $scope.form).catch(nope)

angular
.module('FarmBot')
.controller "DevicesController", ['$scope', 'Data', 'Devices', controller]
