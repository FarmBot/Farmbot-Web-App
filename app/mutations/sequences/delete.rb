module Sequences
  class Delete < Mutations::Command

    required do
      model :device, class: Device
      model :sequence, class: Sequence
    end

    def validate
      check_if_any_regimens_using_this
      check_if_any_sequences_using_this
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
        msg = "The following sequences are still relying on this sequence: " + names
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
        msg = "The following regimens are still using this sequence: " + names
        add_error(:sequence, :required, msg)
      end
    end
  end
end
