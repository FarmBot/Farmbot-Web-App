module Regimens
  class Update < Mutations::Command
    BAD_RECORD = "Failed to instantiate nested RegimenItem. Offending item: "
    include Sequences::TransitionalHelpers
    include FarmEvents::FragmentHelpers
    using Sequences::CanonicalCeleryHelpers

    required do
      model :device, class: Device
      model :regimen, class: Regimen
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
      no_parameterized_regimen_items_plz
    end

    def execute
      device.auto_sync_transaction do
        ActiveRecord::Base.transaction do
          regimen.regimen_items.destroy_all
          inputs[:regimen_items].map! do |ri|
            RegimenItem.new(ri).tap{ |r| r.validate! }
          end
          regimen.update_attributes!(inputs.slice(:name, :color, :regimen_items))
        end
      end
      regimen
    rescue ActiveRecord::RecordInvalid => e
      offender = e.record.as_json.slice("time_offset", "sequence_id").to_s
      add_error :regimen_items, :probably_bad, BAD_RECORD + offender
    end
  end
end
Regimina ||= Regimens # Lol, inflection errors
