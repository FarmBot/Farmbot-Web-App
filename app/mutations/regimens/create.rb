module Regimens
  class Create < Mutations::Command
    include Sequences::TransitionalHelpers
    include FarmEvents::FragmentHelpers
    using Sequences::CanonicalCeleryHelpers

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

    optional { body }

    def validate
      no_parameterized_regimen_items_plz
    end

    def execute
      inputs[:regimen_items].map! do |i|
        RegimenItem.new(i)
      end
      wrap_fragment_with(Regimen.create!(inputs))
    end
  end
end
Regimina ||= Regimens # Lol, inflection errors
