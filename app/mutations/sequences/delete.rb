module Sequences
  class Delete < Mutations::Command

    required do
      model :device, class: Device
      model :sequence, class: Sequence
    end

    def validate
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

    def execute
       sequence.destroy!
       return ""
    end
  end
end
