module Regimens
  class Update < Mutations::Command
    using MongoidRefinements

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

    def execute
      ActiveRecord::Base.transaction do
        regimen.regimen_items.destroy_all
        inputs[:regimen_items].map! do |ri|
          RegimenItem.new(ri).tap{ |r| r.validate! }
        end
        regimen.update_attributes!(inputs.slice(:name, :color, :regimen_items))
      end

      regimen

    rescue ActiveRecord::RecordInvalid => e
      offender = e.record.as_json.slice("time_offset", "sequence_id").to_s
      add_error :regimen_items,
                :probably_bad,
                "Failed to instantiate nested RegimenItem. Offending item: " + offender
    end
  end
end
