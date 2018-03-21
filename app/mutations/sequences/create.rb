module Sequences
  class Create < Mutations::Command
    include CeleryScriptValidators
    using CanonicalCeleryHelpers

    required do
      model  :device, class: Device
      string :name
      body
    end

    optional do
      color
      args
    end

    def validate
      validate_sequence
    end

    def execute
      ActiveRecord::Base.transaction do
        p = inputs
          .merge(migrated_nodes: true)
          .without(:body, :args, "body", "args")
        seq = Sequence.create!(p)
        x = CeleryScript::FirstPass.run!(sequence: seq,
                                         args: args || {},
                                         body: body || [])
        CeleryScript::FetchCelery.run!(sequence: seq.reload) # Perf nightmare?
      end
    end
  end
end
