module Sequences
  class Update < Mutations::Command
    include CeleryScriptValidators
    using CanonicalCeleryHelpers
    UNKNOWN = "Unknown validation issues."
    BLACKLIST = [:sequence, :device, :args, :body]

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
        sequence.update_attributes!(inputs.except(*BLACKLIST))
        params = {sequence: sequence, args: args || {}, body: body || []}
        CeleryScript::StoreCelery.run!(params)
      end
      sequence.broadcast! # We must manually sync this resource.
      CeleryScript::FetchCelery.run!(sequence: sequence)
    rescue ActiveRecord::RecordInvalid => e
      add_error :other, :unknown, (e.try(:message) || UNKNOWN)
    end
  end
end
