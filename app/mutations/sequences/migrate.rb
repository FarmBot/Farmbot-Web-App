module Sequences
  class Migrate < Mutations::Command
    required do
      model :device, class: Device
      model :sequence, class: Sequence
    end

    optional do
      boolean :save, default: false
    end

    def validate
    end

    def execute
      theirs = sequence.args["version"]
      ours   = SequenceMigration::Base.latest_version
      if theirs != ours
        SequenceMigration::Base.generate_list(sequence).map(&:run)
        sequence.args["is_outdated"] = true
      end
      sequence
    end
  end
end
