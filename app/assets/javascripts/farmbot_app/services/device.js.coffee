app = angular.module("FarmBot")

deviceService = (Restangular) ->
  class Device
    constructor: (@name = '', @uuid = '', @token = '') ->

  return Device

app.service "DeviceService", [
  "Restangular"
  deviceService
  ]