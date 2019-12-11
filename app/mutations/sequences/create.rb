module Sequences
  class Create < Mutations::Command
    include CeleryScriptValidators
    using CanonicalCeleryHelpers

    required do
      model :device, class: Device
      string :name
      body
    end

    optional do
      color
      args
      integer :folder_id
    end

    def validate
      validate_sequence
    end

    def execute
      scope_hoist = {}
      Sequence.auto_sync_debounce do
        ActiveRecord::Base.transaction do
          p = inputs
            .merge(migrated_nodes: true)
            .without(:body, :args, "body", "args")
            .merge(folder: device.folders.find_by(id: folder_id))
          seq = Sequence.create!(p)
          x = CeleryScript::FirstPass.run!(sequence: seq,
                                           args: args || {},
                                           body: body || [])
          scope_hoist[:result] = CeleryScript::FetchCelery.run!(sequence: seq)
          seq
        end
      end
      scope_hoist[:result]
    end
  end
end
