module Sequences
  class Delete < Mutations::Command
    IN_USE = "The following %s are still relying on this sequence: %s"

    required do
      model :device, class: Device
      model :sequence, class: Sequence
    end

    def validate
      check_if_any_pin_bindings_using_this
      check_if_any_regimens_using_this
      check_if_any_sequences_using_this
      FarmEvent.if_still_using(sequence) do
        add_error :sequence, :required, FarmEvent::FE_USE
      end
    end

    def execute
       sequence.destroy!
       return ""
    end
  private

    def check_if_any_pin_bindings_using_this
      in_use = PinBinding
        .where(sequence_id: sequence.id)
        .pluck(:pin_num)
        .map { |x| "pin #{x}"}
      names = in_use.join(", ")
      msg = IN_USE % ["pin bindings", names]
      add_error(:sequence, :in_use, msg) if in_use.any?
    end

    def check_if_any_sequences_using_this
      # Finds CeleryScript nodes that are using `sequence_id` xyz, but excludes
      # nodes within the current sequence, since that would make deletion
      # impossible.

      in_use_ids = EdgeNode
        .where(kind: "sequence_id", value: sequence.id)
        .pluck(:sequence_id)
        .uniq
        .without(sequence.id)
      in_use_names = Sequence.where(id: in_use_ids)
        .pluck(:name)
        .map(&:inspect)
      if in_use_names.any?
        names = in_use_names.join(", ")
        add_error(:sequence, :in_use, (IN_USE % ["sequences", names]))
      end
    end

    def check_if_any_regimens_using_this
      regimen_items = RegimenItem
                        .joins(:sequence, :regimen)
                        .where(sequence_id: sequence.id )
      if regimen_items.count > 0
        names = regimen_items.map(&:regimen)
                             .map(&:name)
                             .uniq
                             .join(", ")
        msg = IN_USE % [ "regimens", names ]
        add_error(:sequence, :required, msg)
      end
    end
  end
end
