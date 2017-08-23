module Sequences
  class Update < Mutations::Command
    include CeleryScriptValidators

    required do
      model :device, class: Device
      model :sequence, class: Sequence
    end

    optional do
      duck :body, methods: [:[], :[]=, :each, :map]
      string :name
      string :color, in: Sequence::COLORS
    end

    def validate
      validate_sequence
      raise Errors::Forbidden unless device.sequences.include?(sequence)
    end

    def execute
      ActiveRecord::Base.transaction do
        sequence.args["is_outdated"] = false
        sequence.update_attributes!(inputs.except(:sequence, :device))
        reload_dependencies(sequence)
      end
      sequence
    rescue ActiveRecord::RecordInvalid => e
      m = (e.try(:message) || "Unknown validation issues.")
      add_error :other, :unknown, m
    end
  end
end
