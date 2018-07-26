module Sequences
  class Destroy < Mutations::Command
    IN_USE        = "Sequence is still in use by"
    THE_FOLLOWING = " the following %{resource}: %{items}"
    AND           = " and"
    # Override `THE_FOLLOWING` here.
    SPECIAL_CASES = {
      FarmEvent => " %{resource} on the following dates: %{items}"
    }

    required do
      model :device, class: Device
      model :sequence, class: Sequence
    end

    def validate
      add_error :sequence, :sequence, (IN_USE + all_deps) if all_deps.present?
    end

    def execute
      sequence.destroy!
      return ""
    end

  private

    def pin_bindings
      @pin_bindings ||= PinBinding
        .where(sequence_id: sequence.id)
        .to_a
    end

    def sibling_ids
      @sibling_ids ||= EdgeNode
        .where(kind: "sequence_id", value: sequence.id)
        .pluck(:sequence_id)
        .uniq
        .without(sequence.id)
    end

    def sibling_sequences
      @sibling_sequences ||= Sequence.find(sibling_ids).uniq
    end

    def regimens
      @regimens ||= Regimen
        .includes(:regimen_items)
        .where(regimen_items: {sequence_id: sequence.id})
        .to_a
    end

    def farm_events
      @farm_events ||= FarmEvent
        .includes(:executable)
        .where(executable: sequence)
        .uniq
        .to_a
    end

    def format_dep_list(klass, items)
      (SPECIAL_CASES[klass] || THE_FOLLOWING) % {
        resource: klass.table_name.humanize,
        items: items.map(&:fancy_name).uniq.join(", ")
      } unless items.empty?
    end

    def all_deps
      @all_deps ||= []
        .concat(farm_events)       # FarmEvent
        .concat(pin_bindings)      # PinBinding
        .concat(regimens)          # Regimen
        .concat(sibling_sequences) # Sequence
        .compact
        .group_by { |x| x.class }
        .to_a
        .map  { |(klass, items)| format_dep_list(klass, items) }
        .compact
        .join(AND)
    end
  end
end
