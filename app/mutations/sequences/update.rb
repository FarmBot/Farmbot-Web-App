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
      ActiveRecord::Base.transaction do
        sequence.migrated_nodes = true
        sequence.update_attributes!(inputs.except(*BLACKLIST))
        CeleryScript::StoreCelery.run!(sequence: sequence,
                                       args:     args,
                                       body:     body)
      end
      sequence.manually_sync! # We must manually sync this resource.
      CeleryScript::FetchCelery
        .run!(sequence: sequence, args: args, body: body)
    end

    BASE = "Can't add 'parent' to sequence because "
    EXPL = {
      FarmEvent => BASE + "it is in use by FarmEvents on these dates: %{items}",
      Regimen   => BASE + "the following Regimen(s) are using it: %{items}",
    }

    # TODO: Bring this back after "sequence variables" rollout. - RC 12 SEP 2018
    # def regimens_cant_have_parameters
    #   maybe_stop_parameter_use(resource: Regimen,
    #                            items: Regimen
    #                            .includes(:regimen_items)
    #                            .where(regimen_items: {sequence_id: sequence.id})
    #                            .map(&:fancy_name))
    # end

    # TODO: Bring this back after "sequence variables" rollout. - RC 12 SEP 2018
    # def farm_events_cant_have_parameters
    #   maybe_stop_parameter_use(resource: FarmEvent,
    #                            items: FarmEvent
    #                             .where(executable: sequence)
    #                             .map(&:fancy_name))
    # end

    # TODO: Bring this back after "sequence variables" rollout. - RC 12 SEP 2018
    # def maybe_stop_parameter_use(resource:, items:)
    #   add_error :sequence, :sequence, EXPL.fetch(resource) % {
    #     resource: resource,
    #     items: items.join(", ")
    #   } if items.present?
    # end
  end
end
