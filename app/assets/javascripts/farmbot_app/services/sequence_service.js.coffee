# TODO this needs to get separated into separate factories. As you can see,
# there are two resources being defined here.
sequences = (DS) ->
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
    relations:
      hasMany:
        step:
          localField: "steps"
          foreignKey: "sequence_id"

angular.module("FarmBot").factory 'Sequences', [
  'DS',
  sequences
]
