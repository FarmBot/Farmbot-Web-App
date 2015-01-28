# RESTful data adapter for hooking angular JS into the backend API. SEE:
# http://angular-data.pseudobry.com/
data = (DS) ->
  DS.defineResource
    name: "step"
    endpoint: 'steps',
    baseUrl: '/api',
    idAttribute: "_id"
    serialize: (resourceName, data) -> _.omit(data, 'sequence')
    relations:
      belongsTo:
        sequence:
          localKey: 'sequence_id'
          localField: 'sequence'
          parent: true

  DS.defineResource
    name: "sequence"
    endpoint: 'sequences',
    baseUrl: '/api',
    idAttribute: "_id"
    serialize: (resourceName, data) -> _.omit(data, 'steps')
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
