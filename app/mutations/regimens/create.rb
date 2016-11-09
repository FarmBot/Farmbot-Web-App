module Regimens
  class Create < Mutations::Command
    using LegacyRefinementsModule

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
      inputs[:regimen_items].map! do |i|
        RegimenItem.new(i)
      end
      Regimen.create!(inputs)
    end
  end
end
