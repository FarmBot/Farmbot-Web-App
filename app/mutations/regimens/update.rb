module Regimens
  class Update < Mutations::Command
    using MongoidRefinements

    required do
      model :device, class: Device
      string :name
      string :color, in: Sequence::COLORS
      array :regimen_items do
        hash do
          integer :time_offset
          integer :sequence_id
        end
      end
    end

    def execute
      
    end
  end
end
