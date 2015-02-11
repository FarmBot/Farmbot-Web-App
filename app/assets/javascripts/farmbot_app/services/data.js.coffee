# RESTful data adapter for hooking angular JS into the backend API.
# Checkout "js-data-angular" docs for more info.
data = (DS) ->
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
    idAttribute: "_id"
    relations:
      hasMany:
        step:
          localField: "steps"
          foreignKey: "sequence_id"

  return DS

angular.module("FarmBot").service 'Data', [
  'DS',
  data
]
