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
        # Possible nonsense ahead:
        #  Theory: In production today, we were doing some nonsense where we
        #          Store data in sequence.body and sequence.args, save it to the
        #          DB, pull it back out, convert it to a Hash
          seq = Sequence.create!(inputs.merge(migrated_nodes: true))
          CeleryScript::FirstPass.run!( sequence: seq,
                                        args: args || {},
                                        body: body || [])
          CeleryScript::FetchCelery.run!(sequence: seq.reload) # Perf nightmare?
      end
    end
  end
end
