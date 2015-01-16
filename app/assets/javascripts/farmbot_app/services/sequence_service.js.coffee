sequenceFactory = (DS) ->
DS.defineResource
  name: "user"
  relations:
    hasMany:
      step:
        localField: "steps"
        foreignKey: "sequence_id"

angular.module("FarmBot").factory 'Sequences', [
  'DS',
  sequenceFactory
]
