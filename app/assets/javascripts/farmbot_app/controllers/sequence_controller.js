function NullSequence(){
  this._id = null;
  this.steps = [];
}

var controller = function($scope, Data, Devices) {
  $scope.sequence = new NullSequence;
  $scope.operators = ['==', '>', '<', '!='];
  $scope.variables = ["x", "y", "z", "s", "busy", "last", "pin0", "pin1",
                      "pin2", "pin3", "pin4", "pin5", "pin6", "pin7", "pin8",
                      "pin9", "pin10", "pin11", "pin12", "pin13"];

  var nope = function(e) {
    alert('Doh!');
    return console.error(e);
  };

  Data.findAll('sequence', {}).catch(nope);
  Data.bindAll('sequence', {}, $scope, 'storedSequences');
  $scope.dragControlListeners = {
    orderChanged: function(event) {
      var position, step;
      position = event.dest.index;
      step = event.source.itemScope.step;
      return Data.update('step', step._id, {
        position: position
      }).catch(nope).then(function(step) {
        return $scope.load($scope.sequence);
      });
    }
  };
  var hasSequence = function() {
    var whoah = function() {
      return alert('Select or create a sequence first.');
    };
    if (!!$scope.sequence._id) {
      return true;
    } else {
      whoah();
      return false;
    }
  };
  $scope.addStep = function(message_type) {
    if (!hasSequence()) {
      return;
    }
    return Data.create('step', {
      message_type: message_type,
      sequence_id: $scope.sequence._id
    }).catch(nope);
  };
  $scope.load = function(seq) {
    return Data.loadRelations('sequence', seq._id, ['step'], {
      bypassCache: true
    }).catch(nope).then(function(sequence) {
      return $scope.sequence = sequence;
    });
  };
  $scope.addSequence = function(params) {
    if (params == null) {
      params = {};
    }
    if (params.name == null) {
      params.name = 'Untitled Sequence';
    }
    return Data.create('sequence', params).catch(nope).then(function(seq) {
      return $scope.load(seq);
    });
  };
  $scope.deleteSequence = function(seq) {
    if (!hasSequence()) {
      return;
    }
    return Data.destroy('sequence', seq._id).catch(nope).then(function() {
      return $scope.sequence = new NullSequence;
    });
  };
  $scope.saveSequence = function(seq) {
    return Data.save('sequence', seq._id).catch(nope).then(function(sequence) {
      var i, inx, len, ref, results, step;
      ref = sequence.steps;
      results = [];
      for (inx = i = 0, len = ref.length; i < len; inx = ++i) {
        step = ref[inx];
        results.push(Data.update('step', step._id, {
          command: step.command
        }).catch(function(e) {
          alert("Error saving step " + (inx + 1) + ". See console for details.");
          return console.error(e);
        }));
      }
      return results;
    });
  };
  $scope.copy = function(obj, index) {
    if (!hasSequence()) {
      return;
    }
    return Data.create('step', {
      sequence_id: $scope.sequence._id,
      message_type: obj.message_type,
      command: obj.command || {},
      position: index
    }).catch(nope);
  };
  $scope.deleteStep = function(index) {
    return Data.destroy('step', $scope.sequence.steps[index]._id).catch(nope);
  };
  return $scope.execute = function(seq) {
    var sequence;
    sequence = Data.utils.removeCircular(seq);
    return Devices.send("exec_sequence", sequence);
  };
};

angular.module('FarmBot').controller("SequenceController",
                                     ['$scope', 'Data', 'Devices', controller])
