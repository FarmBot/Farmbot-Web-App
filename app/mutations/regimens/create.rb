module Regimens
  class Create < Mutations::Command
    include Sequences::TransitionalHelpers

    required do
      model  :device, class: Device
      string :name
      string :color, in: Sequence::COLORS
      array  :regimen_items do
        hash do
          integer :time_offset
          integer :sequence_id
        end
      end
    end

    def validate
      no_parameterized_regimen_items_plz
    end

    def execute
      inputs[:regimen_items].map! do |i|
        RegimenItem.new(i)
      end
      Regimen.create!(inputs)
    end
  end
end
Regimina ||= Regimens # Lol, inflection errors
