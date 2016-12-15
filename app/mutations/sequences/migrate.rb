module Sequences
  class Migrate < Mutations::Command
    required do
      model :device, class: Device
      model :sequence, class: Sequence
    end

    def validate
    end

    def execute
      theirs = sequence.args["version"]
      ours   = SequenceMigration.latest_version
      if theirs == ours
        return sequence
      else
        SequenceMigration
          .generate_list(sequence)
          .map(&:run)
      end
    end
  end
end
