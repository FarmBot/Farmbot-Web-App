module Sequences
  class Create < Mutations::Command
    include CeleryScriptValidators

    required do
      model :device, class: Device
      string :name
      duck :body, methods: [:[], :[]=, :each, :map]
    end

    optional do
      string :color, in: Sequence::COLORS
    end

    def validate
      validate_sequence
    end

    def execute
      seq = Sequence.new(inputs)
      seq.args["is_outdated"] = false
      ActiveRecord::Base.transaction do
        seq.save!
        reload_dependencies(seq)
      end
      seq
    end
  end
end
