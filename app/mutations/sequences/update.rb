module Sequences
  class Update < Mutations::Command
    include CeleryScriptValidators
    using CanonicalCeleryHelpers
    BLACKLIST = [:sequence, :device, :args, :body]

    required do
      model :device, class: Device
      model :sequence, class: Sequence
      string :name
      # HISTORICAL NOTE ========================================================
      # Originally, `args` and `body` were optional. We stored them in a
      args # serialized column and it was very inexpensive to retrieve them
      body # from the database. Serialized columns led to an enormous amount of
      # issues in other parts of the app, however. One of the tradeoffs that we
      # now face is that we can no longer call `sequence.args` and
      # `sequence.body` as quickly as in the old days. It also means these
      # fields are now mandatory for sequence updates.
      #
      # In the long term, the app benefits from the new storage mechanism
      # because it is easier to track sequence dependencies, migrate deprecated
      # sequences, and also to query for data inside of a sequence (nearly
      # impossible under the old database schema).
      #
      # END HISTORICAL NOTE ================================================== ^
    end

    optional do
      color
    end

    def validate
      validate_sequence
      # regimens_cant_have_parameters
      # farm_events_cant_have_parameters
      raise Errors::Forbidden unless device.sequences.include?(sequence)
    end

    def execute
      Sequence.auto_sync_debounce do
        ActiveRecord::Base.transaction do
          sequence.migrated_nodes = true
          sequence.update_attributes!(inputs.except(*BLACKLIST))
          CeleryScript::StoreCelery.run!(sequence: sequence,
                                         args: args,
                                         body: body)
        end
        sequence
      end
      CeleryScript::FetchCelery.run!(sequence: sequence, args: args, body: body)
    end

    BASE = "Can't add 'parent' to sequence because "
    EXPL = {
      FarmEvent => BASE + "it is in use by FarmEvents on these dates: %{items}",
      Regimen => BASE + "the following Regimen(s) are using it: %{items}",
    }
  end
end
