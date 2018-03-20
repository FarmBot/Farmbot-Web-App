module Sequences
  class Update < Mutations::Command
    include CeleryScriptValidators
    using CanonicalCeleryHelpers
    UNKNOWN = "Unknown validation issues."

    required do
      model :device, class: Device
      model :sequence, class: Sequence
    end

    optional do
      string :name
      color
      args
      body
    end

    def validate
      validate_sequence
      raise Errors::Forbidden unless device.sequences.include?(sequence)
    end

    def execute
      ActiveRecord::Base.transaction do
        sequence.migrated_nodes = true
        sequence.update_attributes!(inputs.except(:sequence, :device))
        params = {sequence: sequence, args: args || {}, body: body || []}
        CeleryScript::StoreCelery.run!(params)
      end
      CeleryScript::FetchCelery.run!(sequence: sequence.reload)
    rescue ActiveRecord::RecordInvalid => e
      add_error :other, :unknown, (e.try(:message) || UNKNOWN)
    end
  end
end
