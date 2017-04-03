module Sequences
  class JustValidate < Mutations::Command
    include CeleryScriptValidators

    required do
      duck :body, methods: [:[], :[]=, :each, :map]
      string :name
      string :color, in: Sequence::COLORS
    end

    optional do
      model :device, class: Device
    end

    def validate
      validate_sequence
    end

    def execute
      seq = Sequence.new(inputs)
      seq.args["is_outdated"] = false
      # version is never user definable!
      # IF YOU REMOVE THIS BAD STUFF WILL HAPPEN:
      seq.args["version"]     = SequenceMigration::Base.latest_version
      # See comment above ^
      ActiveRecord::Base.transaction do
        seq.save!
        reload_dependencies(seq)
      end
      seq
    end
  end
end
