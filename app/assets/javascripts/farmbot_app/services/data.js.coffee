# RESTful data adapter for hooking angular JS into the backend API.
# Checkout "js-data-angular" docs for more info.
data = (DS, Devices) ->

  resync = (resource, data, cb) ->
    Devices.send 'sync_sequence'
    return cb(null, data) # Let JS-Data know everything is OK

  DS.defineResource
    name: "device"
    endpoint: 'devices',
    basePath: '/api',
    idAttribute: "_id",

  DS.defineResource
    name: "step"
    endpoint: 'steps',
    basePath: '/api',
    idAttribute: "_id"
    relations:
      belongsTo:
        sequence:
          localKey: 'sequence_id'
          localField: 'sequence'
          parent: true

  DS.defineResource
    name: "sequence"
    endpoint: 'sequences',
    basePath: '/api',
    idAttribute: "_id",
    afterCreate: resync,
    afterUpdate: resync,
    afterDestroy: resync,
    relations:
      hasMany:
        step:
          localField: "steps"
          foreignKey: "sequence_id"

  DS.defineResource
    name: "schedule"
    endpoint: 'schedules',
    basePath: '/api',
    idAttribute: "_id",
    afterCreate: resync,
    afterUpdate: resync,
    afterDestroy: resync

  return DS

angular.module("FarmBot").service 'Data', [
  'DS'
  'Devices'
  data
]
