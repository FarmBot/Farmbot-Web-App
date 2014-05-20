app = angular.module("FarmBot")

deviceService = (Restangular) ->
  return {}

app.service "DeviceService", [
  "Restangular"
  deviceService
  ]