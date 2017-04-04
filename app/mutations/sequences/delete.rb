module Sequences
  class Delete < Mutations::Command
    IN_USE = "The following %s are still relying on this sequence: %s"

    required do
      model :device, class: Device
      model :sequence, class: Sequence
    end

    def validate
      check_if_any_regimens_using_this
      check_if_any_sequences_using_this
      check_if_any_farm_events_using_this
    end

    def execute
       sequence.destroy!
       return ""
    end
  private

    def check_if_any_sequences_using_this
      in_use = SequenceDependency.where(dependency: sequence)
      if in_use.any?
        names = in_use.map(&:sequence)
                      .uniq
                      .map(&:name)
                      .map(&:inspect)
                      .join(", ")
        msg = IN_USE % ["sequences", names]
        add_error(:sequence, :required, msg)
      end
    end

    def check_if_any_farm_events_using_this
      fes = FarmEvent.still_using(sequence)
      if fes.any?
        names = fes.pluck(:name).uniq.join(", ")
        msg = IN_USE % [ "farm events", names ]
        add_error(:sequence, :required, msg)
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
