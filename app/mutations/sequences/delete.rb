module Sequences
  class Delete < Mutations::Command

    required do
      model :device, class: Device
      model :sequence, class: Sequence
    end

    def validate
      regimen_items = RegimenItem.joins(:sequence, :regimen).where(sequence_id: sequence.id )
      binding.pry
      if regimen_items.count > 0 
        names = regimen_items.map(&:sequence).map(&:name).join(", ")
        add_error(:sequence, :required, "The following regimes are still using this sequence: " + names)
      end
    end

    def execute
       sequence.destroy!
       return ""
    end
  end
end
