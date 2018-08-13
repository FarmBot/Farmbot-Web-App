module Sequences
  # Odds-and-ends that we need during the transition to variables
  # in celery script.
  module TransitionalHelpers
    PARAMTERS_NOT_ALLOWED = "Sequences that use a 'parent' parameter must be "\
                            "wrapped in a parent sequence which uses the "\
                            "'execute' block"

    def no_parameterized_regimen_items_plz
      guard_against_paramter_use(regimen_items.pluck(:sequence_id).uniq)
    end

    def guard_against_paramter_use(ids)
      cant_use_parameters if Sequence.parameterized?(ids)
    end

    def cant_use_parameters
      add_error :sequence, :sequence, PARAMTERS_NOT_ALLOWED
    end
  end
end
