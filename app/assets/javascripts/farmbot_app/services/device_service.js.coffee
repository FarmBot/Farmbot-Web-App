Device = (Restangular) ->
  class Device
    constructor: () ->
      @all = @fetchAll
    fetchAll: ->
      Restangular.all("devices").getList().$object

angular.module('FarmBot').service 'Device',[
  'Restangular'
  Device
]

