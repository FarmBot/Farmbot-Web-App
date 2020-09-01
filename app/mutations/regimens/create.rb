module Regimens
  class Create < Mutations::Command
    include FarmEvents::FragmentHelpers
    include Regimens::Helpers
    using Sequences::CanonicalCeleryHelpers

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

    optional { body }

    def validate
      validate_regimen_items!
    end

    def execute
      Regimen.auto_sync_debounce do
        ActiveRecord::Base.transaction do
          inputs[:regimen_items].map! do |i|
            RegimenItem.new(i)
          end
          wrap_fragment_with(Regimen.create!(inputs.except(:body)))
        end
      end
    end
  end
end

Regimina ||= Regimens # Lol, inflection errors
