# RESTful data adapter for hooking angular JS into the backend API. SEE:
# http://angular-data.pseudobry.com/
# TODO can I put this as a config and call DS directly?
data = (DS) ->
  DS.defineResource
    name: "step"
    endpoint: 'steps',
    baseUrl: '/api',
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
    baseUrl: '/api',
    idAttribute: "_id"
    serialize: (resourceName, data) ->
      pojo = _.clone(data)
      delete pojo.steps
      pojo
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
