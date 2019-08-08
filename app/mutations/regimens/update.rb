module Regimens
  class Update < Mutations::Command
    include FarmEvents::FragmentHelpers
    using Sequences::CanonicalCeleryHelpers
    BAD_RECORD = "Failed to instantiate nested RegimenItem. Offending item: "

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

    def execute
      Regimen.auto_sync_debounce do
        ActiveRecord::Base.transaction do
          regimen.regimen_items.destroy_all
          inputs[:regimen_items].map! do |ri|
            RegimenItem.new(ri).tap { |r| r.validate! }
          end
          handle_body_field
          regimen.update_attributes!(inputs.slice(:name, :color, :regimen_items))
          regimen
        end
      end
    rescue ActiveRecord::RecordInvalid => e
      offender = e.record.as_json.slice("time_offset", "sequence_id").to_s
      add_error :regimen_items, :probably_bad, BAD_RECORD + offender
    end
  end
end

Regimina ||= Regimens # Lol, inflection errors
